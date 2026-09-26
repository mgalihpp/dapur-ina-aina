import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import { ensureAdmin, ensureStaff } from "./guards";
import { parseStockFilterInput, parseStockInput } from "./validators";

function dateAt(value: string | undefined, nextDay = false): Date | undefined {
	if (!value) return undefined;
	const date = new Date(`${value}T00:00:00.000Z`);
	if (nextDay) date.setUTCDate(date.getUTCDate() + 1);
	return date;
}

export const getStockOverview = createServerFn({ method: "GET" }).handler(
	async () => {
		await ensureStaff();
		const products = await prisma.produk.findMany({
			include: { kategori: { select: { namaKategori: true } } },
			orderBy: [{ stok: "asc" }, { namaProduk: "asc" }],
		});
		return products.map((product) => ({
			id: product.id,
			name: product.namaProduk,
			category: product.kategori.namaKategori,
			stock: product.stok,
			low: product.stok <= 5,
			price: product.harga.toFixed(2),
		}));
	},
);

export const restockProduct = createServerFn({ method: "POST" })
	.validator(parseStockInput)
	.handler(async ({ data }) => {
		await ensureAdmin();
		return prisma.$transaction(async (tx) => {
			const product = await tx.produk.update({
				where: { id: data.productId },
				data: { stok: { increment: data.quantity } },
				select: { id: true, namaProduk: true, stok: true },
			});
			await tx.stok.create({
				data: {
					produkId: product.id,
					jumlah: data.quantity,
					jenis: "masuk",
					tanggal: new Date(),
				},
			});
			return product;
		});
	});

export const listStockMoves = createServerFn({ method: "GET" })
	.validator(parseStockFilterInput)
	.handler(async ({ data }) => {
		await ensureStaff();
		const moves = await prisma.stok.findMany({
			where: {
				produkId: data.productId,
				jenis: data.type,
				tanggal:
					data.start || data.end
						? {
								gte: dateAt(data.start),
								lt: dateAt(data.end, true),
							}
						: undefined,
			},
			include: { produk: { select: { namaProduk: true } } },
			orderBy: [{ tanggal: "desc" }, { id: "desc" }],
			take: 250,
		});
		return moves.map((move) => ({
			id: move.id,
			productId: move.produkId,
			product: move.produk.namaProduk,
			quantity: move.jumlah,
			type: move.jenis,
			date: move.tanggal.toISOString(),
		}));
	});
