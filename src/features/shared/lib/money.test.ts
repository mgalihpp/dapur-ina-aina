import { describe, expect, test } from "bun:test";
import { fromMinorUnits, sumMoneyLines, toMinorUnits } from "./money";

describe("decimal money preview", () => {
	test("converts rupiah strings to exact minor units", () => {
		expect(toMinorUnits("12000.05")).toBe(1200005n);
		expect(fromMinorUnits(1200005n)).toBe("12000.05");
	});

	test("sums quantities without binary floating point", () => {
		expect(
			sumMoneyLines([
				{ price: "1250.25", quantity: 2 },
				{ price: "0.10", quantity: 3 },
			]),
		).toBe("2500.80");
	});
});
