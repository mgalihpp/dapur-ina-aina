import { createFileRoute, redirect } from "@tanstack/react-router";
import { OrdersView } from "@/features/orders";
import { ensureSession } from "@/server/auth-functions";

type OrdersSearch = {
	start?: string;
	end?: string;
	status?: string;
	product?: string;
	orderId?: string;
};

export const Route = createFileRoute("/kasir/orders")({
	beforeLoad: async () => {
		const session = await ensureSession();
		if (session.user.role !== "kasir" && session.user.role !== "admin")
			throw redirect({ to: "/admin" });
	},
	validateSearch: (search: Record<string, unknown>): OrdersSearch => ({
		start: typeof search.start === "string" ? search.start : undefined,
		end: typeof search.end === "string" ? search.end : undefined,
		status: typeof search.status === "string" ? search.status : undefined,
		product: typeof search.product === "string" ? search.product : undefined,
		orderId: typeof search.orderId === "string" ? search.orderId : undefined,
	}),
	component: OrdersView,
});
