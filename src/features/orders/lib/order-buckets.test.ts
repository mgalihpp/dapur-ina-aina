import { describe, expect, test } from "bun:test";
import type { OrderListRow } from "./order-buckets";
import {
	groupOrdersByBucket,
	ORDER_BUCKETS,
	orderBucketId,
} from "./order-buckets";

type Row = {
	id: string;
	status: OrderListRow["status"];
	paymentStatus: OrderListRow["paymentStatus"];
};

describe("order bucket", () => {
	test("puts a paid order still in progress in its own bucket", () => {
		expect(orderBucketId({ status: "diproses", paymentStatus: "lunas" })).toBe(
			"lunas_diproses",
		);
	});

	test("puts unpaid and partially paid orders in the same bucket", () => {
		expect(orderBucketId({ status: "diproses", paymentStatus: null })).toBe(
			"belum_lunas",
		);
		expect(
			orderBucketId({ status: "diproses", paymentStatus: "belum_lunas" }),
		).toBe("belum_lunas");
	});

	test("lets a terminal order status win over its payment status", () => {
		expect(
			orderBucketId({ status: "dibatalkan", paymentStatus: "lunas" }),
		).toBe("dibatalkan");
		expect(orderBucketId({ status: "selesai", paymentStatus: "lunas" })).toBe(
			"selesai",
		);
	});
});

describe("grouping the order list", () => {
	test("orders buckets by what the cashier does next", () => {
		expect(ORDER_BUCKETS.map((bucket) => bucket.id)).toEqual([
			"belum_lunas",
			"lunas_diproses",
			"dibatalkan",
			"selesai",
		]);
	});

	test("emits every bucket in registry order regardless of input order", () => {
		const rows: Row[] = [
			{ id: "6", status: "selesai", paymentStatus: "lunas" },
			{ id: "2", status: "diproses", paymentStatus: "lunas" },
			{ id: "1", status: "diproses", paymentStatus: null },
		];
		expect(
			groupOrdersByBucket(rows).map((group) => [
				group.bucket.id,
				group.rows.map((row) => row.id),
			]),
		).toEqual([
			["belum_lunas", ["1"]],
			["lunas_diproses", ["2"]],
			["selesai", ["6"]],
		]);
	});

	test("drops empty buckets and keeps input order inside a bucket", () => {
		const rows: Row[] = [
			{ id: "a", status: "diproses", paymentStatus: "lunas" },
			{ id: "b", status: "diproses", paymentStatus: "lunas" },
			{ id: "c", status: "dibatalkan", paymentStatus: null },
		];
		expect(
			groupOrdersByBucket(rows).map((group) => [
				group.bucket.id,
				group.rows.map((row) => row.id),
			]),
		).toEqual([
			["lunas_diproses", ["a", "b"]],
			["dibatalkan", ["c"]],
		]);
	});

	test("returns no groups for an empty list", () => {
		expect(groupOrdersByBucket([])).toEqual([]);
	});
});
