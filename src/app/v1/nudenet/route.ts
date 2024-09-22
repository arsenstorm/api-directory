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

export async function POST(req: NextRequest) {
	const authorization = req.headers.get("authorization") ?? undefined;

	const supabase = createClient(authorization);

	const { data: { user } } = await supabase.auth.getUser();

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

	await returnIsEnabled("nudenet");

	let { estimated, actual = null } = await getEstimatedCost("nudenet");

	// NOTE: Since we're using a custom way of signing a user in with their API key,
	// we need to make sure that any Supabase RLS policies are applied to the `public` role
	// and not the `authenticated` role.
	const { data: userData, error: userError } = await supabase.from("users")
		.select("id, funds").single();

	if (userError) {
		console.error(userError);
		return NextResponse.json({
			message: "Failed to get user funds.",
		}, {
			status: 400,
		});
	}

	if (userData.funds - estimated < 0) {
		return NextResponse.json({
			message: "You don’t have enough credits.",
		}, {
			status: 400,
		});
	}

	// NOTE: If `actual` is null, we'll subtract the estimated cost,
	// then later, we'll calculate the actual cost and update the funds again.
	const updatedUserData = await updateFunds(userData, actual, estimated);

	await returnCheckEnv(config?.env ?? []);

	const requestId = await logRequest({
		userId: userData.id,
		service: "nudenet",
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
			service: "nudenet",
			status: "pending",
			requestData: body,
			encrypt,
		});

		const { url } = body;

		if (!url) {
			return NextResponse.json({
				message: "You haven't provided a URL. The `url` field is required.",
			}, {
				status: 400,
			});
		}

		// Download the image from the URL
		const imageResponse = await fetch(url);
		if (!imageResponse.ok) {
			return NextResponse.json({ message: "Failed to fetch image from URL" }, {
				status: 400,
			});
		}

		imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
		imageName = new URL(url).pathname.split("/").pop() ?? "image";
		imageType = imageResponse.headers.get("content-type") ??
			"application/octet-stream";
	} else {
		const requestFormData = await req.formData();
		const image = requestFormData.get("image") as File;
		if (!image) {
			return NextResponse.json({
				message:
					"You haven't provided an image. The `image` field is required.",
			}, {
				status: 400,
			});
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
			service: "nudenet",
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

	// Manually create the multipart/form-data body
	const boundary = `----WebKitFormBoundary${
		Math.random().toString(36).slice(2)
	}`;

	let body = `--${boundary}\r\n`;
	body +=
		`Content-Disposition: form-data; name="file"; filename="${imageName}"\r\n`;
	body += `Content-Type: ${imageType}\r\n\r\n`;

	const preamble = Buffer.from(body, "utf-8");
	const ending = Buffer.from(`\r\n--${boundary}--\r\n`, "utf-8");

	const fullBody = Buffer.concat([preamble, imageBuffer, ending]);

	try {
		const startTime = performance.now();

		const apiResponse = await fetch(
			process.env.NUDENET_URL ?? "http://localhost:8080/infer",
			{
				method: "POST",
				headers: {
					"Content-Length": fullBody.length.toString(),
					"Content-Type": `multipart/form-data; boundary=${boundary}`,
				},
				body: fullBody,
			},
		);

		const endTime = performance.now();
		const duration = endTime - startTime;

		if (!apiResponse.ok) {
			throw new Error("Failed to get response from nudenet.");
		}

		const data = await apiResponse.json();

		// Example with calculating the actual cost
		actual = Number(((duration * (estimated / 1000)) || estimated).toFixed(10));

		// update funds
		await updateFunds(userData, actual, 0);

		const response = {
			...data,
			funds: {
				remaining: updatedUserData?.[0]?.funds ?? null,
				actual,
			},
		};

		await logRequest({
			requestId,
			userId: userData.id,
			service: "nudenet",
			status: "success",
			responseData: response,
			cost: actual ?? estimated,
			encrypt,
		});

		return NextResponse.json(
			response,
			{
				status: 200,
			},
		);
	} catch (error) {
		const response = {
			message: "Failed to get response from nudenet.",
			funds: {
				remaining: updatedUserData?.[0]?.funds ?? null,
				actual: 0,
			},
		};

		await updateFunds(userData, estimated, 0, "add");

		await logRequest({
			requestId,
			userId: userData.id,
			service: "nudenet",
			status: "failed",
			responseData: response,
			cost: 0, // we don't charge for failed requests
			encrypt,
		});
		return NextResponse.json({
			message: "Failed to get response from nudenet.",
		}, {
			status: 400,
		});
	}
}
