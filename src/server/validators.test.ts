import { describe, expect, test } from "bun:test";
import {
	parseCategoryInput,
	parseCreateUserInput,
	parseOrderInput,
	parsePaymentInput,
	parseProductInput,
	parsePublicOrderInput,
	parseStockFilterInput,
} from "./validators";

describe("order boundary validation", () => {
	test("requires a non-empty cart of unique positive product quantities", () => {
		expect(() => parseOrderInput({ items: [] })).toThrow(
			"Pesanan harus berisi minimal satu produk.",
		);
		expect(() =>
			parseOrderInput({
				items: [
					{ productId: 1, quantity: 1 },
					{ productId: 1, quantity: 2 },
				],
			}),
		).toThrow("Produk yang sama tidak boleh diulang.");
	});
});

describe("public order boundary validation", () => {
	test("accepts a guest payment method and defaults to cash", () => {
		expect(
			parsePublicOrderInput({
				items: [{ productId: 1, quantity: 1 }],
				meja: "Meja 01",
				tamu: 2,
				paymentMethod: "non_tunai",
			}),
		).toMatchObject({
			meja: "Meja 01",
			tamu: 2,
			paymentMethod: "non_tunai",
		});
		expect(
			parsePublicOrderInput({
				items: [{ productId: 1, quantity: 1 }],
			}),
		).toMatchObject({ paymentMethod: "tunai" });
	});

	test("rejects an unknown guest payment method", () => {
		expect(() =>
			parsePublicOrderInput({
				items: [{ productId: 1, quantity: 1 }],
				paymentMethod: "qris",
			}),
		).toThrow("Metode pembayaran tidak valid.");
	});
});

describe("payment boundary validation", () => {
	test("accepts decimal-string amounts and rejects non-positive payments", () => {
		expect(
			parsePaymentInput({ orderId: 4, method: "tunai", amount: "125.50" }),
		).toEqual({ orderId: 4, method: "tunai", amount: "125.50" });
		expect(() =>
			parsePaymentInput({ orderId: 4, method: "tunai", amount: "0" }),
		).toThrow("Jumlah pembayaran harus lebih dari 0.");
	});
});

describe("stock filter boundary validation", () => {
	test("rejects an invalid stock movement type", () => {
		expect(() => parseStockFilterInput({ type: "refund" })).toThrow(
			"Jenis pergerakan stok tidak valid.",
		);
	});
});

describe("category boundary validation", () => {
	test("trims category names and rejects empty names", () => {
		expect(parseCategoryInput({ namaKategori: " Minuman " })).toEqual({
			namaKategori: "Minuman",
		});
		expect(() => parseCategoryInput({ namaKategori: "  " })).toThrow(
			"Nama kategori wajib diisi.",
		);
	});
});

describe("product boundary validation", () => {
	test("keeps product money in a decimal string", () => {
		expect(
			parseProductInput({
				namaProduk: "Nasi",
				harga: "12000.25",
				stok: 2,
				kategoriId: 1,
				gambar: null,
			}),
		).toMatchObject({ harga: "12000.25" });
		expect(() =>
			parseProductInput({
				namaProduk: "Nasi",
				harga: "12000.255",
				stok: 2,
				kategoriId: 1,
				gambar: null,
			}),
		).toThrow("Harga harus maksimal 2 angka desimal dan lebih dari 0.");
	});
});

describe("staff user boundary validation", () => {
	test("requires a valid email, username, password, and staff role", () => {
		expect(
			parseCreateUserInput({
				name: "Kasir Satu",
				email: "kasir@example.com",
				username: "kasir.satu",
				password: "kata-sandi-aman",
				role: "kasir",
			}),
		).toMatchObject({ username: "kasir.satu", role: "kasir" });
		expect(() =>
			parseCreateUserInput({
				name: "Kasir Satu",
				email: "kasir@example.com",
				username: "kasir.satu",
				password: "pendek",
				role: "owner",
			}),
		).toThrow("Kata sandi minimal 8 karakter.");
	});
});
