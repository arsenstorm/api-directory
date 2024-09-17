import NextAuth from "next-auth";

// Providers
import github from "next-auth/providers/github";

// Database
import { db } from "./schema.ts";
import { DrizzleAdapter } from "@auth/drizzle-adapter";

export const { handlers, signIn, signOut, auth } = NextAuth({
	adapter: DrizzleAdapter(db),
	providers: [github],
});
