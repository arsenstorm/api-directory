"use server";

import type { NextRequest } from "next/server";

export async function shouldSaveEncrypt(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const noSave = searchParams.get("noSave") === "true";
  const encrypt = searchParams.get("encrypt") === "true";

  return { noSave, encrypt };
}
