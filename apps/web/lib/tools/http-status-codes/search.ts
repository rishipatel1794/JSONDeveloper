import type { StatusCategory, StatusCode } from "./types";

export function searchStatusCodes(codes: StatusCode[], query: string): StatusCode[] {
	const trimmed = query.trim().toLowerCase();
	if (!trimmed) return codes;

	const asNumber = Number(trimmed);
	if (Number.isInteger(asNumber) && trimmed === String(asNumber)) {
		return codes.filter(entry => String(entry.code).includes(trimmed));
	}

	return codes.filter(entry => {
		const haystack = `${entry.code} ${entry.title} ${entry.description} ${entry.whenToUse} ${entry.commonCauses.join(" ")}`.toLowerCase();
		return haystack.includes(trimmed);
	});
}

export function filterByCategory(codes: StatusCode[], category: StatusCategory | "all"): StatusCode[] {
	if (category === "all") return codes;
	return codes.filter(entry => entry.category === category);
}
