import type { APIConfig } from "@/types/config";

export const ageandgenderConfig = {
	details: {
		name: "Age and Gender",
		oneLiner: "Returns the age and gender of people in the image.",
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
			description: "The image with people in it.",
			required: true,
		},
	],
	outputs: [
		{
			id: "image",
			type: "image",
			name: "Labelled Image",
			blur: false,
			description: "A labelled image with age and gender of people present in the image.",
		},
	],
} as APIConfig;

export default ageandgenderConfig;
