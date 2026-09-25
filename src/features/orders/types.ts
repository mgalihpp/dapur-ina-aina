export type PaymentStatus = "Paid" | "Unpaid";

export type OrderSummary = {
	id: string;
	table: string;
	guest: number;
	total: number;
	payment: PaymentStatus;
};

export type OrderItem = {
	id: string;
	name: string;
	qty: number;
	price: number;
};

export type OrderDetail = OrderSummary & {
	customer: string;
	paymentMethod: string;
	items: OrderItem[];
};
