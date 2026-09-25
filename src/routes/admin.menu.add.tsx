import { createFileRoute } from "@tanstack/react-router";
import { ProductFormView } from "@/features/products";

export const Route = createFileRoute("/admin/menu/add")({
	component: AddProductRoute,
});

function AddProductRoute() {
	return <ProductFormView mode="add" />;
}
