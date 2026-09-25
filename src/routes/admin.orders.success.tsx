import { createFileRoute } from "@tanstack/react-router";
import { AdminInvoiceSuccessView } from "@/features/admin";

export const Route = createFileRoute("/admin/orders/success")({
	component: AdminInvoiceSuccessView,
});
