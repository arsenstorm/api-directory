import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/utils/supabase/supa";
import { type NextRequest, NextResponse } from "next/server";

import { unkey } from "@/utils/get-unkey";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set");
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({
            request,
          });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user &&
    request.nextUrl.pathname.startsWith("/v1")
  ) {
    return await validateAPIAccess({ request, response });
  }

  return response;
}

/**
 * This function validates API access for `/v1/*` routes.
 *
 * @returns NextResponse
 */
async function validateAPIAccess({
  request,
  response,
}: {
  request: NextRequest;
  response: NextResponse;
}) {
  const pathParts = request.nextUrl.pathname.split("/");

  const apiId = pathParts.length > 2 ? pathParts[2] : null;

  if (!apiId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const apiKey = request.headers.get("Authorization")?.split(" ")[1]; // Authorization: Bearer <api_key>
  if (!apiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.UNKEY_API_ID) {
    console.error("UNKEY_API_ID is not set - unable to get keys for user.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = await unkey.keys.verify({
    key: apiKey,
    apiId: process.env.UNKEY_API_ID,
  });

  if (key.error) {
    console.error("Unauthorized key", key.error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keyId = key.result?.keyId;
  const ownerId = key.result?.ownerId;

  const supa = createClient();

  const { data: keyData, error: keyError } = await supa.from("keys").select(
    "user_id, permissions",
  ).eq("id", keyId).maybeSingle();

  if (keyError) {
    console.error("Unauthorized key", keyError);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!keyData) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (keyData.user_id !== ownerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (keyData.permissions.includes("everything")) {
    return response;
  }

  if (keyData.permissions.includes(apiId)) {
    return response;
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
