// UI
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Text } from "@/components/ui/text";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";

// Hooks
import { Suspense } from "react";

// Actions
import { getKey } from "@/actions/get-key";
import { getConfig } from "@/utils/get-config";

// Components
import {
	APIHistory,
	APIKeysListItem,
	CreateAPIKey,
	Funds,
} from "./page.client";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

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
	const supabase = createClient();

	const permissionsConfig = Object.entries((await getConfig()).api).map(
		([name, api]) => ({
			name: api?.name ?? name,
			id: name,
		}),
	);

	const [{ data: funds }, { data: history }] = await Promise.all([
		supabase.from("users").select("funds").maybeSingle(),
		supabase
			.from("requests")
			.select(
				"id, timestamp, request, response, cost, service, status, user_id",
			)
			.order("timestamp", { ascending: false }),
	]);

	return (
		<main>
			<Heading>My Account</Heading>
			<Text>View and manage your account information and settings.</Text>
			<Divider className="my-4" />
			<Funds data={funds} />
			<Divider className="my-8" />
			<APIKeys permissionsConfig={permissionsConfig} />
			<Divider className="my-8" />
			<APIHistory data={history ?? []} />
		</main>
	);
}

function APIKeys({
	permissionsConfig,
}: {
	readonly permissionsConfig: { readonly name: string; readonly id: string }[];
}) {
	return (
		<div>
			<CreateAPIKey permissionsConfig={permissionsConfig} />
			<Divider soft className="my-4" />
			<Table>
				<TableHead>
					<TableRow>
						<TableHeader>ID</TableHeader>
						<TableHeader>Name</TableHeader>
						<TableHeader>Hint</TableHeader>
						<TableHeader className="relative w-0">
							<span className="sr-only">Actions</span>
						</TableHeader>
					</TableRow>
				</TableHead>
				<TableBody>
					<Suspense fallback={<APIKeysListLoading />}>
						<APIKeysList />
					</Suspense>
				</TableBody>
			</Table>
		</div>
	);
}

async function APIKeysList() {
	const keys = (await getKey()) ?? [];

	await new Promise((resolve) => setTimeout(resolve, 1000));

	if (keys.length === 0) {
		return <APIKeysListEmpty />;
	}

	return keys.map((key) => <APIKeysListItem key={key.id} data={key} />);
}

function APIKeysListLoading() {
	return (
		<TableRow>
			<TableCell colSpan={4} className="text-zinc-500 text-center">
				Getting your API keys...
			</TableCell>
		</TableRow>
	);
}

function APIKeysListEmpty() {
	return (
		<TableRow>
			<TableCell colSpan={4} className="text-zinc-500 text-center">
				No API keys found.
			</TableCell>
		</TableRow>
	);
}
