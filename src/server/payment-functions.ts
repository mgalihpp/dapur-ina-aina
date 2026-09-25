import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import { ensureStaff } from "./guards";
import { cashChange, paymentState } from "./order-domain";
import { parsePaymentInput } from "./validators";

export const recordPayment = createServerFn({ method: "POST" })
	.validator(parsePaymentInput)
	.handler(async ({ data }) => {
		await ensureStaff();
		return prisma.$transaction(async (tx) => {
			await tx.$queryRaw`SELECT id FROM tb_pesanan WHERE id = ${data.orderId} FOR UPDATE`;
			const order = await tx.pesanan.findUnique({
				where: { id: data.orderId },
				include: { pembayaran: true },
			});
			if (!order) throw new Error("Pesanan tidak ditemukan.");
			if (order.status !== "diproses")
				throw new Error(
					"Pembayaran hanya dapat dicatat untuk pesanan diproses.",
				);
			if (order.pembayaran?.status === "lunas")
				throw new Error("Pembayaran yang sudah lunas tidak dapat diubah.");
			if (order.pembayaran && order.pembayaran.metode !== data.method)
				throw new Error(
					"Metode pembayaran tidak dapat diubah setelah pembayaran dimulai.",
				);

			const status = paymentState(data.amount, order.total.toString());
			if (data.method === "non_tunai" && status !== "lunas")
				throw new Error(
					"Pembayaran non-tunai harus lunas (jumlah bayar = total).",
				);
			const tanggal = new Date();
			const payment = order.pembayaran
				? await tx.pembayaran.update({
						where: { pesananId: order.id },
						data: {
							jumlahBayar: data.amount,
							tanggal,
							status,
						},
					})
				: await tx.pembayaran.create({
						data: {
							pesananId: order.id,
							metode: data.method,
							jumlahBayar: data.amount,
							tanggal,
							status,
						},
					});
			return {
				orderId: order.id,
				status: payment.status,
				amount: payment.jumlahBayar.toFixed(2),
				total: order.total.toFixed(2),
				change: cashChange(
					payment.jumlahBayar.toString(),
					order.total.toString(),
					payment.metode,
				),
				method: payment.metode,
				date: payment.tanggal.toISOString().slice(0, 10),
			};
		});
	});
