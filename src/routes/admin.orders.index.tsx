import { createFileRoute } from "@tanstack/react-router";
import { OrdersView } from "@/features/orders";

export const Route = createFileRoute("/admin/orders/")({
	component: OrdersView,
});
