"use server";

import { getConfig } from "./get-config";

export async function isApiEnabled(id: string) {
  const config = await getConfig();

  return config.apis.enabled && config.api?.[id]?.enabled;
}
