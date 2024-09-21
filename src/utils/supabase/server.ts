import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient(authorization?: string) {
  const cookieStore = cookies();

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL
  ) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
      global: {
        headers: {
          ...(authorization ? { Authorization: authorization } : {}),
        },
      },
    },
  );
}
