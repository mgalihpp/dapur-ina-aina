import type { OrderDetail, OrderItem, OrderSummary } from "../types";

export const ORDERS: OrderSummary[] = [
	{ id: "20235", table: "20", guest: 4, total: 230, payment: "Paid" },
	{ id: "20236", table: "20", guest: 4, total: 230, payment: "Unpaid" },
	{ id: "20237", table: "20", guest: 4, total: 230, payment: "Paid" },
	{ id: "20238", table: "20", guest: 4, total: 230, payment: "Unpaid" },
	{ id: "20239", table: "20", guest: 4, total: 230, payment: "Paid" },
];

const BASE_ITEMS: OrderItem[] = [
	{ id: "grill-sandwich-1", name: "Grill Sandwich", qty: 2, price: 60 },
	{ id: "chicken-popeyes", name: "Chicken Popeyes", qty: 3, price: 60 },
	{ id: "bison-burgers", name: "Bison Burgers", qty: 4, price: 250 },
	{ id: "grill-sandwich-2", name: "Grill Sandwich", qty: 2, price: 60 },
];

function toDetail(order: OrderSummary): OrderDetail {
	return {
		...order,
		customer: "Sarah Moanees",
		paymentMethod: "Cash",
		items: BASE_ITEMS,
	};
}

export const ORDER_DETAILS: Record<string, OrderDetail> = Object.fromEntries(
	ORDERS.map((order) => [order.id, toDetail(order)]),
);
