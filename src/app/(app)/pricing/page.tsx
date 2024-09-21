import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { createClient } from "@/utils/supabase/server";
import { BuyFunds } from "./page.client";
import { redirect } from "next/navigation";

export default async function PricingPage() {
	const supabase = createClient();

	const { data: funds } = await supabase
		.from("users")
		.select("id, funds")
		.maybeSingle();

	if (!funds?.id) {
		return redirect("/sign-in");
	}

	return (
		<main>
			<Heading>Add more funds</Heading>
			<Text>Add more funds to your account to continue using the API.</Text>
			<Divider className="my-4" />
			<BuyFunds data={funds} />
		</main>
	);
}
