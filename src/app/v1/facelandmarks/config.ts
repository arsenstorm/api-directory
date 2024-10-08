import type { APIConfig } from "@/types/config";

export const facelandmarksConfig = {
	details: {
		name: "Face Landmarks",
		oneLiner: "Returns facial landmarks identified in the image.",
		tag: "Vision",
	},
	pricing: {
		estimated: 0.001, // roughly $0.0001 per image
		price: null, // we dynamically calculate the price
	},
	request: {
		method: "POST",
		type: "form-data",
	},
	inputs: [
		{
			id: "image",
			type: "image",
			name: "Input Image",
			blur: false,
			description: "The image to identify landmarks in.",
			required: true,
		},
	],
	outputs: [
		{
			id: "image",
			type: "image",
			name: "Output Image",
			blur: false,
			description: "The image with landmarks identified.",
		},
	],
} as APIConfig;

export default facelandmarksConfig;
