import { Badge } from "@/components/ui/badge";
import { Heading, Subheading } from "@/components/ui/heading";
import { Link } from "@/components/ui/link";
import { Text } from "@/components/ui/text";
import { getConfig } from "@/actions/get-config";
import { getTagColor } from "@/utils/get-tag-color";

export default async function Home() {
	const config = await getConfig();

	return (
		<main>
			<Heading>Request Directory</Heading>
			<Text>
				Browse through a curated list of APIs to find the perfect one for your
				needs.
			</Text>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0.5 mt-8">
				{Object.entries(config.api).map(([id, api]: [string, any]) => (
					<APICard
						id={id}
						key={id}
						name={api.name}
						description={api.oneLiner}
						tag={{ name: api.tag, color: getTagColor(api.tag) }}
					/>
				))}
			</div>
		</main>
	);
}

function APICard({
	id,
	name,
	description,
	tag,
}: Readonly<{
	id: string;
	name: string;
	description: string;
	tag: {
		name: string;
		color?:
			| "blue"
			| "green"
			| "red"
			| "yellow"
			| "purple"
			| "pink"
			| "orange"
			| "amber"
			| "lime"
			| "emerald"
			| "teal"
			| "cyan"
			| "sky"
			| "indigo"
			| "violet"
			| "fuchsia"
			| "rose"
			| "zinc";
	};
}>) {
	return (
		<Link className="bg-white p-4 rounded-3xl h-36 relative" href={`/${id}`}>
			<Subheading>{name}</Subheading>
			<Text>{description}</Text>
			<div className="absolute top-0 right-0 p-4">
				<Badge color={tag.color}>{tag.name}</Badge>
			</div>
		</Link>
	);
}
