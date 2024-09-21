"use client";

// UI
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Subheading } from "@/components/ui/heading";
import { Code, Text, TextLink } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogActions,
	DialogBody,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Description,
	Field,
	FieldGroup,
	Label,
} from "@/components/ui/fieldset";
import {
	Checkbox,
	CheckboxField,
	CheckboxGroup,
} from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Divider } from "@/components/ui/divider";

// Types
import type { Key } from "./page";

// Hooks
import { useCallback, useEffect, useState } from "react";

// Utils
import { AnimatedNumber } from "@/components/animated-number";
import { createClient } from "@/utils/supabase/client";
import Markdown from "react-markdown";

export function Funds({ data }: { readonly data: any }) {
	const supabase = createClient();
	const [fundsRemaining, setFundsRemaining] = useState(data?.funds ?? 0);

	useEffect(() => {
		const channel = supabase
			.channel("realtime-funds")
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "users",
				},
				(payload) => {
					setFundsRemaining(payload.new.funds);
				},
			)

			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [supabase]);

	return (
		<div>
			<Subheading>Funds</Subheading>
			<Text>View and manage your funds.</Text>
			<Divider className="my-4" soft />
			<div>
				<p className="text-7xl font-bold">
					$
					<AnimatedNumber
						start={0}
						end={fundsRemaining.toFixed(2)}
						decimals={2}
					/>
				</p>
				<Text>
					You have exactly ${fundsRemaining} remaining.{" "}
					<TextLink href="/pricing">Add more funds</TextLink>.
				</Text>
			</div>
		</div>
	);
}

interface KeyCreatedData {
	id: string;
	key: string;
}

export function APIKeysListItem({ data }: { readonly data: Key }) {
	return (
		<TableRow>
			<TableCell>{data.id}</TableCell>
			<TableCell className="font-medium">{data.name}</TableCell>
			<TableCell className="text-zinc-500">
				<Code>{data.start}</Code>
			</TableCell>
			<TableCell className="w-fit">
				<div className="-mx-0 -my-1.5">
					<Button
						href={`/profile/${data.id}`} // TODO: Add the manage key page
						disabled
					>
						Manage Key
					</Button>
				</div>
			</TableCell>
		</TableRow>
	);
}

export function CreateAPIKey({
	permissionsConfig = [
		{
			name: "NudeNet",
			id: "nudenet",
		},
		{
			name: "Create Video",
			id: "create-video",
		},
	],
}: {
	readonly permissionsConfig: { readonly name: string; readonly id: string }[];
}) {
	const [isOpen, setIsOpen] = useState(false);

	const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
	const [name, setName] = useState("");
	const [permissions, setPermissions] = useState<string[]>(["everything"]);

	const [createdKeyData, setCreatedKeyData] = useState<KeyCreatedData | null>(
		null,
	);

	const handleChangeName = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value),
		[],
	);

	const handleOpen = useCallback(() => setIsOpen(true), []);

	const handleClose = useCallback(() => {
		setName("");
		setPermissions(["everything"]);
		setIsOpen(false);
	}, []);

	const handleCloseCreatedKeyDialog = useCallback(() => {
		handleClose();
		setCreatedKeyData(null);
	}, [handleClose]);

	const handleOpenAdvancedSettings = useCallback(() => {
		setIsAdvancedSettingsOpen(true);
	}, []);

	const handleCloseAdvancedSettings = useCallback(() => {
		setIsAdvancedSettingsOpen(false);
	}, []);

	const handleCreateAPIKey = useCallback(async () => {
		const key = await fetch("/api/keys", {
			method: "POST",
			body: JSON.stringify({ name, permissions }),
		});

		const data = await key.json();

		setCreatedKeyData({
			id: data.id,
			key: data.key,
		});
	}, [name, permissions]);

	return (
		<div className="flex justify-between items-center">
			<div className="flex flex-col">
				<Subheading>API Keys</Subheading>
				<Text>View and manage your API keys.</Text>
			</div>
			<Button onClick={handleOpen}>Create API Key</Button>
			<Dialog open={isOpen} onClose={handleClose}>
				<DialogTitle>Create API Key</DialogTitle>
				<DialogDescription>
					Create a new API key to access our API.
				</DialogDescription>
				<DialogBody>
					<FieldGroup>
						<Field>
							<Label>Name</Label>
							<Input
								placeholder="My API Key"
								value={name}
								onChange={handleChangeName}
							/>
						</Field>
						<Field className="flex flex-col gap-3 w-fit">
							<Label>Advanced Settings</Label>
							<Button onClick={handleOpenAdvancedSettings}>
								Manage Permissions
							</Button>
						</Field>
						<AdvancedSettings
							isOpen={isAdvancedSettingsOpen}
							handleClose={handleCloseAdvancedSettings}
							permissions={permissions}
							setPermissions={setPermissions}
							allPermissions={permissionsConfig}
						/>
					</FieldGroup>
				</DialogBody>
				<DialogActions>
					<Button onClick={handleClose} plain>
						Cancel
					</Button>
					<Button onClick={handleCreateAPIKey}>Create API Key</Button>
				</DialogActions>
			</Dialog>
			<Dialog open={!!createdKeyData} onClose={handleCloseCreatedKeyDialog}>
				<DialogTitle>API Key Created</DialogTitle>
				<DialogDescription>
					Your API key can only be seen once. Make sure to save it now.
				</DialogDescription>
				<DialogBody>
					<Field>
						<Label>Your API Key</Label>
						<Input value={createdKeyData?.key} readOnly disabled />
					</Field>
				</DialogBody>
				<DialogActions>
					<Button onClick={handleCloseCreatedKeyDialog}>
						I’ve saved my API Key, close this message.
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}

function AdvancedSettings({
	isOpen,
	handleClose,
	permissions,
	setPermissions,
	allPermissions,
}: {
	readonly isOpen: boolean;
	readonly handleClose: () => void;
	readonly permissions: string[];
	readonly setPermissions: (
		permissions: string[] | ((prev: string[]) => string[]),
	) => void;
	readonly allPermissions: { readonly name: string; readonly id: string }[];
}) {
	const handlePermissionChange = useCallback(
		(permission: string, enabled: boolean) => {
			if (enabled) {
				setPermissions((prev: string[]) => [...prev, permission]);
			} else {
				setPermissions((prev: string[]) =>
					prev.filter((p) => p !== permission),
				);
			}
		},

		[setPermissions],
	);

	return (
		<Dialog open={isOpen} onClose={handleClose}>
			<DialogTitle>Advanced Settings</DialogTitle>
			<DialogDescription>Manage your API key permissions.</DialogDescription>
			<DialogBody>
				<FieldGroup>
					<Field>
						<CheckboxGroup>
							<Subheading level={4}>Dangerous Permissions</Subheading>
							<CheckboxField>
								<Checkbox
									name="everything"
									value="everything"
									checked={permissions.includes("everything")}
									onChange={(checked) =>
										handlePermissionChange("everything", checked)
									}
								/>
								<Label className="flex flex-row gap-3 items-center">
									Allow access to all APIs <Badge color="red">Danger</Badge>
								</Label>
								<Description>
									This will give the API key access to all APIs.
								</Description>
							</CheckboxField>
							<Divider soft />
							<Subheading level={4}>Specific Permissions</Subheading>
							{allPermissions.map(({ name, id }) => (
								<CheckboxField key={id}>
									<Checkbox
										name={id}
										value={id}
										checked={permissions.includes(id)}
										onChange={(checked) => handlePermissionChange(id, checked)}
									/>
									<Label className="flex flex-row gap-3 items-center">
										Allow access to the {name} API
									</Label>
								</CheckboxField>
							))}
						</CheckboxGroup>
					</Field>
				</FieldGroup>
			</DialogBody>
			<DialogActions>
				<Button onClick={handleClose}>Save Permissions</Button>
			</DialogActions>
		</Dialog>
	);
}

export interface APIHistoryData {
	readonly id: string;
	readonly timestamp: string;
	readonly service: string;
	readonly status: string;
	readonly cost: string;
	readonly request: any;
	readonly response: any;
	readonly user_id: string;
}

export function APIHistory({
	data = [],
}: {
	readonly data: APIHistoryData[];
}) {
	const [viewHistory, setViewHistory] = useState<string | null>(null);
	const [history, setHistory] = useState<APIHistoryData[]>(data);

	const supabase = createClient();

	useEffect(() => {
		const channel = supabase
			.channel("realtime-requests")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "requests",
				},
				(payload) => {
					const mapPayloadToAPIHistoryData = (data: any): APIHistoryData => ({
						id: data.id,
						timestamp: data.timestamp,
						service: data.service,
						status: data.status,
						cost: data.cost,
						request: data.request,
						response: data.response,
						user_id: data.user_id,
					});

					switch (payload.eventType) {
						case "INSERT":
							setHistory((prev) => [
								...prev,
								mapPayloadToAPIHistoryData(payload.new),
							]);
							break;
						case "UPDATE":
							setHistory((prev) =>
								prev.map((item) =>
									item.id === payload.new.id
										? mapPayloadToAPIHistoryData(payload.new)
										: item,
								),
							);
							break;
						case "DELETE":
							setHistory((prev) =>
								prev.filter((item) => item.id !== payload.old.id),
							);
							break;
						default:
							break;
					}
				},
			)

			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [supabase]);

	return (
		<div>
			<Subheading>Realtime API History</Subheading>
			<Text>
				View your realtime API history.
				{/*
				// TODO: Something like this should be added.
				Add <Code>?noSave=true</Code> to your
				requests to prevent saving in history.*/}
			</Text>
			<Divider className="my-4" soft />
			<Table bleed>
				<TableHead>
					<TableRow>
						<TableHeader>Request ID</TableHeader>
						<TableHeader>Timestamp</TableHeader>
						<TableHeader>Service</TableHeader>
						<TableHeader>Status</TableHeader>
						<TableHeader>Cost</TableHeader>
						<TableHeader className="relative w-0">
							<span className="sr-only">View</span>
						</TableHeader>
					</TableRow>
				</TableHead>

				<TableBody>
					{history.map((item) => {
						let statusColor = "zinc";

						if (item.status === "failed") {
							statusColor = "red";
						}

						if (item.status === "success") {
							statusColor = "green";
						}

						return (
							<TableRow key={item.id}>
								<TableCell>{item.id}</TableCell>
								<TableCell>
									<time dateTime={item.timestamp}>
										{new Date(item.timestamp).toLocaleString()}
									</time>
								</TableCell>
								<TableCell>
									<TextLink href={`/${item.service}`}>{item.service}</TextLink>
								</TableCell>
								<TableCell>
									<Badge color={statusColor as "green" | "red" | "zinc"}>
										{item.status}
									</Badge>
								</TableCell>
								<TableCell className="font-mono">
									${Number(item.cost).toFixed(10)}
								</TableCell>
								<TableCell>
									<div className="-mx-0 -my-1.5">
										<Button onClick={() => setViewHistory(item.id)}>
											View
										</Button>
									</div>
								</TableCell>
							</TableRow>
						);
					})}

					{history.length === 0 && (
						<TableRow>
							<TableCell colSpan={6} className="text-center">
								No history yet
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
			<Dialog open={!!viewHistory} onClose={() => setViewHistory(null)}>
				<DialogTitle>Request Details</DialogTitle>
				<DialogDescription>
					Below are the details of the request.
				</DialogDescription>
				<DialogBody>
					<FieldGroup>
						<Field>
							<Label>Request</Label>
							<Markdown className="prose overflow-x-auto text-xs w-full mt-2">
								{`\`\`\`json\n${JSON.stringify(
									history.find((item) => item.id === viewHistory)?.request ??
										{},
									null,
									2,
								)}\n\`\`\``}
							</Markdown>
						</Field>
						<Field>
							<Label>Response</Label>
							<Markdown className="prose overflow-x-auto text-xs w-full mt-2">
								{`\`\`\`json\n${JSON.stringify(
									history.find((item) => item.id === viewHistory)?.response ??
										{},
									null,
									2,
								)}\n\`\`\``}
							</Markdown>
						</Field>
					</FieldGroup>
				</DialogBody>
			</Dialog>
		</div>
	);
}
