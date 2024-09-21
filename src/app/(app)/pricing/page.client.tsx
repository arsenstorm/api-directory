"use client";

import { AnimatedNumber } from "@/components/animated-number";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Text } from "@/components/ui/text";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const estimatedCostPerCall = {
	nudenet: 0.0001,
	"create-video": 0.2,
	"swap-currency": 0.001,
};

export function BuyFunds({
	data,
}: { readonly data: { readonly id: string; readonly funds: number } | null }) {
	const router = useRouter();
	const supabase = createClient();
	const [loadingPrice, setLoadingPrice] = useState<number | null>(null);
	const [funds, setFunds] = useState(data?.funds ?? 0);

	useEffect(() => {
		const channel = supabase
			.channel("realtime-funds")
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "users",
				},
				(payload) => {
					setFunds(payload.new.funds);
				},
			)

			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [supabase]);

	const handleAddFunds = useCallback(
		(price: number) => {
			setLoadingPrice(price);
			router.push(`/account/buy?amount=${price}`);
		},
		[router],
	);

	if (!data?.id) {
		return null;
	}

	return (
		<div>
			<p className="text-7xl font-bold">
				$
				<AnimatedNumber start={0} end={funds} decimals={2} />
			</p>
			<Text>
				You have exactly ${funds} remaining. Select an amount to add to your
				account.
			</Text>
			<Divider className="my-4" soft />
			<div className="grid grid-cols-3 gap-4">
				{[1, 4, 10].map((amount) => {
					const price = amount * 5;

					return (
						<div
							key={price}
							className="flex flex-col border min-h-24 w-full rounded-2xl gap-8 p-4"
						>
							<div className="flex justify-center items-center">
								Get ${price.toFixed(2)}’s worth of credits
							</div>
							<ul className="flex flex-col gap-2 items-center">
								<li>
									<Text>
										Equivalent to ~
										{formatLargeNumber(
											Math.floor(price / estimatedCostPerCall.nudenet),
										)}{" "}
										NudeNet API calls
									</Text>
								</li>
								<li>
									<Text>
										Equivalent to ~
										{formatLargeNumber(
											Math.floor(price / estimatedCostPerCall["create-video"]),
										)}{" "}
										Create Video API calls
									</Text>
								</li>
								<li>
									<Text>
										Equivalent to ~
										{formatLargeNumber(
											Math.floor(price / estimatedCostPerCall["swap-currency"]),
										)}{" "}
										Swap Currency API calls
									</Text>
								</li>
							</ul>
							<Button
								className="w-full h-fit mt-auto"
								onClick={() => handleAddFunds(price)}
								disabled={loadingPrice !== null}
							>
								{loadingPrice === price && (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
                    className="animate-spin"
									>
										<title>Loading...</title>
										<path d="M21 12a9 9 0 1 1-6.219-8.56" />
									</svg>
								)}
								Add ${price.toFixed(2)}
							</Button>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function formatLargeNumber(num: number): string {
	if (num >= 1000000000) {
		return `${(num / 1000000000).toFixed(1)}B`;
	}
	if (num >= 1000000) {
		return `${(num / 1000000).toFixed(1)}M`;
	}
	if (num >= 1000) {
		return `${(num / 1000).toFixed(1)}K`;
	}
	return num.toString();
}
