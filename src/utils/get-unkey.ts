import { Unkey } from "@unkey/api";

if (!process.env.UNKEY_ROOT_KEY) {
	throw new Error("UNKEY_ROOT_KEY must be set");
}

export const unkey = new Unkey({
	rootKey: process.env.UNKEY_ROOT_KEY,
});