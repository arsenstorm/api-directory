"use server";

import { createClient } from "@/utils/supabase/supa";

export async function getFileUrl({
  userId,
  requestId,
  fileName,
}: {
  readonly userId: string;
  readonly requestId: string;
  readonly fileName: string;
}): Promise<{
  readonly url: string | null;
  readonly error: Error | null;
}> {
  const supa = createClient();

  const { data, error } = await supa.storage.from("storage").createSignedUrl(
    `${userId}/${requestId}/${fileName}`,
    60 * 60 * 24, // valid for 1 day
  );

  if (error) {
    return {
      url: null,
      error: error,
    };
  }

  if (!data) {
    return {
      url: null,
      error: new Error("No data returned from supabase"),
    };
  }

  return {
    url: data.signedUrl,
    error: null,
  };
}
