"use server";

import { createClient } from "@/utils/supabase/supa";
import { encryptData } from "@/utils/api/secure-data";

/**
 * Logs the API call to the database
 *
 * @returns The request ID
 */
export async function logRequest({
  requestId,
  requestData,
  responseData,
  userId,
  cost,
  service,
  status,
  encrypt = false,
}: Readonly<{
  requestId?: string;
  requestData?: any;
  responseData?: any;
  userId: string;
  cost?: number;
  service: string;
  status: "pending" | "success" | "failed";
  encrypt?: boolean;
}>): Promise<string> {
  const supabase = createClient();

  let request = requestData;
  let response = responseData;

  if (encrypt) {
    if (requestData) {
      request = await encryptData(requestData);
    }

    if (responseData) {
      response = await encryptData(responseData);
    }
  }

  const { data, error } = await supabase.from("requests").upsert({
    id: requestId,
    request,
    response,
    user_id: userId,
    cost,
    service,
    status,
    encrypted: encrypt,
  })
    .select("id");

  const id = data?.[0]?.id;

  if (error) {
    console.error("Failed to log API call.", error, data);
    throw new Error("Failed to log API call.");
  }

  if (!id) {
    console.error("Failed to log API call.", error, data);
    throw new Error("Failed to log API call.");
  }

  return id;
}
