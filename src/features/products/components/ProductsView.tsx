import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/features/admin/queries";
import { EmptyState } from "@/features/shared/components/EmptyState";
import { mutationErrorMessage, queryErrorMessage } from "@/lib/query-errors";
import { useDeleteProduct } from "../mutations";
import { useAdminProducts } from "../queries";
import type { DeleteTarget } from "../types";
import { DeleteProductModal } from "./DeleteProductModal";
import { ProductTable } from "./ProductTable";

export function ProductsView() {
	const navigate = useNavigate();
	const productsQuery = useAdminProducts();
	const categoriesQuery = useCategories();
	const deleteProduct = useDeleteProduct();

	const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
	const [error, setError] = useState<string | null>(null);
	const [categoryId, setCategoryId] = useState("all");

	const products = productsQuery.data ?? [];
	const categories = categoriesQuery.data ?? [];
	const loading = productsQuery.isPending || categoriesQuery.isPending;
	const deleting = deleteProduct.isPending;
	const loadError = productsQuery.isError
		? queryErrorMessage(productsQuery.error, "Gagal memuat produk")
		: categoriesQuery.isError
			? queryErrorMessage(categoriesQuery.error, "Gagal memuat kategori")
			: null;
	const notice = error ?? loadError;

	const filteredProducts =
		categoryId === "all"
			? products
			: products.filter((product) => String(product.kategoriId) === categoryId);

	function confirmDelete() {
		if (!deleteTarget || deleting) return;
		setError(null);
		deleteProduct.mutate(
			{ id: deleteTarget.id },
			{
				onSuccess: () => setDeleteTarget(null),
				onError: (cause) =>
					setError(mutationErrorMessage(cause, "Gagal menghapus produk")),
			},
		);
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
			{notice ? (
				<p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
					{notice}
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
					products.length === 0 ? (
						<EmptyState
							variant="menu"
							title="Belum ada produk"
							description="Tambahkan produk pertama supaya menu bisa mulai dipesan pelanggan."
							action={
								<button
									type="button"
									onClick={() => navigate({ to: "/admin/menu/add" })}
									className="rounded-xl bg-[#F97316] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#ea6a0a]"
								>
									Tambah produk
								</button>
							}
							className="m-4"
						/>
					) : (
						<EmptyState
							variant="search"
							title="Tidak ada produk di kategori ini"
							description="Coba pilih kategori lain untuk melihat produk yang tersedia."
							action={
								<button
									type="button"
									onClick={() => setCategoryId("all")}
									className="rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-bold text-[var(--sea-ink)] transition hover:bg-neutral-50"
								>
									Lihat semua kategori
								</button>
							}
							className="m-4"
						/>
					)
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
				onConfirm={() => confirmDelete()}
				onCancel={() => setDeleteTarget(null)}
			/>
		</div>
	);
}
