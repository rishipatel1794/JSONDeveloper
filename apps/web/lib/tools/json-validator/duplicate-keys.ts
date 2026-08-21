import type { DuplicateKeyOccurrence } from "./types";

/** Human-readable label for where a duplicate key lives — "name" at the root, "user.address.city" when nested. */
export function formatDuplicateKeyPath(duplicate: DuplicateKeyOccurrence): string {
	return duplicate.path ? `${duplicate.path}.${duplicate.key}` : duplicate.key;
}

export function formatDuplicateKeyLines(duplicate: DuplicateKeyOccurrence): string {
	return duplicate.locations.map(location => `Line ${location.line}`).join(", ");
}
