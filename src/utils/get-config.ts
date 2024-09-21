export const runtime = 'nodejs';

import fs from "node:fs/promises";
import path from "node:path";
import toml from "toml";

export interface BaseAPIConfiguration {
	[key: string]: {
		readonly type?: "internal" | "external";
		readonly enabled: boolean;
	} | undefined;
}

export interface APIConfiguration extends BaseAPIConfiguration {
	[key: string]: {
		readonly name: string;
		readonly oneLiner?: string;
		readonly tags?: string[];
		readonly enabled: boolean;
		readonly type?: "internal" | "external";
	} | undefined;
}

export async function getConfig() {
	const filePath = path.join(process.cwd(), "config.toml");
	const fileContent = await fs.readFile(filePath, "utf-8");
	const config = toml.parse(fileContent) as { api: APIConfiguration };

	// load configs from `src/app/v1/**/config.ts` (default export) and then merge them with the toml config (just the [default].details)
	const v1Configs = await loadConfigs();

	// now merge the v1Configs with the toml config.api based on the api name
	for (const api in config.api) {
		const v1Config = v1Configs[api];
		const tomlConfig = config.api[api];

		if (v1Config) {
			config.api[api] = { ...tomlConfig, ...v1Config };
		}
	}

	return JSON.parse(JSON.stringify({
		...config,
	})) as {
		readonly database: {
			readonly supabase: "managed" | "local";
		};
		readonly apis: {
			readonly enabled: boolean;
		};
		readonly api: APIConfiguration;
	};
}

async function loadConfigs() {
	const configsDir = path.join(process.cwd(), "src", "app", "v1");
	const configs: Record<string, any> = {};

	const readDir = async (dir: string) => {
		const entries = await fs.readdir(dir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);

			if (entry.isDirectory()) {
				await readDir(fullPath);
			} else if (entry.name === "config.ts") {
				const relativePath = path.relative(configsDir, fullPath);
				const apiName = path.dirname(relativePath);
				const config = await import(`@/app/v1/${apiName}/config`).then(
					(mod) => mod.default,
				);
				configs[apiName] = config?.details ?? {};
			}
		}
	};

	await readDir(configsDir);
	return configs;
}
