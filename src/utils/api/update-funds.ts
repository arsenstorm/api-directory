"use server";

import { createClient } from "@/utils/supabase/server";

export async function updateFunds(
	userData: { funds: number; id: string },
	actual: number | null,
	estimated: number,
	revert = false,
) {
	const supabase = createClient();

	const precision = 6;

	const safeActual = actual ? Number.parseFloat(actual.toFixed(precision)) : 0;
	const safeEstimated = estimated
		? Number.parseFloat(estimated.toFixed(precision))
		: 0;

	let newAmount = 0;

	if (revert) {
		newAmount = Number.parseFloat(
			(userData.funds + (safeActual ?? safeEstimated)).toFixed(precision),
		);
	} else {
		newAmount = Number.parseFloat(
			(userData.funds - (safeActual ?? safeEstimated)).toFixed(precision),
		);
	}

	// update user funds
	const { data: updatedUserData, error: updateFundsError } = await supabase
		.from("users").update({
			funds: newAmount,
		}).eq("id", userData.id).select("funds");

	if (updateFundsError) {
		throw new Error("Failed to update user funds.");
	}

	return updatedUserData;
}