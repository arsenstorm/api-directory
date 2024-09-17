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

// Components
import { APIKeysListItem, CreateAPIKey } from "./page.client";

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

export default function ProfilePage() {
	return (
		<main>
			<Heading>My Profile</Heading>
			<Text>
				View your profile information and manage your account settings.
			</Text>
			<Divider className="my-4" />
			<APIKeys />
		</main>
	);
}

function APIKeys() {
	return (
		<div>
			<CreateAPIKey />
			<Divider soft className="my-4" />
			<Table>
				<TableHead>
					<TableRow>
						<TableHeader>ID</TableHeader>
						<TableHeader>Name</TableHeader>
						<TableHeader>Hint</TableHeader>
						<TableHeader>Settings</TableHeader>
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
