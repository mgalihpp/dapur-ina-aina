import { createFileRoute } from "@tanstack/react-router";
import { OrdersView } from "@/features/orders";

type OrdersSearch = {
	start?: string;
	end?: string;
	status?: string;
	product?: string;
	orderId?: string;
};

export const Route = createFileRoute("/admin/orders/")({
	validateSearch: (search: Record<string, unknown>): OrdersSearch => ({
		start: typeof search.start === "string" ? search.start : undefined,
		end: typeof search.end === "string" ? search.end : undefined,
		status: typeof search.status === "string" ? search.status : undefined,
		product: typeof search.product === "string" ? search.product : undefined,
		orderId: typeof search.orderId === "string" ? search.orderId : undefined,
	}),
	component: OrdersView,
});
