"use server";

import { createClient } from "@/utils/supabase/supa";
import { getFileUrl } from "./get-file-url";

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
  returnUrl = false,
}: {
  readonly userId: string;
  readonly requestId: string;
  readonly file: {
    readonly name: string;
    readonly type: string;
    readonly buffer: Buffer;
  };
  readonly returnUrl: boolean;
}): Promise<{
  readonly success: boolean;
  readonly url: string | null;
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
      url: null,
      error: imageError,
    };
  }

  if (returnUrl) {
    const { url, error } = await getFileUrl({
      userId,
      requestId,
      fileName: file.name,
    });

    if (error) {
      return {
        success: false,
        url: null,
        error: error,
      };
    }

    if (!url) {
      return {
        success: false,
        url: null,
        error: new Error("No URL returned from supabase"),
      };
    }

    return {
      success: true,
      url,
      error: null,
    };
  }

  return {
    success: true,
    url: null,
    error: null,
  };
}
