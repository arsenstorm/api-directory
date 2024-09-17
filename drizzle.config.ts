import { defineConfig } from "drizzle-kit";

import dotenv from "dotenv";
dotenv.config({
	path: ".env.local",
});

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/schema.ts",
	out: "./drizzle",
	dbCredentials: {
		url: process.env.AUTH_DRIZZLE_URL ?? "",
		ssl: false,
	}
});
