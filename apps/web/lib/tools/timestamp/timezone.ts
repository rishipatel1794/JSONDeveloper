/**
 * Timezone math without a date library. Modern JS engines ship full IANA tzdata behind `Intl`, so
 * every zone-aware calculation here goes through `Intl.DateTimeFormat` rather than manually tracking
 * UTC offsets — that's what correctly handles DST transitions, historical offset changes, etc.
 */

/** A curated fallback for engines without `Intl.supportedValuesOf` (older Safari). Modern browsers use the full IANA list instead. */
const FALLBACK_TIMEZONES = [
	"UTC",
	"America/New_York",
	"America/Chicago",
	"America/Denver",
	"America/Los_Angeles",
	"America/Sao_Paulo",
	"America/Mexico_City",
	"America/Toronto",
	"Europe/London",
	"Europe/Berlin",
	"Europe/Paris",
	"Europe/Madrid",
	"Europe/Moscow",
	"Africa/Cairo",
	"Africa/Johannesburg",
	"Asia/Kolkata",
	"Asia/Dubai",
	"Asia/Shanghai",
	"Asia/Tokyo",
	"Asia/Seoul",
	"Asia/Singapore",
	"Asia/Bangkok",
	"Australia/Sydney",
	"Australia/Perth",
	"Pacific/Auckland",
];

export function getBrowserTimezone(): string {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
	} catch {
		return "UTC";
	}
}

export function isValidTimezone(timeZone: string): boolean {
	try {
		new Intl.DateTimeFormat("en-US", { timeZone });
		return true;
	} catch {
		return false;
	}
}

let cachedTimezones: string[] | null = null;

export function listTimezones(): string[] {
	if (cachedTimezones) return cachedTimezones;

	try {
		if (typeof Intl.supportedValuesOf === "function") {
			cachedTimezones = Intl.supportedValuesOf("timeZone");
			return cachedTimezones;
		}
	} catch {
		// fall through to the curated list
	}

	cachedTimezones = FALLBACK_TIMEZONES;
	return cachedTimezones;
}

interface ZonedParts {
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	second: number;
}

function getZonedParts(date: Date, timeZone: string): ZonedParts {
	const formatter = new Intl.DateTimeFormat("en-US", {
		timeZone,
		hourCycle: "h23",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

	const map: Record<string, string> = {};
	for (const part of formatter.formatToParts(date)) {
		map[part.type] = part.value;
	}

	return {
		year: Number(map.year),
		month: Number(map.month),
		day: Number(map.day),
		hour: map.hour === "24" ? 0 : Number(map.hour),
		minute: Number(map.minute),
		second: Number(map.second),
	};
}

/**
 * Resolves a wall-clock date/time as it would read in `timeZone` to the UTC instant it represents.
 * Two passes are needed because the zone's offset at the (initially guessed) instant can differ from
 * its offset at the actually-resolved instant — the case right around a DST transition.
 */
export function zonedTimeToUtcMs(
	year: number,
	month: number,
	day: number,
	hour: number,
	minute: number,
	second: number,
	millisecond: number,
	timeZone: string,
): number {
	const guess = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);

	const offsetAt = (instant: number): number => {
		const zoned = getZonedParts(new Date(instant), timeZone);
		const zonedAsUtc = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute, zoned.second, millisecond);
		return zonedAsUtc - instant;
	};

	const firstOffset = offsetAt(guess);
	let result = guess - firstOffset;

	const secondOffset = offsetAt(result);
	if (secondOffset !== firstOffset) {
		result = guess - secondOffset;
	}

	return result;
}

export function getZoneOffsetMinutes(date: Date, timeZone: string): number {
	const zoned = getZonedParts(date, timeZone);
	const zonedAsUtc = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute, zoned.second);
	return Math.round((zonedAsUtc - date.getTime()) / 60_000);
}

export function formatOffsetLabel(offsetMinutes: number): string {
	const sign = offsetMinutes < 0 ? "-" : "+";
	const abs = Math.abs(offsetMinutes);
	const hours = String(Math.floor(abs / 60)).padStart(2, "0");
	const minutes = String(abs % 60).padStart(2, "0");
	return `UTC${sign}${hours}:${minutes}`;
}

export function getZoneAbbreviation(date: Date, timeZone: string): string {
	try {
		const formatter = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" });
		const part = formatter.formatToParts(date).find(item => item.type === "timeZoneName");
		return part?.value ?? timeZone;
	} catch {
		return timeZone;
	}
}

/** Long, unambiguous, zone-labeled format — e.g. "Tuesday, August 12, 2025, 12:00:00 UTC". */
export function formatFriendly(date: Date, timeZone: string): string {
	return new Intl.DateTimeFormat("en-US", {
		timeZone,
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
		timeZoneName: "short",
	}).format(date);
}

/** Compact "HH:mm:ss" for a given zone — used by the timezone comparison list. */
export function formatShortTime(date: Date, timeZone: string): string {
	return new Intl.DateTimeFormat("en-US", {
		timeZone,
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hourCycle: "h23",
	}).format(date);
}

/** Compact "YYYY-MM-DD HH:mm:ss" for a given zone — used for the plain-text "Copy All" output. */
export function formatCompact(date: Date, timeZone: string): string {
	const zoned = getZonedParts(date, timeZone);
	const pad = (value: number) => String(value).padStart(2, "0");
	return `${zoned.year}-${pad(zoned.month)}-${pad(zoned.day)} ${pad(zoned.hour)}:${pad(zoned.minute)}:${pad(zoned.second)}`;
}

function zonedPartsToMs(zoned: ZonedParts, timeZone: string, hour = 0, minute = 0, second = 0, millisecond = 0): number {
	return zonedTimeToUtcMs(zoned.year, zoned.month, zoned.day, hour, minute, second, millisecond, timeZone);
}

export function startOfDay(date: Date, timeZone: string): number {
	return zonedPartsToMs(getZonedParts(date, timeZone), timeZone, 0, 0, 0, 0);
}

export function endOfDay(date: Date, timeZone: string): number {
	return zonedPartsToMs(getZonedParts(date, timeZone), timeZone, 23, 59, 59, 999);
}

export function startOfMonth(date: Date, timeZone: string): number {
	const zoned = getZonedParts(date, timeZone);
	return zonedTimeToUtcMs(zoned.year, zoned.month, 1, 0, 0, 0, 0, timeZone);
}

export function endOfMonth(date: Date, timeZone: string): number {
	const zoned = getZonedParts(date, timeZone);
	const daysInMonth = new Date(Date.UTC(zoned.year, zoned.month, 0)).getUTCDate();
	return zonedTimeToUtcMs(zoned.year, zoned.month, daysInMonth, 23, 59, 59, 999, timeZone);
}

export function startOfYear(date: Date, timeZone: string): number {
	const zoned = getZonedParts(date, timeZone);
	return zonedTimeToUtcMs(zoned.year, 1, 1, 0, 0, 0, 0, timeZone);
}

export function endOfYear(date: Date, timeZone: string): number {
	const zoned = getZonedParts(date, timeZone);
	return zonedTimeToUtcMs(zoned.year, 12, 31, 23, 59, 59, 999, timeZone);
}
