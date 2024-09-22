import { NextResponse } from "next/server";
import { isApiEnabled } from "@/utils/is-api-enabled";

export async function returnIsEnabled(
  service: string,
): Promise<NextResponse | null> {
  const isEnabled = await isApiEnabled(service);

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

  return null;
}
