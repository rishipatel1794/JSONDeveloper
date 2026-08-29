import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { absoluteUrl, defaultKeywords, getOrganizationJsonLd, getWebsiteJsonLd, siteDescription, siteName, siteUrl } from "@/lib/seo";

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
	metadataBase: new URL(siteUrl),
	applicationName: siteName,
	title: {
		default: `${siteName} | Fast & Free Online Tools for Developers`,
		template: `%s | ${siteName}`,
	},
	description: siteDescription,
	keywords: [...defaultKeywords],
	creator: siteName,
	publisher: siteName,
	category: "Developer Tools",
	authors: [{ name: siteName }],
	referrer: "origin-when-cross-origin",
	alternates: {
		canonical: "/",
	},
	openGraph: {
		title: siteName,
		description: siteDescription,
		url: absoluteUrl("/"),
		siteName,
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: siteName,
		description: siteDescription,
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
			"max-video-preview": -1,
		},
	},
	manifest: "/manifest.webmanifest",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const organizationJsonLd = getOrganizationJsonLd();
	const websiteJsonLd = getWebsiteJsonLd();

	return (
		<html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
			<head>
				<script
					// Avoids a light/dark flash by applying the saved theme before first paint.
					dangerouslySetInnerHTML={{
						__html: `try{var t=localStorage.getItem("theme");if(t==="light")document.documentElement.classList.add("light")}catch(e){}`,
					}}
				/>
				<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
				<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
			</head>
			<body className="flex min-h-screen flex-col antialiased">
				<Navbar />
				<div className="flex-1">{children}</div>
				<Footer />
			</body>
		</html>
	);
}
