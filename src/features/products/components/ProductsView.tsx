import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { deleteProduct, listProducts } from "@/server/product-functions";
import type { AdminProduct, DeleteTarget } from "../types";
import { DeleteProductModal } from "./DeleteProductModal";
import { ProductTable } from "./ProductTable";

export function ProductsView() {
	const navigate = useNavigate();
	const [products, setProducts] = useState<AdminProduct[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		let alive = true;
		listProducts()
			.then((rows) => {
				if (alive) setProducts(rows);
			})
			.catch((e: unknown) => {
				if (alive)
					setError(e instanceof Error ? e.message : "Gagal memuat produk");
			})
			.finally(() => {
				if (alive) setLoading(false);
			});
		return () => {
			alive = false;
		};
	}, []);

	async function confirmDelete() {
		if (!deleteTarget || deleting) return;
		setDeleting(true);
		setError(null);
		try {
			await deleteProduct({ data: { id: deleteTarget.id } });
			setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
			setDeleteTarget(null);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Gagal menghapus produk");
		} finally {
			setDeleting(false);
		}
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
			{error ? (
				<p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
					{error}
				</p>
			) : null}
			<div className="mt-4 overflow-x-auto rounded-2xl border border-neutral-100 bg-white shadow-sm">
				{loading ? (
					<p className="px-4 py-8 text-center text-sm text-neutral-500">
						Memuat produk…
					</p>
				) : products.length === 0 ? (
					<p className="px-4 py-8 text-center text-sm text-neutral-500">
						Belum ada produk. Tambahkan produk pertama lewat tombol di atas.
					</p>
				) : (
					<ProductTable
						products={products}
						onEdit={(product) =>
							navigate({
								to: "/admin/menu/$productId/edit",
								params: { productId: String(product.id) },
							})
						}
						onDelete={setDeleteTarget}
					/>
				)}
			</div>
			<DeleteProductModal
				product={deleteTarget}
				onConfirm={() => void confirmDelete()}
				onCancel={() => setDeleteTarget(null)}
			/>
		</div>
	);
}
