import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import { ensureStaff } from "./guards";
import { parseIdInput } from "./validators";

export type AdminOrderRow = {
	id: string;
	table: string;
	guest: number;
	total: number;
	payment: "Paid" | "Unpaid";
	status: "diproses" | "selesai" | "dibatalkan";
	tanggal: string;
	kasir: string;
};

export type AdminOrderDetail = AdminOrderRow & {
	customer: string;
	paymentMethod: string;
	items: { id: string; name: string; qty: number; price: number }[];
};

type OrderRowSource = {
	id: number;
	total: { toString(): string };
	status: "diproses" | "selesai" | "dibatalkan";
	tanggal: Date;
	user: { name: string };
	pembayaran: { status: string; metode: string } | null;
	detail: { jumlah: number }[];
};

function toRow(o: OrderRowSource): AdminOrderRow {
	return {
		id: String(o.id),
		table: "-",
		guest: o.detail.reduce((s, x) => s + x.jumlah, 0),
		total: Number(o.total.toString()),
		payment: o.pembayaran?.status === "lunas" ? "Paid" : "Unpaid",
		status: o.status,
		tanggal: o.tanggal.toISOString().slice(0, 10),
		kasir: o.user.name,
	};
}

// Daftar pesanan untuk admin: yang belum selesai dulu (diproses), lalu terbaru.
export const listOrders = createServerFn({ method: "GET" }).handler(
	async () => {
		await ensureStaff();
		const rows = await prisma.pesanan.findMany({
			include: {
				user: { select: { name: true } },
				pembayaran: { select: { status: true, metode: true } },
				detail: { select: { jumlah: true } },
			},
			orderBy: [{ status: "asc" }, { id: "desc" }],
			take: 100,
		});
		return rows.map(toRow);
	},
);

export const getOrderDetail = createServerFn({ method: "GET" })
	.validator(parseIdInput)
	.handler(async ({ data }) => {
		await ensureStaff();
		const o = await prisma.pesanan.findUnique({
			where: { id: data.id },
			include: {
				user: { select: { name: true } },
				pembayaran: true,
				detail: {
					include: { produk: { select: { namaProduk: true } } },
				},
			},
		});
		if (!o) throw new Error("Pesanan tidak ditemukan");
		const base = toRow({
			...o,
			pembayaran: o.pembayaran
				? { status: o.pembayaran.status, metode: o.pembayaran.metode }
				: null,
		});
		const detail: AdminOrderDetail = {
			...base,
			customer: o.user.name,
			paymentMethod:
				o.pembayaran?.metode === "tunai"
					? "Tunai"
					: o.pembayaran?.metode === "non_tunai"
						? "Non-tunai"
						: "-",
			items: o.detail.map((x) => ({
				id: String(x.id),
				name: x.produk.namaProduk,
				qty: x.jumlah,
				price: Number(x.harga.toString()),
			})),
		};
		return detail;
	});
