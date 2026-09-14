import { CalendarClock } from "lucide-react";

import { createToolMetadata, getFaqJsonLd, getToolJsonLd } from "@/lib/seo";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { TimestampConverter } from "@/components/tools/timestamp-converter/TimestampConverter";
import { FAQ_ITEMS, TimestampFaq } from "@/components/tools/timestamp-converter/TimestampFaq";
import { TimestampSeoContent } from "@/components/tools/timestamp-converter/TimestampSeoContent";

const TITLE = "Timestamp Converter - Unix Timestamp to Date";
const DESCRIPTION = "Convert Unix timestamps to dates, ISO 8601, UTC and local time. Convert dates to Unix seconds and milliseconds with timezone support.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/timestamp-converter",
	keywords: ["unix timestamp converter", "epoch converter", "timestamp to date"],
});

const jsonLd = getToolJsonLd({ name: "Timestamp Converter", description: DESCRIPTION, path: "/timestamp-converter" });
const faqJsonLd = getFaqJsonLd(FAQ_ITEMS);

export default function TimestampConverterPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

			<div className="container mx-auto max-w-7xl px-4 py-10">
				<ToolPageHeader icon={CalendarClock} title="Timestamp Converter" description="Convert, inspect, and debug timestamps instantly." />

				<TimestampConverter />
			</div>

			<TimestampSeoContent />
			<TimestampFaq />
			<RelatedTools
				tools={[
					{ name: "Cron Generator", href: "/tools/cron-generator", description: "Build cron expressions from a schedule." },
					{ name: "Cron Parser", href: "/tools/cron-parser", description: "Explain what a cron expression does." },
					{ name: "JWT Decoder", href: "/jwt-decoder", description: "Decode and inspect JSON Web Tokens locally." },
				]}
			/>
		</main>
	);
}
