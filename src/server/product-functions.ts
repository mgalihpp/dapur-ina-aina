import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import { ensureAdmin } from "./guards";
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

export const listKategori = createServerFn({ method: "GET" }).handler(
	async () => {
		await ensureAdmin();
		return prisma.kategori.findMany({ orderBy: { namaKategori: "asc" } });
	},
);

export const createProduct = createServerFn({ method: "POST" })
	.validator(parseProductInput)
	.handler(async ({ data }) => {
		await ensureAdmin();
		const kategori = await prisma.kategori.findUnique({
			where: { id: data.kategoriId },
		});
		if (!kategori) throw new Error("Kategori tidak ditemukan.");
		const created = await prisma.produk.create({
			data: {
				namaProduk: data.namaProduk,
				harga: Math.round(data.harga * 100) / 100,
				stok: data.stok,
				kategoriId: data.kategoriId,
				gambar: data.gambar,
			},
			include: { kategori: { select: { namaKategori: true } } },
		});
		if (data.stok > 0) {
			await prisma.stok.create({
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
		// Selisih stok dicatat sebagai pergerakan agar riwayat konsisten (FR-STK-1).
		const delta = data.stok - existing.stok;
		const updated = await prisma.$transaction(async (tx) => {
			const row = await tx.produk.update({
				where: { id: data.id },
				data: {
					namaProduk: data.namaProduk,
					harga: Math.round(data.harga * 100) / 100,
					stok: data.stok,
					kategoriId: data.kategoriId,
					gambar: data.gambar,
				},
				include: { kategori: { select: { namaKategori: true } } },
			});
			if (delta !== 0) {
				await tx.stok.create({
					data: {
						produkId: data.id,
						jumlah: Math.abs(delta),
						jenis: delta > 0 ? "masuk" : "keluar",
						tanggal: new Date(),
					},
				});
			}
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
		} catch {
			// FK Restrict: produk dipakai detail pesanan / riwayat stok.
			throw new Error(
				"Produk tidak dapat dihapus karena sudah dipakai transaksi.",
			);
		}
		return { id: data.id };
	});
