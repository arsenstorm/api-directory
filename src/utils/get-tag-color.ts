export type TagColor =
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
	| "zinc"
	| undefined;

export function getTagColor(tag: string): TagColor {
	switch (tag) {
		case "Moderation":
			return "yellow";
		case "Generative":
			return "green";
		case "Utility":
			return "blue";
		case "Vision":
			return "cyan";
		case "Coming Soon":
			return "amber";
		default:
			return "zinc";
	}
}
