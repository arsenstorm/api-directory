// Supabase
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/utils/supabase/supa";

// Next
import { type NextRequest, NextResponse } from "next/server";

// Utils
import * as jose from "jose";
import { unkey } from "@/utils/get-unkey";

async function signJWT(
  payload: jose.JWTPayload,
  secret: string,
): Promise<string> {
  const alg = "HS256";
  const secretKey = new TextEncoder().encode(secret);

  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer("urn:example:issuer")
    .setAudience("urn:example:audience")
    .setExpirationTime("2h")
    .sign(secretKey);

  return jwt;
}

function createResponseWithHeaders(headers: Headers) {
  return NextResponse.next({
    request: {
      headers,
    },
  });
}

export async function middleware(request: NextRequest) {
  const _headers = new Headers(request.headers);
  let response = NextResponse.next({
    request: {
      headers: _headers,
    },
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
    return await validateAPIAccess({ request, headers: _headers });
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
  headers,
}: {
  request: NextRequest;
  headers: Headers;
}) {
  const pathParts = request.nextUrl.pathname.split("/");

  const apiId = pathParts.length > 2 ? pathParts[2] : null;

  if (!apiId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const apiKey = request.headers.get("Authorization")?.split(" ")[1]; // Authorization: Bearer <api_key>
  if (!apiKey) {
    return NextResponse.json(
      {
        message:
          "Uh oh! If you’re using the Playground, make sure that you’re logged in.",
        api:
          "If you’re using the API, you’ve not added your API key to the Authorization header!",
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
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

  const token = await signJWT(
    {
      sub: ownerId,
    },
    process.env.SUPABASE_JWT_SECRET!,
  );

  headers.set("Authorization", `Bearer ${token}`);

  if (
    keyData.permissions.includes("everything") ||
    keyData.permissions.includes(apiId)
  ) {
    return createResponseWithHeaders(headers);
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
