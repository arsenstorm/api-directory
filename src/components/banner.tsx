"use client";

import Image from "next/image";
import { Strong, Text, TextLink } from "@/components/ui/text";
import { XMarkIcon } from "@heroicons/react/16/solid";
import { Button } from "@/components/ui/button";

import { useLocalStorage } from "@mantine/hooks";
import { useCallback } from "react";

export default function Banner() {
	const [value, setValue] = useLocalStorage({
		key: "hide-supabase-hackathon",
		defaultValue: "false",
	});

	const hideSupabaseHackathon = useCallback(() => {
		setValue("true");
	}, [setValue]);

	if (value === "true") {
		return null;
	}

	return (
		<div className="flex flex-row w-full bg-zinc-50 border-b-2 border-[#3ECE9C] h-12 p-4 items-center gap-4">
			<Image
				src={"/supabase.svg"}
				alt="supabase"
				width={100}
				height={100}
				className="h-6 w-auto"
			/>
			<div className="flex flex-row items-center justify-center">
				<Text className="text-black">
					<span className="hidden md:inline-flex">
						From the Supabase team reviewing the Hackathon?
					</span>{" "}
					<TextLink href="https://legacy.request.directory" target="_blank">
						<Strong>
							View Request Directory at the time of submission here!
						</Strong>
					</TextLink>
				</Text>
			</div>
			<div className="flex-1 flex justify-end">
				<Button plain onClick={hideSupabaseHackathon}>
					<XMarkIcon className="size-6" />
				</Button>
			</div>
		</div>
	);
}
