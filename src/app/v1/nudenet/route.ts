// Functions
import { isApiEnabled } from "@/utils/is-api-enabled";
import { checkEnv } from "@/utils/check-env";

// Types
import { type NextRequest, NextResponse } from "next/server";

// Config
import config from "./config";

export async function POST(req: NextRequest) {
	const isEnabled = await isApiEnabled("nudenet");
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

	return NextResponse.json(data, { status: 200 });
}
