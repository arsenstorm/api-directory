import type { APIConfig } from "@/types/config";

export const nudenetConfig = {
  details: {
    name: "NudeNet",
    oneLiner: "Detects nudity in images.",
    tag: "Moderation",
  },
  pricing: {
    estimated: 0.0001, // roughly $0.0001 per image moderated
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
      blur: true,
      description: "The image to detect nudity in.",
      required: true,
    },
  ],
} as APIConfig;

export default nudenetConfig;
