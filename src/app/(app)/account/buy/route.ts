// Next
import { type NextRequest, NextResponse } from "next/server";

import { stripe } from "@/utils/stripe/server";
import { createClient } from "@/utils/supabase/server";
import type Stripe from "stripe";

export async function GET(req: NextRequest) {
  const supabase = createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  console.log("user", user);

  if (error) {
    return NextResponse.redirect(`${req.nextUrl.origin}/account`);
  }

  if (!user) {
    return NextResponse.redirect(`${req.nextUrl.origin}/account`);
  }

  const searchParams = req.nextUrl.searchParams;
  const amount = searchParams.get("amount");

  if (!amount) {
    return NextResponse.redirect(`${req.nextUrl.origin}/account`);
  }

  const productName = "Add funds to your account";

  let product = await stripe.products.list({
    limit: 100,
    active: true,
  }).then((products) => {
    return products.data.find((p) => p.name === productName);
  });

  if (!product) {
    product = await stripe.products.create({
      name: productName,
      description: "Add funds to your Request Directory account.",
    });
  }

  const existingPrice = await stripe.prices.list({
    product: product.id,
    limit: 100,
  }).then((prices) => {
    return prices.data.find((p) =>
      p.unit_amount === Number.parseInt(amount, 10) * 100 &&
      p.currency === "usd"
    );
  });

  let price: Stripe.Price;
  if (existingPrice) {
    price = existingPrice;
  } else {
    price = await stripe.prices.create({
      unit_amount: Number.parseInt(amount, 10) * 100,
      currency: "usd",
      product: product.id,
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    mode: "payment",
    currency: "usd",
    customer_email: user.email,
    metadata: {
      user_id: user.id,
      amount: amount,
    },
    success_url: `${req.nextUrl.origin}/account?purchase=success`,
    cancel_url: `${req.nextUrl.origin}/pricing`,
  });

  if (session?.url) {
    return NextResponse.redirect(session.url);
  }

  return NextResponse.redirect(`${req.nextUrl.origin}/account`);
}
