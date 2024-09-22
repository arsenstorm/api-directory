// UI
import { Text } from "@/components/ui/text";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";

// Utils
import { getConfig } from "@/utils/get-config";

// Components
import { APIHistory, APIKeys, Funds } from "./page.client";

export interface Key {
	id: string;
	start: string;
	workspaceId: string;
	apiId?: string;
	name?: string;
	ownerId?: string;
	meta?: {
		[key: string]: unknown;
	};
	createdAt: number;
	updatedAt?: number;
	expires?: number;
	remaining?: number;
	refill?: {
		interval: "daily" | "monthly";
		amount: number;
		lastRefillAt?: number;
	};
	ratelimit?: {
		async: boolean;
		type?: "fast" | "consistent";
		limit: number;
		refillRate?: number;
		refillInterval?: number;
		duration: number;
	};
	roles?: string[];
	permissions?: string[];
	enabled?: boolean;
	plaintext?: string;
	identity?: {
		id: string;
		externalId: string;
		meta?: {
			[key: string]: unknown;
		};
	};
}

export default async function AccountPage() {
	const permissionsConfig = Object.entries((await getConfig()).api).map(
		([name, api]) => ({
			name: api?.name ?? name,
			id: name,
		}),
	);

	return (
		<main>
			<Heading>My Account</Heading>
			<Text>View and manage your account information and settings.</Text>
			<Divider className="my-4" />
			<Funds />
			<Divider className="my-8" />
			<APIKeys permissionsConfig={permissionsConfig} />
			<Divider className="my-8" />
			<APIHistory />
		</main>
	);
}
