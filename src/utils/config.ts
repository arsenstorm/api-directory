export const request_config = {
	apis: {
		enabled: true,
	},
	api: {
		nudenet: {
			enabled: true,
			name: "NudeNet",
			one_liner: "Detects nudity in images.",
			tag: "Moderation",
		},
		"create-video": {
			enabled: true,
			name: "Create Video",
			one_liner: "Create a video from a prompt and context.",
			tag: "Generative",
		},
	},
};