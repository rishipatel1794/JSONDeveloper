"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ToolAlert } from "@/components/tools/shared/ToolAlert";
import { TabList, TabPanel } from "@/components/ui/Tabs";
import { buildTimestampResult, inspectTimestampInput, parseZonedDateTime } from "@/lib/tools/timestamp/converter";
import { addHistoryEntry, clearHistory, loadHistory, removeHistoryEntry, type TimestampHistoryEntry } from "@/lib/tools/timestamp/history";
import { getBrowserTimezone } from "@/lib/tools/timestamp/timezone";
import type { InputType } from "@/lib/tools/timestamp/types";

import { CurrentTimestamp } from "./CurrentTimestamp";
import { DateTimeInput } from "./DateTimeInput";
import { QuickActions } from "./QuickActions";
import { TimestampEmptyState } from "./TimestampEmptyState";
import { TimestampHistory } from "./TimestampHistory";
import { TimestampInput } from "./TimestampInput";
import { TimestampInspector } from "./TimestampInspector";
import { TimestampPrivacyNotice } from "./TimestampPrivacyNotice";
import { TimestampResults } from "./TimestampResults";
import { MAX_COMPARISON_ZONES, TimezoneComparison } from "./TimezoneComparison";
import { TimezoneSelector } from "./TimezoneSelector";

type Mode = "timestamp-to-date" | "date-to-timestamp";

function todayDateString(): string {
	return new Date().toISOString().slice(0, 10);
}

const DEFAULT_TIME_STRING = "00:00:00";

export function TimestampConverter() {
	const [mode, setMode] = useState<Mode>("timestamp-to-date");
	const [input, setInput] = useState("");
	const [inputType, setInputType] = useState<InputType>("auto");
	const [timezone, setTimezone] = useState("UTC");
	const [compareZones, setCompareZones] = useState<string[]>([]);
	const [showComparison, setShowComparison] = useState(false);
	const [history, setHistory] = useState<TimestampHistoryEntry[]>([]);

	const [dateStr, setDateStr] = useState(todayDateString);
	const [timeStr, setTimeStr] = useState(DEFAULT_TIME_STRING);

	// Browser timezone/history aren't known until mount — default to UTC first to avoid an SSR/client hydration mismatch.
	useEffect(() => {
		setTimezone(getBrowserTimezone());
		setHistory(loadHistory());
	}, []);

	const inspection = useMemo(() => {
		if (!input.trim()) return null;
		return inspectTimestampInput(input, inputType, timezone);
	}, [input, inputType, timezone]);

	const dateToTimestamp = useMemo(() => parseZonedDateTime(dateStr, timeStr, timezone), [dateStr, timeStr, timezone]);

	function applyNow() {
		setMode("timestamp-to-date");
		setInput(String(Math.floor(Date.now() / 1000)));
		setInputType("auto");
	}

	function commitCurrentInput() {
		if (input.trim() && inspection?.valid) {
			setHistory(addHistoryEntry(input, inputType));
		}
	}

	function handleLoadHistory(entry: TimestampHistoryEntry) {
		setMode("timestamp-to-date");
		setInput(entry.input);
		setInputType(entry.inputType);
	}

	function handleQuickAction(unixSeconds: string) {
		setMode("timestamp-to-date");
		setInput(unixSeconds);
		setInputType("auto");
	}

	function handleAddCompareZone(zone: string) {
		setCompareZones(current => (current.includes(zone) || current.length >= MAX_COMPARISON_ZONES ? current : [...current, zone]));
	}

	function handleRemoveCompareZone(zone: string) {
		setCompareZones(current => current.filter(item => item !== zone));
	}

	function handleReset() {
		setMode("timestamp-to-date");
		setInput("");
		setInputType("auto");
		setTimezone(getBrowserTimezone());
		setCompareZones([]);
		setShowComparison(false);
		setDateStr(todayDateString());
		setTimeStr(DEFAULT_TIME_STRING);
	}

	return (
		<div className="space-y-6">
			<TimestampPrivacyNotice />

			<div className="rounded-xl border border-border bg-card p-4 shadow-sm">
				<TabList
					aria-label="Conversion mode"
					value={mode}
					onChange={next => setMode(next as Mode)}
					items={[
						{ value: "timestamp-to-date", label: "Timestamp → Date" },
						{ value: "date-to-timestamp", label: "Date → Timestamp" },
					]}
				/>

				<div className="space-y-4 pt-4">
					<TabPanel value="timestamp-to-date" activeValue={mode}>
						<div className="space-y-4">
							<TimestampInput
								value={input}
								onChange={setInput}
								inputType={inputType}
								onInputTypeChange={setInputType}
								onNow={applyNow}
								onCommit={commitCurrentInput}
							/>
							<TimezoneSelector value={timezone} onChange={setTimezone} />
							{inspection && !inspection.valid && <ToolAlert variant="error">{inspection.error}</ToolAlert>}
						</div>
					</TabPanel>

					<TabPanel value="date-to-timestamp" activeValue={mode}>
						<div className="space-y-4">
							<DateTimeInput date={dateStr} onDateChange={setDateStr} time={timeStr} onTimeChange={setTimeStr} />
							<TimezoneSelector value={timezone} onChange={setTimezone} />
							{!dateToTimestamp.success && <ToolAlert variant="error">{dateToTimestamp.error}</ToolAlert>}
						</div>
					</TabPanel>
				</div>
			</div>

			{mode === "timestamp-to-date" && (
				<>
					{!input.trim() && <TimestampEmptyState onUseCurrentTime={applyNow} />}
					{inspection?.valid && inspection.result && <TimestampResults result={inspection.result} />}
					{inspection && <TimestampInspector inspection={inspection} />}
				</>
			)}

			{mode === "date-to-timestamp" && dateToTimestamp.success && dateToTimestamp.epochMs !== undefined && (
				<TimestampResults result={buildTimestampResult(dateToTimestamp.epochMs, timezone)} />
			)}

			{inspection?.valid && inspection.epochMs !== undefined && (
				<div>
					{showComparison ? (
						<TimezoneComparison epochMs={inspection.epochMs} zones={compareZones} onAdd={handleAddCompareZone} onRemove={handleRemoveCompareZone} />
					) : (
						<Button onClick={() => setShowComparison(true)} variant="outline" size="sm">
							Compare Timezones
						</Button>
					)}
				</div>
			)}

			<CurrentTimestamp timezone={timezone} onUseNow={applyNow} />

			<QuickActions timezone={timezone} onApply={handleQuickAction} />

			<TimestampHistory
				entries={history}
				onLoad={handleLoadHistory}
				onDelete={id => setHistory(removeHistoryEntry(id))}
				onClear={() => setHistory(clearHistory())}
			/>

			<div className="flex justify-end">
				<Button onClick={handleReset} variant="ghost" size="sm">
					<RotateCcw className="size-3.5" />
					Reset
				</Button>
			</div>
		</div>
	);
}
