"use client";

import clsx from "clsx";

export function Divider({
	soft = false,
	className,
	...props
}: Readonly<{ soft?: boolean } & React.ComponentPropsWithoutRef<"hr">>) {
	return (
		<hr
			{...props}
			className={clsx(
				className,
				"w-full border-t",
				soft && "border-zinc-950/5 dark:border-white/5",
				!soft && "border-zinc-950/10 dark:border-white/10",
			)}
		/>
	);
}
