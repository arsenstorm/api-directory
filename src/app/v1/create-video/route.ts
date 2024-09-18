import { isApiEnabled } from "@/actions/is-api-enabled";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const isEnabled = await isApiEnabled("create-video");

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

	return NextResponse.json(
		{
			message: "This API is not implemented yet.",
		},
		{
			status: 501,
		},
	);
}
