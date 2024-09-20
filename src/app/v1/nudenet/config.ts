import type { APIConfig } from "@/types/config";

export const nudenetConfig = {
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
