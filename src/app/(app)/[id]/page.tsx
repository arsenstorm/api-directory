import { notFound } from "next/navigation";
import { getConfig } from "@/actions/get-config";
import { DocsButton, Playground } from "./page.client";
import { getDocById } from "@/utils/get-doc-by-id";

// UI
import { Heading, Subheading } from "@/components/ui/heading";
import { Code, Text } from "@/components/ui/text";
import { Divider } from "@/components/ui/divider";

export default async function Page({
	params: { id },
}: {
	readonly params: {
		readonly id: string;
	};
}) {
	const config = await getConfig();

	const api = config.api?.[id as keyof typeof config.api] ?? undefined;

	if (!api) {
		return notFound();
	}

	let configDetails: any;

	try {
		configDetails = await import(`@/app/v1/${id}/config`).then(
			(mod) => mod.default,
		);
	} catch (error) {
		console.error(error);
		return notFound();
	}

	let docs: any;

	try {
		docs = await getDocById(id);
	} catch (error) {
		console.error(error);
	}

	return (
		<div>
			<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
				<div className="flex flex-col">
					<Heading>{api.name}</Heading>
					<Text>{api.oneLiner}</Text>
				</div>
				<DocsButton docs={docs} />
			</div>
			<div className="mt-4">
				<Text>
					To use this API, make a <Code>POST</Code> request to this endpoint:{" "}
					<Code>https://request.directory/v1/{id}</Code>.
				</Text>
			</div>
			<Divider className="my-4" />
			<Subheading>Playground</Subheading>
			<Text>
				Test the API for yourself. This will use credits from your account.
			</Text>
			<Divider className="my-4" soft />
			<Playground config={configDetails} id={id} />
		</div>
	);
}
