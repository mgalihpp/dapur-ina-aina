import { Prisma } from "@prisma/client";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import { ensureAdmin, ensureStaff } from "./guards";
import {
	parseIdInput,
	parseProductInput,
	parseUpdateProductInput,
} from "./validators";

export type AdminProductRow = {
	id: number;
	name: string;
	image: string;
	status: "In Stock" | "Out of Stock";
	productId: string;
	quantity: number;
	price: number;
	kategoriId: number;
	kategori: string;
};

function toRow(p: {
	id: number;
	namaProduk: string;
	harga: { toString(): string };
	stok: number;
	gambar: string | null;
	kategoriId: number;
	kategori: { namaKategori: string };
}): AdminProductRow {
	return {
		id: p.id,
		name: p.namaProduk,
		image: p.gambar ?? "/logo.png",
		status: p.stok > 0 ? "In Stock" : "Out of Stock",
		productId: String(p.id).padStart(8, "0"),
		quantity: p.stok,
		price: Number(p.harga.toString()),
		kategoriId: p.kategoriId,
		kategori: p.kategori.namaKategori,
	};
}

export const listProducts = createServerFn({ method: "GET" }).handler(
	async () => {
		await ensureAdmin();
		const rows = await prisma.produk.findMany({
			include: { kategori: { select: { namaKategori: true } } },
			orderBy: { id: "asc" },
		});
		return rows.map(toRow);
	},
);

export const listCashierCatalog = createServerFn({ method: "GET" }).handler(
	async () => {
		await ensureStaff();
		const products = await prisma.produk.findMany({
			include: { kategori: { select: { namaKategori: true } } },
			orderBy: [{ kategori: { namaKategori: "asc" } }, { namaProduk: "asc" }],
		});
		return products.map((product) => ({
			id: product.id,
			name: product.namaProduk,
			price: product.harga.toFixed(2),
			stock: product.stok,
			image: product.gambar ?? "/logo.png",
			categoryId: product.kategoriId,
			category: product.kategori.namaKategori,
		}));
	},
);

export const getProduct = createServerFn({ method: "GET" })
	.validator(parseIdInput)
	.handler(async ({ data }) => {
		await ensureAdmin();
		const p = await prisma.produk.findUnique({
			where: { id: data.id },
			include: { kategori: { select: { namaKategori: true } } },
		});
		if (!p) throw new Error("Produk tidak ditemukan");
		return toRow(p);
	});

export const createProduct = createServerFn({ method: "POST" })
	.validator(parseProductInput)
	.handler(async ({ data }) => {
		await ensureAdmin();
		const kategori = await prisma.kategori.findUnique({
			where: { id: data.kategoriId },
		});
		if (!kategori) throw new Error("Kategori tidak ditemukan.");
		return prisma.$transaction(async (tx) => {
			const created = await tx.produk.create({
				data: {
					namaProduk: data.namaProduk,
					harga: new Prisma.Decimal(data.harga),
					stok: data.stok,
					kategoriId: data.kategoriId,
					gambar: data.gambar,
				},
				include: { kategori: { select: { namaKategori: true } } },
			});
			if (data.stok > 0) {
				await tx.stok.create({
					data: {
						produkId: created.id,
						jumlah: data.stok,
						jenis: "masuk",
						tanggal: new Date(),
					},
				});
			}
			return toRow(created);
		});
	});

export const updateProduct = createServerFn({ method: "POST" })
	.validator(parseUpdateProductInput)
	.handler(async ({ data }) => {
		await ensureAdmin();
		const existing = await prisma.produk.findUnique({
			where: { id: data.id },
		});
		if (!existing) throw new Error("Produk tidak ditemukan");
		const kategori = await prisma.kategori.findUnique({
			where: { id: data.kategoriId },
		});
		if (!kategori) throw new Error("Kategori tidak ditemukan.");
		const updated = await prisma.$transaction(async (tx) => {
			const row = await tx.produk.update({
				where: { id: data.id },
				data: {
					namaProduk: data.namaProduk,
					harga: new Prisma.Decimal(data.harga),
					kategoriId: data.kategoriId,
					gambar: data.gambar,
				},
				include: { kategori: { select: { namaKategori: true } } },
			});
			return row;
		});
		return toRow(updated);
	});

export const deleteProduct = createServerFn({ method: "POST" })
	.validator(parseIdInput)
	.handler(async ({ data }) => {
		await ensureAdmin();
		try {
			await prisma.produk.delete({ where: { id: data.id } });
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === "P2003"
			)
				throw new Error(
					"Produk tidak dapat dihapus karena sudah dipakai transaksi atau riwayat stok.",
				);
			throw error;
		}
		return { id: data.id };
	});
