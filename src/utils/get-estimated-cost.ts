import { getConfig } from "./get-config";

export async function getEstimatedCost(apiId: string) {
  const config = await getConfig();

  const api = config.api[apiId as keyof typeof config.api];

  if (!api) {
    throw new Error("API not found");
  }

  return {
    estimated: api?.pricing?.estimated ?? 0,
    actual: api?.pricing?.price ?? null,
  };
}
