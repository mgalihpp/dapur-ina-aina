import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { listCategories } from "@/server/category-functions";
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
	const [categories, setCategories] = useState<
		{ id: number; namaKategori: string }[]
	>([]);
	const [categoryId, setCategoryId] = useState("all");

	useEffect(() => {
		let alive = true;
		Promise.all([listProducts(), listCategories()])
			.then(([rows, categoryRows]) => {
				if (alive) {
					setProducts(rows);
					setCategories(categoryRows);
				}
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

	const filteredProducts =
		categoryId === "all"
			? products
			: products.filter((product) => String(product.kategoriId) === categoryId);

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
			<div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border border-neutral-100 bg-white px-4 py-3">
				<div className="flex items-center gap-2 text-sm text-neutral-600">
					<span>Kategori</span>
					<Select value={categoryId} onValueChange={setCategoryId}>
						<SelectTrigger
							aria-label="Filter kategori"
							className="w-[200px] rounded-lg border-neutral-200 bg-white text-neutral-900"
						>
							<SelectValue placeholder="Semua kategori" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Semua kategori</SelectItem>
							{categories.map((category) => (
								<SelectItem key={category.id} value={String(category.id)}>
									{category.namaKategori}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<p className="text-sm text-neutral-500">
					{filteredProducts.length} produk
				</p>
			</div>
			<div className="overflow-x-auto rounded-b-2xl border border-t-0 border-neutral-100 bg-white shadow-sm">
				{loading ? (
					<p className="px-4 py-8 text-center text-sm text-neutral-500">
						Memuat produk…
					</p>
				) : filteredProducts.length === 0 ? (
					<p className="px-4 py-8 text-center text-sm text-neutral-500">
						{products.length === 0
							? "Belum ada produk. Tambahkan produk pertama lewat tombol di atas."
							: "Tidak ada produk dalam kategori ini."}
					</p>
				) : (
					<ProductTable
						products={filteredProducts}
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
