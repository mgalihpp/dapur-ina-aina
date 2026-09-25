import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PRODUCTS_MOCK } from "../data/products-mock";
import type { DeleteTarget } from "../types";
import { DeleteProductModal } from "./DeleteProductModal";
import { ProductTable } from "./ProductTable";

export function ProductsView() {
	const navigate = useNavigate();
	const [products, setProducts] = useState(PRODUCTS_MOCK);
	const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

	function confirmDelete() {
		if (!deleteTarget) return;
		const id = deleteTarget.id;
		setProducts((prev) => prev.filter((product) => product.id !== id));
		setDeleteTarget(null);
	}

	return (
		<div className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-8">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-neutral-900">Produk</h1>
				<button
					type="button"
					onClick={() => navigate({ to: "/admin/menu/add" })}
					className="rounded-lg bg-[#F97316] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ea6a0a]"
				>
					+ Tambah Produk
				</button>
			</div>
			<div className="mt-4 overflow-x-auto rounded-2xl border border-neutral-100 bg-white shadow-sm">
				<ProductTable
					products={products}
					onEdit={(product) =>
						navigate({
							to: "/admin/menu/$productId/edit",
							params: { productId: product.id },
						})
					}
					onDelete={setDeleteTarget}
				/>
			</div>
			<DeleteProductModal
				product={deleteTarget}
				onConfirm={confirmDelete}
				onCancel={() => setDeleteTarget(null)}
			/>
		</div>
	);
}
