import { describe, expect, test } from "bun:test";
import {
	assertOrderTransition,
	cashChange,
	paymentState,
	sumOrderTotal,
} from "./order-domain";

describe("order totals", () => {
	test("multiplies each snapshot price by quantity and sums exact decimals", () => {
		expect(
			sumOrderTotal([
				{ price: "1250.25", quantity: 2 },
				{ price: "0.10", quantity: 3 },
			]),
		).toBe("2500.80");
	});
});

describe("payment state", () => {
	test("marks a partial cumulative payment unpaid", () => {
		expect(paymentState("99.99", "100.00")).toBe("belum_lunas");
	});

	test("marks exact and overpayment paid", () => {
		expect(paymentState("100.00", "100.00")).toBe("lunas");
		expect(paymentState("105.25", "100.00")).toBe("lunas");
	});

	test("calculates change only for cash payments", () => {
		expect(cashChange("105.25", "100.00", "tunai")).toBe("5.25");
		expect(cashChange("105.25", "100.00", "non_tunai")).toBeNull();
	});
});

describe("order transitions", () => {
	test("blocks completion unless payment is recorded as paid", () => {
		expect(() =>
			assertOrderTransition({
				current: "diproses",
				target: "selesai",
				paymentStatus: "belum_lunas",
			}),
		).toThrow("Pesanan hanya dapat diselesaikan setelah pembayaran lunas.");
	});

	test("allows cancellation with no payment or partial payment, blocks after lunas", () => {
		expect(() =>
			assertOrderTransition({
				current: "diproses",
				target: "dibatalkan",
				paymentStatus: null,
			}),
		).not.toThrow();
		expect(() =>
			assertOrderTransition({
				current: "diproses",
				target: "dibatalkan",
				paymentStatus: "belum_lunas",
			}),
		).not.toThrow();
		expect(() =>
			assertOrderTransition({
				current: "diproses",
				target: "dibatalkan",
				paymentStatus: "lunas",
			}),
		).toThrow("Pesanan yang sudah lunas tidak dapat dibatalkan.");
	});

	test("blocks a second transition from terminal states", () => {
		expect(() =>
			assertOrderTransition({
				current: "selesai",
				target: "dibatalkan",
				paymentStatus: "lunas",
			}),
		).toThrow("Status pesanan tidak dapat diubah lagi.");
	});
});
