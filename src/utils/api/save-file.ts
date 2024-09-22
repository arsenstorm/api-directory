"use server";

import { createClient } from "@/utils/supabase/supa";

/**
 * Saves a file to the storage bucket.
 *
 * // TODO: Add a check such that if this fails due to
 * // bucket not existing, then create the bucket.
 *
 * @param userId - The user's ID.
 * @param requestId - The request's ID.
 * @param file - The file with its name, type and buffer.
 * @returns - The success of the operation and any errors.
 */
export async function saveFile({
  userId,
  requestId,
  file,
}: {
  readonly userId: string;
  readonly requestId: string;
  readonly file: {
    readonly name: string;
    readonly type: string;
    readonly buffer: Buffer;
  };
}): Promise<{
  readonly success: boolean;
  readonly error: Error | null;
}> {
  const supa = createClient();

  const fileToSave = Buffer.from(file.buffer).toString("base64");

  const { error: imageError } = await supa.storage.from(
    "storage",
  ).upload(`${userId}/${requestId}/${file.name}`, fileToSave, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: true,
  });

  if (imageError) {
    return {
      success: false,
      error: imageError,
    };
  }

  return {
    success: true,
    error: null,
  };
}
