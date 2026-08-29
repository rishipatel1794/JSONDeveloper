import { CalendarClock } from "lucide-react";

import { createToolMetadata } from "@/lib/seo";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { TimestampConverter } from "@/components/tools/timestamp-converter/TimestampConverter";
import { TimestampFaq } from "@/components/tools/timestamp-converter/TimestampFaq";
import { TimestampSeoContent } from "@/components/tools/timestamp-converter/TimestampSeoContent";

export const metadata = createToolMetadata({
	title: "Timestamp Converter - Unix Timestamp to Date",
	description:
		"Convert Unix timestamps to dates, ISO 8601, UTC and local time. Convert dates to Unix seconds and milliseconds with timezone support.",
	path: "/timestamp-converter",
	keywords: ["unix timestamp converter", "epoch converter", "timestamp to date"],
});

export default function TimestampConverterPage() {
	return (
		<main>
			<div className="container mx-auto max-w-7xl px-4 py-10">
				<ToolPageHeader icon={CalendarClock} title="Timestamp Converter" description="Convert, inspect, and debug timestamps instantly." />

				<TimestampConverter />
			</div>

			<TimestampSeoContent />
			<TimestampFaq />
		</main>
	);
}
