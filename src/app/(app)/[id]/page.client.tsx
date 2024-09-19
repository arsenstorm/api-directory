"use client";

import { Subheading } from "@/components/ui/heading";
import { Code, Text } from "@/components/ui/text";
import {
	Description,
	Field,
	FieldGroup,
	Fieldset,
	Label,
	Legend,
} from "@/components/ui/fieldset";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import clsx from "clsx";

export interface InputType {
	id: string;
	type:
		| "image"
		| "file"
		| "number"
		| "search"
		| "time"
		| "text"
		| "date"
		| "datetime-local"
		| "email"
		| "month"
		| "password"
		| "tel"
		| "url"
		| "week"
		| undefined;
	name: string;
	required?: boolean;
	description?: string;
	blur?: boolean;
}

export function Playground({
	config,
	id,
}: {
	readonly config: {
		readonly request: { method: string; type: string };
		readonly inputs: InputType[];
	};
	readonly id: string;
}) {
	const [response, setResponse] = useState<any>(null);

	const handleSubmit = async (data: any) => {
		const contentType = config.request.type;
		const formData = new FormData();

		if (contentType === "form-data") {
			// Append each field to FormData
			for (const key in data) {
				if (data[key]?.file) {
					formData.append(key, data[key].file); // Append file
				} else {
					formData.append(key, data[key]); // Append other data
				}
			}
		} else {
			// For JSON, keep the existing method
			formData.append("data", JSON.stringify(data));
		}

		const response = await fetch(`/v1/${id}`, {
			method: config.request.method,
			body: contentType === "form-data" ? formData : JSON.stringify(data),
			headers:
				contentType === "form-data"
					? undefined
					: { "Content-Type": "application/json" },
		});

		setResponse(await response.json());
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
			<Inputs inputs={config?.inputs} handleSubmit={handleSubmit} />
			<Output output={response} />
		</div>
	);
}

export function Inputs({
	inputs,
	handleSubmit = () => {},
}: Readonly<{
	inputs: InputType[];
	handleSubmit?: (data: any) => void;
}>) {
	const [isBlurred, setIsBlurred] = useState(false);
	const [inputForm, setInputForm] = useState<any>({});

	const handleInputChange = useCallback((id: string, value: any) => {
		setInputForm((prev: any) => ({ ...prev, [id]: value }));
	}, []);

	const toggleBlur = useCallback(() => {
		setIsBlurred((prev) => !prev);
	}, []);

	useEffect(() => {
		const blurInputs = inputs.filter((input: InputType) => input.blur);
		setIsBlurred(blurInputs.length > 0);
	}, [inputs]);

	useEffect(() => {
		return () => {
			for (const value of Object.values(inputForm) as unknown as any[]) {
				if (value?.fileUrl) {
					URL.revokeObjectURL(value.fileUrl);
				}
			}
		};
	}, [inputForm]);

	const onSubmit = useCallback(
		(event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			handleSubmit(inputForm);
		},
		[handleSubmit, inputForm],
	);

	return (
		<form onSubmit={onSubmit}>
			<Fieldset>
				<Legend>Inputs</Legend>
				<Text>Fill in the inputs below to use the API.</Text>
				<FieldGroup>
					{inputs.map((input: InputType) => {
						let fileType = input.type;

						if (fileType === "image") {
							fileType = "file";
						}

						return (
							<Field key={input.id}>
								<Label>
									{input.name} <Code className="ml-2">{input.id}</Code>
								</Label>
								{input.description && (
									<Description>{input.description}</Description>
								)}
								{input.type === "image" && (
									<div className="p-2 rounded-lg border bg-white my-2">
										{/* not having overflow-hidden above is quite nice with the blur effect */}
										{inputForm[input.id]?.fileUrl ? (
											<div className="group relative w-full h-full">
												<Image
													src={inputForm[input.id].fileUrl}
													alt={input.name}
													width={100}
													height={100}
													className={clsx(
														"object-contain w-full h-96 rounded-md",
														/* it's even nicer when this is h-full */
														isBlurred ? "blur-lg" : "",
													)}
												/>
												<div className="absolute inset-0 hidden group-hover:flex items-center justify-center">
													<Button onClick={toggleBlur} color="white">
														{isBlurred ? "Unblur" : "Blur"}
													</Button>
												</div>
											</div>
										) : (
											<div className="flex items-center justify-center min-h-24">
												<Text>Preview</Text>
											</div>
										)}
									</div>
								)}
								<Input
									name={input.id}
									required={input.required}
									type={fileType}
									value={
										input.type === "file" || input.type === "image"
											? undefined
											: inputForm[input.id]
									}
									onChange={(e) => {
										if (input.type === "file" || input.type === "image") {
											const file = e.target.files?.[0] ?? null;
											const fileUrl = file ? URL.createObjectURL(file) : null;

											// Clean up the old URL
											if (inputForm[input.id]?.fileUrl) {
												URL.revokeObjectURL(inputForm[input.id].fileUrl);
											}

											handleInputChange(input.id, { file, fileUrl });
										} else {
											handleInputChange(input.id, e.target.value);
										}
									}}
								/>
							</Field>
						);
					})}
					<Field>
						<Button type="submit" color="dark">
							Make API Request
						</Button>
					</Field>
				</FieldGroup>
			</Fieldset>
		</form>
	);
}

export function Output({ output }: { readonly output: any }) {
	return (
		<div className="flex flex-col gap-2">
			<Subheading level={3}>Output</Subheading>
			<pre>{JSON.stringify(output, null, 2)}</pre>
		</div>
	);
}
