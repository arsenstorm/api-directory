import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	// TODO: get the status of nudenet

	return NextResponse.json(
		{
			status: "Active",
		},
		{
			status: 200,
		},
	);
}

export async function POST(req: NextRequest) {
	// TODO: Use Nudenet to detect nudity in an image

	return NextResponse.json(
		{
			
		},
		{
			status: 200,
		},
	);
}
