import { createFileRoute } from "@tanstack/react-router";
import { ProductsView } from "@/features/products";

export const Route = createFileRoute("/admin/menu/")({
	component: ProductsView,
});
