import { type Stripe, loadStripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

const getStripe = () => {
	if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
		throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
	}

	if (stripePromise === undefined) {
		stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
	}
	return stripePromise;
};

export default getStripe;
