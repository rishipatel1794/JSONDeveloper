import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

const VARIANTS = {
	primary: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm",
	secondary: "border border-border bg-secondary text-secondary-foreground hover:bg-secondary-hover",
	outline: "border border-border bg-transparent text-foreground hover:bg-secondary",
	ghost: "text-foreground hover:bg-secondary",
} as const;

const SIZES = {
	sm: "h-8 px-3 text-sm",
	md: "h-10 px-4 text-sm",
	lg: "h-11 px-6 text-base",
} as const;

type ButtonVariant = keyof typeof VARIANTS;
type ButtonSize = keyof typeof SIZES;

interface SharedProps {
	variant?: ButtonVariant;
	size?: ButtonSize;
	className?: string;
}

const base =
	"inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

interface ButtonProps extends SharedProps, ButtonHTMLAttributes<HTMLButtonElement> {
	href?: undefined;
}

interface ButtonLinkProps extends SharedProps {
	href: string;
	children?: React.ReactNode;
	target?: string;
	rel?: string;
	"aria-label"?: string;
}

export function Button({ variant = "primary", size = "md", className, href, ...props }: ButtonProps | ButtonLinkProps) {
	const classes = cn(base, VARIANTS[variant], SIZES[size], className);

	if (href) {
		return <Link href={href} className={classes} {...(props as Omit<ButtonLinkProps, "href" | "className">)} />;
	}

	return <button type="button" className={classes} {...(props as ButtonProps)} />;
}
