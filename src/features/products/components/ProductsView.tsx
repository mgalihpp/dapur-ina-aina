import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useCategories } from "@/features/admin/queries";
import { EmptyState } from "@/features/shared/components/EmptyState";
import { SearchSelect } from "@/features/shared/components/search-select";
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
	const [query, setQuery] = useState("");

	const products = productsQuery.data ?? [];
	const categories = categoriesQuery.data ?? [];
	const loading = productsQuery.isPending || categoriesQuery.isPending;
	const deleting = deleteProduct.isPending;
	const loadError = productsQuery.isError
		? queryErrorMessage(productsQuery.error, "Gagal memuat menu")
		: categoriesQuery.isError
			? queryErrorMessage(categoriesQuery.error, "Gagal memuat kategori")
			: null;
	const notice = error ?? loadError;

	const filteredProducts = products.filter((product) => {
		if (categoryId !== "all" && String(product.kategoriId) !== categoryId)
			return false;
		if (
			query &&
			!`${product.name} ${product.kategori}`
				.toLowerCase()
				.includes(query.toLowerCase())
		)
			return false;
		return true;
	});
	function resetFilters() {
		setQuery("");
		setCategoryId("all");
	}

	function confirmDelete() {
		if (!deleteTarget || deleting) return;
		setError(null);
		deleteProduct.mutate(
			{ id: deleteTarget.id },
			{
				onSuccess: () => setDeleteTarget(null),
				onError: (cause) =>
					setError(mutationErrorMessage(cause, "Gagal menghapus menu")),
			},
		);
	}

	return (
		<div className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-8">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-neutral-900">Menu</h1>
				<button
					type="button"
					onClick={() => navigate({ to: "/admin/menu/add" })}
					className="rounded-lg bg-[#F97316] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ea6a0a]"
				>
					+ Tambah Menu
				</button>
			</div>
			{notice ? (
				<p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
					{notice}
				</p>
			) : null}
			<div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-t-2xl border border-neutral-100 bg-white px-4 py-3">
				<p className="text-sm text-muted-foreground">
					{filteredProducts.length} dari {products.length} menu
				</p>
				<div className="flex flex-wrap items-center gap-2">
					<div className="relative">
						<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							aria-label="Cari menu"
							placeholder="Cari menu…"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							className="w-[200px] pl-9"
						/>
					</div>
					<SearchSelect
						value={categoryId}
						onChange={setCategoryId}
						options={[
							{ value: "all", label: "Semua kategori" },
							...categories.map((category) => ({
								value: String(category.id),
								label: category.namaKategori,
							})),
						]}
						placeholder="Semua kategori"
						searchPlaceholder="Cari kategori…"
						emptyText="Tidak ada kategori yang cocok."
						ariaLabel="Filter kategori"
						className="w-[200px]"
					/>
				</div>
			</div>
			<div className="overflow-x-auto rounded-b-2xl border border-t-0 border-neutral-100 bg-white shadow-sm">
				{loading ? (
					<p className="px-4 py-8 text-center text-sm text-neutral-500">
						Memuat menu…
					</p>
				) : filteredProducts.length === 0 ? (
					products.length === 0 ? (
						<EmptyState
							variant="menu"
							title="Belum ada menu"
							description="Tambahkan menu pertama supaya bisa mulai dipesan pelanggan."
							action={
								<button
									type="button"
									onClick={() => navigate({ to: "/admin/menu/add" })}
									className="rounded-xl bg-[#F97316] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#ea6a0a]"
								>
									Tambah menu
								</button>
							}
							className="m-4"
						/>
					) : (
						<EmptyState
							variant="search"
							title="Tidak ada menu yang cocok"
							description="Coba ubah kata kunci atau kosongkan filter kategori."
							action={
								<button
									type="button"
									onClick={resetFilters}
									className="rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-bold text-[var(--sea-ink)] transition hover:bg-neutral-50"
								>
									Reset filter
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
