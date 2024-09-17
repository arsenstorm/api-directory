"use client";

import { PlusGrid, PlusGridItem, PlusGridRow } from "./plus-grid";

// UI
import { Link } from "./ui/link";
import { Button } from "@/components/ui/button";

// Icons
import { Logo } from "./logo";

import {
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
} from "@headlessui/react";
import { Bars2Icon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { MobileSearch, Search } from "./search";

const links = [{ href: "", label: "..." }];

function DesktopNav() {
	return (
		<nav className="relative hidden lg:flex">
			<PlusGridItem className="relative flex">
				<div className="flex items-center px-4 p-3 text-base font-medium text-gray-950">
					<Button>Login with GitHub</Button>
				</div>
			</PlusGridItem>
		</nav>
	);
}

function MobileNavButton() {
	return (
		<DisclosureButton
			className="flex size-12 items-center justify-center self-center rounded-lg data-[hover]:bg-black/5 lg:hidden"
			aria-label="Open main menu"
		>
			<Bars2Icon className="size-6" />
		</DisclosureButton>
	);
}

function MobileNav() {
	return (
		<DisclosurePanel className="lg:hidden">
			<div className="flex flex-col gap-6 py-4">
				<motion.div
					initial={{ opacity: 0, rotateX: -90 }}
					animate={{ opacity: 1, rotateX: 0 }}
					transition={{
						duration: 0.15,
						ease: "easeInOut",
						rotateX: { duration: 0.3, delay: links.length * 0.1 },
					}}
				>
					<Button className="w-full" color="dark">
						Login with GitHub
					</Button>
				</motion.div>
			</div>
			<div className="absolute left-1/2 w-screen -translate-x-1/2">
				<div className="absolute inset-x-0 top-0 border-t border-black/5" />
				<div className="absolute inset-x-0 top-2 border-t border-black/5" />
			</div>
		</DisclosurePanel>
	);
}

export default function Navbar() {
	return (
		<Disclosure as="header" className="my-8">
			<PlusGrid>
				<PlusGridRow className="relative flex justify-between">
					<div className="relative flex">
						<PlusGridItem className="p-3">
							<Link href="/" title="Home">
								<Logo className="h-9" />
							</Link>
						</PlusGridItem>
						<PlusGridItem className="p-3 items-center w-96 hidden lg:flex">
							<Search />
						</PlusGridItem>
					</div>
					<DesktopNav />
					<div className="flex lg:hidden flex-row items-center gap-0.5">
						<div className="flex size-12 items-center justify-center self-center rounded-lg hover:bg-black/5 lg:hidden">
							<MobileSearch />
						</div>
						<MobileNavButton />
					</div>
				</PlusGridRow>
			</PlusGrid>
			<MobileNav />
		</Disclosure>
	);
}
