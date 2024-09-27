import type { Metadata } from "next";
import "@/styles/globals.css";
import clsx from "clsx";

// Components
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { getConfig } from "@/utils/get-config";

import { Toaster } from "sonner";
import Banner from "@/components/banner";

export const metadata: Metadata = {
	title: "Request Directory",
	description:
		"An open-source alternative to RapidAPI, allowing you to use APIs for pretty much anything with a single API key!",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const config = await getConfig();

	return (
		<html lang="en">
			<head>
				<link
					rel="stylesheet"
					href="https://api.fontshare.com/css?f%5B%5D=switzer@400,500,600,700&amp;display=swap"
				/>
			</head>
			<body className={clsx("bg-neutral-100/50", "min-h-screen flex flex-col")}>
				<Banner />
				<div className="px-4">
					<Navbar config={config} />
					<div className="flex-1">{children}</div>
				</div>
				<Footer />
				<Toaster richColors />
			</body>
		</html>
	);
}
