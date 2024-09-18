"use server";

import fs from "node:fs";
import path from "node:path";
import toml from "toml";

export interface APIConfiguration {
	readonly api: {
		[key: string]: {
			readonly name: string;
			readonly one_liner: string;
			readonly enabled: boolean;
			readonly description?: string;
			readonly tag: string;
		};
	};
}

export async function getConfig() {
	const filePath = path.join(process.cwd(), "apis.toml"); // adjust the path if needed
	const fileContent = fs.readFileSync(filePath, "utf8");
	const config = toml.parse(fileContent) as APIConfiguration;

	return JSON.parse(JSON.stringify({
		apis: {
			enabled: true,
		},
		...config,
	})) as {
		readonly apis: {
			readonly enabled: boolean;
		};
		readonly config: APIConfiguration;
	};
}
