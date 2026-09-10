import { describe, expect, it } from "vitest";

import { describeCronExpression, describeFields } from "./describe";
import { parseCronString } from "./format";

function describeString(cron: string): string {
	const result = parseCronString(cron);
	if (!result.valid || !result.expression) throw new Error(`invalid cron for test: ${cron}`);
	return describeCronExpression(result.expression);
}

describe("describeCronExpression", () => {
	it("describes every N minutes", () => {
		expect(describeString("*/5 * * * *")).toBe("Runs every 5 minutes.");
	});

	it("describes a specific daily time", () => {
		expect(describeString("0 9 * * *")).toBe("Runs at 9:00 AM.");
	});

	it("describes a single weekday at a specific time", () => {
		expect(describeString("0 9 * * 1")).toBe("Runs every Monday at 9:00 AM.");
	});

	it("describes an hour range with a minute step and a weekday range (spec example)", () => {
		expect(describeString("*/15 9-17 * * 1-5")).toBe("Runs every 15 minutes between 9:00 AM and 5:59 PM, Monday through Friday.");
	});

	it("describes weekdays", () => {
		expect(describeString("0 9 * * 1-5")).toBe("Runs every weekday at 9:00 AM.");
	});

	it("describes the 1st of the month", () => {
		expect(describeString("0 0 1 * *")).toBe("Runs at 12:00 AM, on the 1st of the month.");
	});

	it("describes every Sunday", () => {
		expect(describeString("0 0 * * 0")).toBe("Runs every Sunday at 12:00 AM.");
	});

	it("describes every minute", () => {
		expect(describeString("* * * * *")).toBe("Runs every minute.");
	});
});

describe("describeFields", () => {
	it("explains each field of the spec example individually", () => {
		const result = parseCronString("*/15 9-17 * * 1-5");
		const fields = describeFields(result.expression!);

		expect(fields.find(f => f.field === "minute")?.meaning).toBe("every 15 minutes");
		expect(fields.find(f => f.field === "hour")?.meaning).toBe("9 through 17");
		expect(fields.find(f => f.field === "dayOfMonth")?.meaning).toBe("every day of the month");
		expect(fields.find(f => f.field === "month")?.meaning).toBe("every month");
		expect(fields.find(f => f.field === "dayOfWeek")?.meaning).toBe("Monday through Friday");
	});
});
