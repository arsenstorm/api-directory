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
import { Field, Label } from "@/components/ui/fieldset";

// Types
import type { Key } from "./page";

// Hooks
import { useCallback, useState } from "react";

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
				<Button href={`/profile/${data.id}`} disabled>
					Manage Key
				</Button>
			</TableCell>
		</TableRow>
	);
}

export function CreateAPIKey() {
	const [isOpen, setIsOpen] = useState(false);
	const [name, setName] = useState("");

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
		setIsOpen(false);
	}, []);

	const handleCloseCreatedKeyDialog = useCallback(() => {
		handleClose();
		setCreatedKeyData(null);
	}, [handleClose]);

	const handleCreateAPIKey = useCallback(async () => {
		const key = await fetch("/api/keys", {
			method: "POST",
			body: JSON.stringify({ name }),
		});

		const data = await key.json();

		setCreatedKeyData({
			id: data.id,
			key: data.key,
		});
	}, [name]);

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
					<Field>
						<Label>Name</Label>
						<Input
							placeholder="My API Key"
							value={name}
							onChange={handleChangeName}
						/>
					</Field>
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
