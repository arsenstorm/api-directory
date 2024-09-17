"use server";

import { auth } from "@/auth";
import { unkey } from "@/utils/get-unkey";

export async function getKey(keyId?: string) {
	const session = await auth();
	const userId = session?.user?.id ?? undefined;

	if (!userId) {
		return [];
	}

	if (!process.env.UNKEY_API_ID) {
		console.error("UNKEY_API_ID is not set - unable to get keys for user.");
		return [];
	}

	if (!keyId) {
		const keys = await unkey.apis.listKeys({
			apiId: process.env.UNKEY_API_ID,
			ownerId: userId,
		});

		return keys?.result?.keys;
	}

	const key = await unkey.keys.get({
		keyId,
	});

	if (!key.result) {
		return [];
	}

	const ownerId = key.result.ownerId;

	if (ownerId !== userId) {
		return [];
	}

	return [key.result];
}
