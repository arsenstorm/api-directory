import { unkey } from "@/utils/get-unkey";
import { createClient } from "@/utils/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const supabase = createClient();
	
	const { data: { user } } = await supabase.auth.getUser();

	const userId = user?.id ?? undefined;

	if (!userId) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	if (!process.env.UNKEY_API_ID) {
		console.error("UNKEY_API_ID is not set - unable to create key for user.");
		return NextResponse.json(
			{ message: "We were not able to create your key." },
			{ status: 500 },
		);
	}

	const { name } = await req.json();

	const created = await unkey.keys.create({
		apiId: process.env.UNKEY_API_ID,
		prefix: "re",
		byteLength: 32,
		ownerId: userId,
		name,
	});

	if (created.error) {
		console.error(created.error);
		return NextResponse.json(
			{ message: "We were not able to create your key." },
			{ status: 500 },
		);
	}

	return NextResponse.json(
		{
			message: "Key created successfully",
			key: created.result.key,
		},
		{
			status: 200,
		},
	);
}

export async function DELETE(req: NextRequest) {
	const supabase = createClient();
	
	const { data: { user } } = await supabase.auth.getUser();

	const userId = user?.id ?? undefined;

	if (!userId) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const { keyId } = await req.json();

	const key = await unkey.keys.get({
		keyId,
	});

	if (!key.result) {
		return NextResponse.json({ message: "Key not found" }, { status: 404 });
	}

	const ownerId = key.result.ownerId;

	if (ownerId !== userId) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const deleted = await unkey.keys.delete({
		keyId,
	});

	if (deleted.error) {
		console.error(deleted.error);
		return NextResponse.json(
			{ message: "We were not able to delete your key." },
			{ status: 500 },
		);
	}

	return NextResponse.json(
		{
			message: "Key deleted successfully",
		},
		{ status: 200 },
	);
}
