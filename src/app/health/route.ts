import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Actually check if the services are operational

  return NextResponse.json(
    {
      message: "All systems operational",
    },
    {
      status: 200,
    },
  );
}
