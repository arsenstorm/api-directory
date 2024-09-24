// Types
import { type NextRequest, NextResponse } from "next/server";

// Config
import config from "./config";

// Utils
import { createClient } from "@/utils/supabase/server";
import { getEstimatedCost } from "@/utils/get-estimated-cost";
import { updateFunds } from "@/utils/api/update-funds";
import { logRequest } from "@/utils/api/log-request";
import { shouldSaveEncrypt } from "@/utils/api/should-save-encrypt";
import { saveFile } from "@/utils/api/files/save-file";

// Returning Utils
import { returnIsEnabled } from "@/utils/api/returning/is-enabled";
import { returnCheckEnv } from "@/utils/api/returning/check-env";

/**
 * Running the facelandmarks API is not supported on MacOS
 *
 * @param req
 * @returns
 */
export async function POST(req: NextRequest) {
	const authorization = req.headers.get("authorization") ?? undefined;

	const supabase = createClient(authorization);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json(
			{
				error: "Unauthorized",
			},
			{
				status: 401,
			},
		);
	}

	const { noSave, encrypt } = await shouldSaveEncrypt(req);

	await returnIsEnabled("facelandmarks");

	let { estimated, actual = null } = await getEstimatedCost("facelandmarks");

	// NOTE: Since we're using a custom way of signing a user in with their API key,
	// we need to make sure that any Supabase RLS policies are applied to the `public` role
	// and not the `authenticated` role.
	const { data: userData, error: userError } = await supabase
		.from("users")
		.select("id, funds")
		.single();

	if (userError) {
		console.error(userError);
		return NextResponse.json(
			{
				message: "Failed to get user funds.",
			},
			{
				status: 400,
			},
		);
	}

	if (userData.funds - estimated < 0) {
		return NextResponse.json(
			{
				message: "You don’t have enough credits.",
			},
			{
				status: 400,
			},
		);
	}

	// NOTE: If `actual` is null, we'll subtract the estimated cost,
	// then later, we'll calculate the actual cost and update the funds again.
	const updatedUserData = await updateFunds(userData, actual, estimated);

	await returnCheckEnv(config?.env ?? []);

	const requestId = await logRequest({
		userId: userData.id,
		service: "facelandmarks",
		status: "pending",
		encrypt,
	});

	let imageBuffer: Buffer;
	let imageName: string;
	let imageType: string;

	const contentType = req.headers.get("content-type");

	if (contentType?.includes("application/json")) {
		const body = await req.json();

		await logRequest({
			requestId,
			userId: userData.id,
			service: "facelandmarks",
			status: "pending",
			requestData: body,
			encrypt,
		});

		const { url } = body;

		if (!url) {
			return NextResponse.json(
				{
					message: "You haven't provided a URL. The `url` field is required.",
				},
				{
					status: 400,
				},
			);
		}

		// Download the image from the URL
		const imageResponse = await fetch(url);
		if (!imageResponse.ok) {
			return NextResponse.json(
				{ message: "Failed to fetch image from URL" },
				{
					status: 400,
				},
			);
		}

		imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
		imageName = new URL(url).pathname.split("/").pop() ?? "image";
		imageType =
			imageResponse.headers.get("content-type") ?? "application/octet-stream";
	} else {
		const requestFormData = await req.formData();
		const image = requestFormData.get("image") as File;
		if (!image) {
			return NextResponse.json(
				{
					message:
						"You haven't provided an image. The `image` field is required.",
				},
				{
					status: 400,
				},
			);
		}

		const arrayBuffer = await image.arrayBuffer();
		imageBuffer = Buffer.from(arrayBuffer);
		imageName = image.name;
		imageType = image.type;
	}

	// By default, we save the image to the database, users can opt out of this by passing ?noSave=true
	if (!noSave) {
		const { url, error } = await saveFile({
			userId: userData.id,
			requestId,
			file: {
				name: imageName,
				type: imageType,
				buffer: imageBuffer,
			},
			returnUrl: true,
		});

		if (error) {
			return NextResponse.json(
				{
					message: "Failed to upload image to storage.",
				},
				{
					status: 400,
				},
			);
		}

		await logRequest({
			requestId,
			userId: userData.id,
			service: "facelandmarks",
			status: "pending",
			// save some data about the request because
			// it's useful to store in the history
			requestData: {
				url,
				type: "form-data",
			},
			encrypt,
		});
	}

	const formData = new FormData();
	const blob = new Blob([imageBuffer], { type: imageType });
	formData.append("image", blob, imageName);

	try {
		const startTime = performance.now();

		const apiResponse = await fetch(
			process.env.FACELANDMARKS_URL ?? "http://localhost:7002/landmarks",
			{
				method: "POST",
				body: formData,
			},
		);

		const endTime = performance.now();
		const duration = endTime - startTime;

		if (!apiResponse.ok) {
			throw new Error("Failed to get response from facelandmarks.");
		}

		const data = await apiResponse.json();

		if (data?.image) {
			// we've got a base64 encoded image back
			// we should save that to the database as well
			const imageBuffer = Buffer.from(data.image, "base64");
			const imageName = `${requestId}-facelandmarks.png`;
			const imageType = "image/png";

			const { url, error } = await saveFile({
				file: {
					buffer: imageBuffer,
					name: imageName,
					type: imageType,
				},
				userId: userData.id,
				requestId,
				returnUrl: true,
			});

			if (error) {
				return NextResponse.json(
					{
						message: "Failed to save facelandmarks image to storage.",
					},
					{
						status: 400,
					},
				);
			}

			data.image = url;
		}

		// Example with calculating the actual cost
		actual = Number((duration * (estimated / 1000) || estimated).toFixed(10));

		// update funds
		await updateFunds(userData, actual, 0);

		const response = {
			...data,
			funds: {
				remaining: userData ? userData.funds - actual : null,
				actual,
			},
		};

		await logRequest({
			requestId,
			userId: userData.id,
			service: "facelandmarks",
			status: "success",
			responseData: response,
			cost: actual ?? estimated,
			encrypt,
		});

		return NextResponse.json(response, {
			status: 200,
		});
	} catch (error) {
		const response = {
			message: "Failed to get response from facelandmarks.",
			funds: {
				remaining: updatedUserData?.[0]?.funds ?? null,
				actual: 0,
			},
		};

		await updateFunds(userData, estimated, 0, "add");

		await logRequest({
			requestId,
			userId: userData.id,
			service: "facelandmarks",
			status: "failed",
			responseData: response,
			cost: 0, // we don't charge for failed requests
			encrypt,
		});
		return NextResponse.json(
			{
				message: "Failed to get response from facelandmarks.",
			},
			{
				status: 400,
			},
		);
	}
}
