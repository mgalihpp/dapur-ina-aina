import { Prisma } from "@prisma/client";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import { sumOrderTotal } from "./order-domain";
import { parsePublicOrderInput } from "./validators";

export type PublicMeja = {
	id: number;
	nama: string;
	lantai: string;
};

export type PublicCatalogProduct = {
	id: number;
	name: string;
	price: string;
	stock: number;
	category: string;
	image: string;
	soldOut: boolean;
};

export type PublicOrderDetail = {
	id: string;
	tanggal: string;
	status: "diproses" | "selesai" | "dibatalkan";
	total: string;
	meja: string | null;
	tamu: number | null;
	paymentStatus: "lunas" | "belum_lunas" | null;
	paymentMethod: "tunai" | "non_tunai" | null;
	paymentAmount: string | null;
	change: string | null;
	items: {
		id: string;
		name: string;
		qty: number;
		price: string;
		subtotal: string;
	}[];
};

export const listPublicCatalog = createServerFn({ method: "GET" }).handler(
	async (): Promise<PublicCatalogProduct[]> => {
		const products = await prisma.produk.findMany({
			include: { kategori: { select: { namaKategori: true } } },
			orderBy: [{ kategori: { namaKategori: "asc" } }, { namaProduk: "asc" }],
		});
		return products.map((product) => ({
			id: product.id,
			name: product.namaProduk,
			price: product.harga.toFixed(2),
			stock: product.stok,
			category: product.kategori.namaKategori,
			image: product.gambar ?? "/logo.png",
			soldOut: product.stok <= 0,
		}));
	},
);

export const listPublicMeja = createServerFn({ method: "GET" }).handler(
	async (): Promise<PublicMeja[]> => {
		const rows = await prisma.meja.findMany({
			orderBy: [{ lantai: "asc" }, { nama: "asc" }],
			select: { id: true, nama: true, lantai: true },
		});
		return rows;
	},
);

export const createPublicOrder = createServerFn({ method: "POST" })
	.validator(parsePublicOrderInput)
	.handler(async ({ data }): Promise<{ id: number; total: string }> => {
		return prisma.$transaction(async (tx) => {
			const productIds = data.items
				.map((item) => item.productId)
				.sort((left, right) => left - right);
			await tx.$queryRaw`
				SELECT id FROM tb_produk
				WHERE id IN (${Prisma.join(productIds)})
				ORDER BY id
				FOR UPDATE
			`;
			const products = await tx.produk.findMany({
				where: { id: { in: productIds } },
				select: { id: true, namaProduk: true, harga: true },
			});
			if (products.length !== data.items.length)
				throw new Error("Satu atau lebih produk tidak ditemukan.");

			const productsById = new Map(
				products.map((product) => [product.id, product]),
			);
			const orderItems = data.items.map((item) => {
				const product = productsById.get(item.productId);
				if (!product) throw new Error("Produk tidak ditemukan.");
				return {
					...item,
					name: product.namaProduk,
					price: product.harga,
					subtotal: product.harga.mul(item.quantity),
				};
			});

			for (const item of orderItems) {
				const changed = await tx.produk.updateMany({
					where: { id: item.productId, stok: { gte: item.quantity } },
					data: { stok: { decrement: item.quantity } },
				});
				if (changed.count !== 1)
					throw new Error(
						`Stok ${item.name} tidak mencukupi. Muat ulang daftar menu.`,
					);
			}

			const total = new Prisma.Decimal(
				sumOrderTotal(
					orderItems.map((item) => ({
						price: item.price.toString(),
						quantity: item.quantity,
					})),
				),
			);
			const tanggal = new Date();
			const order = await tx.pesanan.create({
				data: {
					userId: null,
					tanggal,
					total,
					status: "diproses",
					meja: data.meja,
					tamu: data.tamu,
					detail: {
						create: orderItems.map((item) => ({
							produkId: item.productId,
							jumlah: item.quantity,
							harga: item.price,
							subtotal: item.subtotal,
						})),
					},
					pembayaran:
						data.paymentMethod === "non_tunai"
							? {
									create: {
										metode: "non_tunai",
										jumlahBayar: total,
										tanggal,
										status: "lunas",
									},
								}
							: undefined,
				},
				select: { id: true, total: true },
			});
			await tx.stok.createMany({
				data: orderItems.map((item) => ({
					produkId: item.productId,
					jumlah: item.quantity,
					jenis: "keluar",
					tanggal,
				})),
			});
			return { id: order.id, total: order.total.toFixed(2) };
		});
	});

export const getPublicOrderDetail = createServerFn({ method: "GET" })
	.validator((input: { id: string | number }) => {
		const id = Number(input.id);
		if (!Number.isInteger(id) || id <= 0) throw new Error("id tidak valid");
		return { id };
	})
	.handler(async ({ data }): Promise<PublicOrderDetail> => {
		const order = await prisma.pesanan.findUnique({
			where: { id: data.id },
			include: {
				pembayaran: true,
				detail: { include: { produk: { select: { namaProduk: true } } } },
			},
		});
		if (!order) throw new Error("Pesanan tidak ditemukan.");
		return {
			id: String(order.id),
			tanggal: order.tanggal.toISOString().slice(0, 10),
			status: order.status,
			total: order.total.toFixed(2),
			meja: order.meja,
			tamu: order.tamu,
			paymentStatus: order.pembayaran?.status ?? null,
			paymentMethod: order.pembayaran?.metode ?? null,
			paymentAmount: order.pembayaran?.jumlahBayar.toFixed(2) ?? null,
			change:
				order.pembayaran?.status === "lunas" &&
				order.pembayaran.metode === "tunai"
					? order.pembayaran.jumlahBayar.minus(order.total).toFixed(2)
					: null,
			items: order.detail.map((item) => ({
				id: String(item.id),
				name: item.produk.namaProduk,
				qty: item.jumlah,
				price: item.harga.toFixed(2),
				subtotal: item.subtotal.toFixed(2),
			})),
		};
	});
