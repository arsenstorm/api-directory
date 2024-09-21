import { getConfig } from "@/utils/get-config";
import { NextResponse } from "next/server";

export async function GET() {
  const config = await getConfig();

  return NextResponse.json(config);
}
