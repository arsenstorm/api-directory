import { NextResponse } from "next/server";

const handleRequest = async () => {
	return NextResponse.json(
		{
			message: "Hello from the API Directory!",
			sponsor:
				"We’re sponsored by CyboLearn.com, which helps children learn about financial literacy!",
		},
		{
			status: 200,
		},
	);
};

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
