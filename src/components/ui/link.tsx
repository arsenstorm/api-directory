"use client";

import { useRouter } from "next/navigation";
import * as Headless from "@headlessui/react";
import NextLink, { type LinkProps } from "next/link";
import { type default as React, forwardRef } from "react";

export const Link = forwardRef(function Link(
	props: LinkProps & React.ComponentPropsWithoutRef<"a">,
	ref: React.ForwardedRef<HTMLAnchorElement>,
) {
	const router = useRouter();

	return (
		<Headless.DataInteractive>
			<NextLink
				ref={ref}
				onMouseEnter={(e) => {
					const href = typeof props.href === "string" ? props.href : null;
					if (href) {
						router.prefetch(href);
					}
					return props.onMouseEnter?.(e);
				}}
				{...props}
			/>
		</Headless.DataInteractive>
	);
});
