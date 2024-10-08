import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: [],
	content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		extend: {
			typography: {
				DEFAULT: {
					css: {
						maxWidth: "100%",
					},
				},
			},
			fontFamily: {
				sans: "Switzer, system-ui, sans-serif",
			},
		},
	},
	plugins: [
		require("@tailwindcss/typography"),
	],
};
export default config;
