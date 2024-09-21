"use client";

// UI
import { TableCell, TableRow } from "@/components/ui/table";
import { Subheading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
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

// Types
import type { Key } from "./page";

// Hooks
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Divider } from "@/components/ui/divider";

interface KeyCreatedData {
	id: string;
	key: string;
}

export function APIKeysListItem({ data }: { readonly data: Key }) {
	return (
		<TableRow>
			<TableCell>{data.id}</TableCell>
			<TableCell className="font-medium">{data.name}</TableCell>
			<TableCell className="text-zinc-500">{data.start}</TableCell>
			<TableCell className="w-fit">
				<Button
					href={`/profile/${data.id}`} // TODO: Add the manage key page
					disabled
				>
					Manage Key
				</Button>
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
