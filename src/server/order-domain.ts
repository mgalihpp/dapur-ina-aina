import { Prisma } from "@prisma/client";

type OrderStatus = "diproses" | "selesai" | "dibatalkan";
type PaymentStatus = "lunas" | "belum_lunas";
type PaymentMethod = "tunai" | "non_tunai";

export function sumOrderTotal(
	items: { price: string; quantity: number }[],
): string {
	return items
		.reduce(
			(total, item) =>
				total.plus(new Prisma.Decimal(item.price).mul(item.quantity)),
			new Prisma.Decimal(0),
		)
		.toFixed(2);
}

export function paymentState(amount: string, total: string): PaymentStatus {
	return new Prisma.Decimal(amount).greaterThanOrEqualTo(
		new Prisma.Decimal(total),
	)
		? "lunas"
		: "belum_lunas";
}

export function cashChange(
	amount: string,
	total: string,
	method: PaymentMethod,
): string | null {
	if (method !== "tunai" || paymentState(amount, total) !== "lunas")
		return null;
	return new Prisma.Decimal(amount).minus(total).toFixed(2);
}

export function assertOrderTransition(input: {
	current: OrderStatus;
	target: Exclude<OrderStatus, "diproses">;
	paymentStatus: PaymentStatus | null;
}): void {
	if (input.current !== "diproses") {
		throw new Error("Status pesanan tidak dapat diubah lagi.");
	}
	if (input.target === "selesai" && input.paymentStatus !== "lunas") {
		throw new Error(
			"Pesanan hanya dapat diselesaikan setelah pembayaran lunas.",
		);
	}
	if (input.target === "dibatalkan" && input.paymentStatus === "lunas") {
		throw new Error(
			"Pesanan yang sudah lunas tidak dapat dibatalkan. Buat pesanan baru bila perlu koreksi.",
		);
	}
}
