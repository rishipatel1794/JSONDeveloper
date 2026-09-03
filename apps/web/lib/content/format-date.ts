/** Formats an ISO date string (e.g. "2026-06-02") as "June 2, 2026", independent of the viewer's timezone. */
export function formatContentDate(isoDate: string): string {
	const [year, month, day] = isoDate.split("-").map(Number);
	return new Date(Date.UTC(year!, month! - 1, day!)).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "UTC",
	});
}
