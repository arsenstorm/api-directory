import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	// TODO: get the status of the video creation tool

	return NextResponse.json(
		{
			status: "Active",
		},
		{
			status: 200,
		},
	);
}
