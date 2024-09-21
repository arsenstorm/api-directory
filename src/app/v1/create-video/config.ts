import type { APIConfig } from "@/types/config";

export const createVideoConfig = {
  details: {
    name: "Create Video",
    oneLiner: "Create a video from a prompt and context.",
    tag: "Generative",
  },
  pricing: {
    estimated: 0.2, // roughly $0.2 per minute of video
    price: null, // this is dynamically calculated
  },
  env: [
    "ELEVENLABS_API_KEY",
    "REPLICATE_API_KEY",
    "OPENAI_API_KEY",
    "GROQ_API_KEY",
    "FAL_API_KEY",
  ],
  request: {
    method: "POST",
    type: "json",
  },
  inputs: [
    {
      id: "script",
      type: "text",
      name: "script",
      description: "The script to use for the video.",
      required: true,
    },
    {
      id: "context",
      type: "text",
      name: "context",
      description: "The details about the video.",
      required: false,
    },
  ],
} as APIConfig;

export default createVideoConfig;
