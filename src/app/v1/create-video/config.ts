export const createVideoConfig = {
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
};

export default createVideoConfig;
