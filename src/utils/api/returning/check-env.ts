import { NextResponse } from "next/server";
import { checkEnv } from "@/utils/check-env";

export async function returnCheckEnv(
  config: string[],
): Promise<NextResponse | null> {
  const { check, message } = checkEnv(config ?? []);

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

  return null;
}
