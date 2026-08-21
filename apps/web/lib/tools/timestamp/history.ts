import type { InputType } from "./types";

const STORAGE_KEY = "devtools:timestamp-converter:history";
const MAX_ENTRIES = 15;

export interface TimestampHistoryEntry {
	id: string;
	input: string;
	inputType: InputType;
	createdAt: string;
}

function isHistoryEntry(value: unknown): value is TimestampHistoryEntry {
	if (typeof value !== "object" || value === null) return false;
	const record = value as Record<string, unknown>;
	return typeof record.id === "string" && typeof record.input === "string" && typeof record.inputType === "string" && typeof record.createdAt === "string";
}

function persist(entries: TimestampHistoryEntry[]): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
	} catch {
		// Storage unavailable (private browsing, quota exceeded) — degrade silently, history just won't persist.
	}
}

export function loadHistory(): TimestampHistoryEntry[] {
	if (typeof window === "undefined") return [];

	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed: unknown = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.filter(isHistoryEntry) : [];
	} catch {
		return [];
	}
}

export function addHistoryEntry(input: string, inputType: InputType): TimestampHistoryEntry[] {
	const trimmed = input.trim();
	if (!trimmed) return loadHistory();

	const existing = loadHistory().filter(entry => entry.input !== trimmed);
	const next = [{ id: crypto.randomUUID(), input: trimmed, inputType, createdAt: new Date().toISOString() }, ...existing].slice(0, MAX_ENTRIES);
	persist(next);
	return next;
}

export function removeHistoryEntry(id: string): TimestampHistoryEntry[] {
	const next = loadHistory().filter(entry => entry.id !== id);
	persist(next);
	return next;
}

export function clearHistory(): TimestampHistoryEntry[] {
	if (typeof window !== "undefined") {
		try {
			window.localStorage.removeItem(STORAGE_KEY);
		} catch {
			// ignore
		}
	}
	return [];
}
