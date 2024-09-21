import { createClient } from "@/utils/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();

  const url = new URL(request.nextUrl.origin);
  const redirectTo = url.searchParams.get("redirectTo") ?? "/account";
  url.pathname = redirectTo;

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return NextResponse.redirect(url);
  }

  const { data: { url: authUrl }, error } = await supabase.auth.signInWithOAuth(
    {
      provider: "github",
      options: {
        redirectTo: url.toString(),
      },
    },
  );

  if (error || !authUrl) {
    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(authUrl);
}
