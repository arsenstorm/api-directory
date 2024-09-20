// Functions
import { isApiEnabled } from "@/actions/is-api-enabled";
import { checkEnv } from "@/utils/check-env";

// Types
import { type NextRequest, NextResponse } from "next/server";

// Config
import config from "./config";

/**
 * Create a video from a script and context.
 *
 * What this endpoint should do:
 *
 * 1. Use ElevenLabs to generate a voiceover from the script.
 * 2. Use ElevenLabs to generate a transcript with timestamps from the voiceover.
 * 3. Ask OpenAI to generate a suitable idea for video elements from the transcript with timestamps and context.
 * 4. Get assets from the web or use Fal (or Replicate) to generate assets for the video.
 * 5. Use Remotion to generate a video from the assets, voiceover, and other elements.
 * 6. Store the video for 24 hours in Supabase Storage.
 * 7. Return a response with the video URL and ID.
 */
export async function POST(req: NextRequest) {
	const isEnabled = await isApiEnabled("create-video");
	const { check, message } = checkEnv(config?.env ?? []);

	if (!isEnabled) {
		return NextResponse.json(
			{
				message: "This API is not enabled.",
			},
			{
				status: 400,
			},
		);
	}

	if (!check) {
		return NextResponse.json(
			{
				message,
			},
			{
				status: 400,
			},
		);
	}

	return NextResponse.json(
		{
			message: "This API is not implemented yet.",
		},
		{
			status: 501,
		},
	);
}
