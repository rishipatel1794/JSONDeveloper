import { describe, expect, it } from "vitest";

import { REGEX_TEMPLATES } from "./templates";

describe("REGEX_TEMPLATES", () => {
	it("has a unique id per template", () => {
		const ids = REGEX_TEMPLATES.map(template => template.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("has at least one positive and one negative example per template", () => {
		for (const template of REGEX_TEMPLATES) {
			expect(template.examplesMatch.length).toBeGreaterThan(0);
			expect(template.examplesNoMatch.length).toBeGreaterThan(0);
		}
	});

	for (const template of REGEX_TEMPLATES) {
		describe(template.id, () => {
			it("matches every positive example", () => {
				// A fresh RegExp per example — a global/sticky flag keeps `lastIndex` state on the
				// instance, which would otherwise make later checks depend on where earlier ones left off.
				for (const example of template.examplesMatch) {
					const regex = new RegExp(template.pattern, template.flags);
					expect(regex.test(example), `expected "${example}" to match /${template.pattern}/${template.flags}`).toBe(true);
				}
			});

			it("rejects every negative example", () => {
				for (const example of template.examplesNoMatch) {
					const regex = new RegExp(template.pattern, template.flags);
					expect(regex.test(example), `expected "${example}" NOT to match /${template.pattern}/${template.flags}`).toBe(false);
				}
			});

			if (template.practicalVariant) {
				it("practical variant also matches every positive example", () => {
					for (const example of template.examplesMatch) {
						const regex = new RegExp(template.practicalVariant!.pattern, template.flags);
						expect(regex.test(example)).toBe(true);
					}
				});
			}
		});
	}
});
