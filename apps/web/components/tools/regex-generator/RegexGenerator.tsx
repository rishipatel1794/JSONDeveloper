"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { TabList, TabPanel } from "@/components/ui/Tabs";
import { RegexInput } from "@/components/tools/regex-tester/RegexInput";
import { RegexTestPanel } from "@/components/tools/regex-shared/RegexTestPanel";

import { ExamplesMode } from "./ExamplesMode";
import { RegexGeneratorOutput } from "./RegexGeneratorOutput";
import { RegexGeneratorPrivacyNotice } from "./RegexGeneratorPrivacyNotice";
import { RequirementsMode } from "./RequirementsMode";
import { TemplateMode } from "./TemplateMode";

type Mode = "template" | "requirements" | "examples" | "custom";

const MODE_TABS: Array<{ value: Mode; label: string }> = [
	{ value: "template", label: "From a template" },
	{ value: "requirements", label: "From requirements" },
	{ value: "examples", label: "From examples" },
	{ value: "custom", label: "Custom pattern" },
];

export function RegexGenerator() {
	const [mode, setMode] = useState<Mode>("template");
	const [pattern, setPattern] = useState("");
	const [flags, setFlags] = useState<Set<string>>(new Set(["g"]));
	const [testString, setTestString] = useState("");

	function handleReset() {
		setPattern("");
		setFlags(new Set(["g"]));
		setTestString("");
	}

	const flagsString = [...flags].sort().join("");

	return (
		<div className="space-y-4">
			<RegexGeneratorPrivacyNotice />

			<div className="rounded-xl border border-border bg-card p-4 shadow-sm">
				<TabList items={MODE_TABS} value={mode} onChange={value => setMode(value as Mode)} aria-label="Generation mode" />

				<div className="pt-4">
					<TabPanel value="template" activeValue={mode}>
						<TemplateMode onApply={(nextPattern, nextFlags) => {
							setPattern(nextPattern);
							setFlags(new Set(nextFlags.split("")));
						}} />
					</TabPanel>
					<TabPanel value="requirements" activeValue={mode}>
						<RequirementsMode onApply={setPattern} />
					</TabPanel>
					<TabPanel value="examples" activeValue={mode}>
						<ExamplesMode onApply={setPattern} />
					</TabPanel>
					<TabPanel value="custom" activeValue={mode}>
						<p className="mb-2 text-sm text-muted-foreground">Write or paste your own pattern directly.</p>
						<RegexInput pattern={pattern} onChange={setPattern} onTest={() => {}} />
					</TabPanel>
				</div>
			</div>

			<div>
				<p className="mb-2 text-sm font-medium">Pattern</p>
				<RegexInput pattern={pattern} onChange={setPattern} onTest={() => {}} />
			</div>

			<RegexGeneratorOutput pattern={pattern} flags={flagsString} />

			<RegexTestPanel pattern={pattern} flags={flags} onFlagsChange={setFlags} testString={testString} onTestStringChange={setTestString} />

			<Button onClick={handleReset} variant="ghost" size="sm" className="text-destructive hover:bg-destructive-muted">
				<RotateCcw className="size-3.5" />
				Reset
			</Button>
		</div>
	);
}
