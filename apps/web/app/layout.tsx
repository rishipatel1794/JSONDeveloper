import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { productConfig } from "@repo/config";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-jetbrains-mono",
	display: "swap",
});

export const metadata: Metadata = {
	metadataBase: new URL(productConfig.url),
	title: {
		default: `${productConfig.name} | Fast & Free Online Tools for Developers`,
		template: `%s | ${productConfig.name}`,
	},
	description: productConfig.description,
	alternates: {
		canonical: productConfig.url,
	},
	openGraph: {
		title: productConfig.name,
		description: productConfig.description,
		url: productConfig.url,
		siteName: productConfig.name,
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: productConfig.name,
		description: productConfig.description,
	},
	robots: {
		index: true,
		follow: true,
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
			<head>
				<script
					// Avoids a light/dark flash by applying the saved theme before first paint.
					dangerouslySetInnerHTML={{
						__html: `try{var t=localStorage.getItem("theme");if(t==="light")document.documentElement.classList.add("light")}catch(e){}`,
					}}
				/>
			</head>
			<body className="flex min-h-screen flex-col antialiased">
				<Navbar />
				<div className="flex-1">{children}</div>
				<Footer />
			</body>
		</html>
	);
}
