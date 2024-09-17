import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: "selector",
	content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		extend: {
			fontFamily: {
				sans: "Switzer, system-ui, sans-serif",
			},
		},
	},
	plugins: [],
};
export default config;
