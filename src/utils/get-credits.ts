import { createClient } from "./supabase/server";

export async function getCredits() {
  const supabase = createClient();

  const { data, error } = await supabase.from("users").select("funds").single();

  if (error) {
    throw new Error(error.message);
  }

  return data?.funds ?? 0;
}
