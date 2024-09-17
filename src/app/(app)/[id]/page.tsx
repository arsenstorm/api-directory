import { request_config as config } from "@/utils/config";
import { notFound } from "next/navigation";

// UI
import { Heading } from "@/components/ui/heading";
import { Code, Text } from "@/components/ui/text";

export default function Page({
	params: { id },
}: {
	readonly params: {
		readonly id: string;
	};
}) {
	const api = config.api?.[id as keyof typeof config.api] ?? undefined;

	if (!api) {
		return notFound();
	}

	return (
		<div>
			<Heading>{api.name}</Heading>
			<Text>{api.one_liner}</Text>
			<div className="mt-4">
				<Text>
					To use this API, make a <Code>POST</Code> request to this endpoint:{" "}
					<Code>https://api.directory/v1/{id}</Code>.
				</Text>
			</div>
		</div>
	);
}
