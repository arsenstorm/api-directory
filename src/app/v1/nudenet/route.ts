// Functions
import { isApiEnabled } from "@/utils/is-api-enabled";
import { checkEnv } from "@/utils/check-env";

// Types
import { type NextRequest, NextResponse } from "next/server";

// Config
import config from "./config";

// Utils
import { createClient } from "@/utils/supabase/server";
import { createClient as createSupaClient } from "@/utils/supabase/supa";
import { getEstimatedCost } from "@/utils/get-estimated-cost";

export async function POST(req: NextRequest) {
	const authorization = req.headers.get("authorization") ?? undefined;

	if (!authorization) {
		return NextResponse.json(
			{
				error: "Unauthorized",
			},
			{
				status: 401,
			},
		);
	}

	const supabase = createClient(authorization);

	const isEnabled = await isApiEnabled("nudenet");
	const { estimated, actual = null } = await getEstimatedCost("nudenet");

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

	const updatedUserData = await subtractFunds(userData, actual, estimated);

	const { check, message } = checkEnv(config?.env ?? []);

	if (!isEnabled) {
		return NextResponse.json(
			{
				message: "This API is not enabled.",
			},
			{
				status: 400,
			},
		);
	}

	if (!check) {
		return NextResponse.json(
			{
				message,
			},
			{
				status: 400,
			},
		);
	}

	let imageBuffer: Buffer;
	let imageName: string;
	let imageType: string;

	const contentType = req.headers.get("content-type");

	if (contentType?.includes("application/json")) {
		const { url } = await req.json();
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

	const response = await fetch(
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

	const data = await response.json();

	// if we were hosting on Vercel, we could use the `@vercel/functions` package
	// with `waitUntil` to run some cleanup code after the response has been sent.
	//
	// However, since we're not and are working to host via Docker, we have to
	// run waitUntil in the main thread.

	return NextResponse.json(
		{ ...data, funds: updatedUserData?.[0]?.funds ?? null },
		{
			status: 200,
		},
	);
}

async function subtractFunds(
	userData: { funds: number; id: string },
	actual: number | null,
	estimated: number,
) {
	const supa = createSupaClient();

	// TODO: Calculating the `actual` cost of the API call must be done soon.
	const precision = 6;

	const safeActual = actual ? Number.parseFloat(actual.toFixed(precision)) : 0;
	const safeEstimated = estimated
		? Number.parseFloat(estimated.toFixed(precision))
		: 0;

	const newAmount = Number.parseFloat(
		(userData.funds - (safeActual ?? safeEstimated)).toFixed(precision),
	);

	// Subtract funds from user
	const { data: updatedUserData, error: updateFundsError } = await supa
		.from("users").update({
			funds: newAmount,
		}).eq("id", userData.id).select("funds");

	if (updateFundsError) {
		throw new Error("Failed to update user funds.");
	}

	return updatedUserData;
}
