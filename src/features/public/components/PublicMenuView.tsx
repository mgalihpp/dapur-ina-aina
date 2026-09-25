import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/features/shared/components/EmptyState";
import { fmtDecimalMoney } from "@/features/shared/lib/format";
import { queryErrorMessage } from "@/lib/query-errors";
import type { PublicCatalogProduct } from "@/server/public-functions";
import {
	rehydrateGuestStore,
	selectGuestCart,
	selectGuestHydrated,
	selectGuestTable,
	useGuestStore,
} from "../lib/guest-store";
import { publicCatalogQueryOptions } from "../queries";
import { PublicOrderSummary, PublicPageLayout } from "./PublicLayout";

export function PublicMenuView() {
	const navigate = useNavigate();
	const [category, setCategory] = useState("all");
	const [search, setSearch] = useState("");
	const catalogQuery = useQuery(publicCatalogQueryOptions());
	const products = catalogQuery.data ?? [];
	const loading = catalogQuery.isPending;
	const error = catalogQuery.isError
		? queryErrorMessage(catalogQuery.error, "Gagal memuat menu.")
		: null;
	const cart = useGuestStore(selectGuestCart);
	const meja = useGuestStore(selectGuestTable);
	const hydrated = useGuestStore(selectGuestHydrated);
	const addToCart = useGuestStore((state) => state.addToCart);
	const updateCartItem = useGuestStore((state) => state.updateCartItem);
	const removeFromCart = useGuestStore((state) => state.removeFromCart);
	const replaceCart = useGuestStore((state) => state.replaceCart);

	useEffect(() => {
		void rehydrateGuestStore();
	}, []);

	useEffect(() => {
		if (!hydrated || products.length === 0) return;
		const productsById = new Map(
			products.map((product) => [product.id, product]),
		);
		const syncedCart = cart.flatMap((item) => {
			const product = productsById.get(item.productId);
			if (!product || product.soldOut) return [];
			return [
				{
					productId: product.id,
					quantity: Math.min(item.quantity, product.stock),
					name: product.name,
					price: product.price,
					image: product.image,
					stock: product.stock,
					category: product.category,
				},
			];
		});
		const changed =
			syncedCart.length !== cart.length ||
			syncedCart.some((item, index) => {
				const current = cart[index];
				return (
					!current ||
					current.productId !== item.productId ||
					current.quantity !== item.quantity ||
					current.name !== item.name ||
					current.price !== item.price ||
					current.image !== item.image ||
					current.stock !== item.stock ||
					current.category !== item.category
				);
			});
		if (changed) replaceCart(syncedCart);
	}, [cart, hydrated, products, replaceCart]);

	const categories = useMemo(
		() => [...new Set(products.map((product) => product.category))],
		[products],
	);
	const visibleProducts = useMemo(
		() =>
			products.filter(
				(product) =>
					(category === "all" || product.category === category) &&
					product.name
						.toLocaleLowerCase("id-ID")
						.includes(search.trim().toLocaleLowerCase("id-ID")),
			),
		[category, products, search],
	);
	const cartByProduct = useMemo(
		() => new Map(cart.map((item) => [item.productId, item])),
		[cart],
	);
	function decreaseProduct(product: PublicCatalogProduct, quantity: number) {
		if (quantity <= 0) {
			removeFromCart(product.id);
			return;
		}
		updateCartItem(product.id, Math.min(quantity, product.stock));
	}

	function addProduct(product: PublicCatalogProduct) {
		if (product.soldOut) return;
		addToCart({
			productId: product.id,
			quantity: 1,
			name: product.name,
			price: product.price,
			image: product.image,
			stock: product.stock,
			category: product.category,
		});
	}

	return (
		<PublicPageLayout
			summary={
				<PublicOrderSummary
					table={meja}
					cart={cart}
					hydrated={hydrated}
					action={
						<button
							type="button"
							disabled={!hydrated || cart.length === 0}
							onClick={() => void navigate({ to: "/keranjang" })}
							className="w-full rounded-xl bg-[#F97316] py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
						>
							Lanjut ke keranjang
						</button>
					}
					notice={
						meja ? null : (
							<Link
								to="/meja"
								className="block rounded-lg bg-orange-50 px-3 py-2 text-center text-sm font-bold text-[#EF7D1A]"
							>
								Pilih meja
							</Link>
						)
					}
				/>
			}
		>
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold">Pilih menu</h1>
					{meja ? null : (
						<Link
							to="/meja"
							className="mt-1 inline-block text-sm font-semibold text-[#EF7D1A] underline"
						>
							Pilih meja dulu
						</Link>
					)}
				</div>
				<input
					aria-label="Cari menu"
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					placeholder="Cari menu…"
					className="w-full max-w-xs rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500"
				/>
			</div>
			<div className="mt-4 flex gap-2 overflow-x-auto pb-1">
				<button
					type="button"
					aria-pressed={category === "all"}
					onClick={() => setCategory("all")}
					className={`shrink-0 rounded-full px-4 py-2 text-sm ${category === "all" ? "bg-neutral-900 text-white" : "bg-white text-neutral-600"}`}
				>
					Semua
				</button>
				{categories.map((item) => (
					<button
						key={item}
						type="button"
						aria-pressed={category === item}
						onClick={() => setCategory(item)}
						className={`shrink-0 rounded-full px-4 py-2 text-sm ${category === item ? "bg-neutral-900 text-white" : "bg-white text-neutral-600"}`}
					>
						{item}
					</button>
				))}
			</div>
			{error ? (
				<p
					role="alert"
					className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
				>
					{error}
				</p>
			) : null}
			{!hydrated || loading ? (
				<p className="mt-8 text-sm text-neutral-500">Memuat menu…</p>
			) : visibleProducts.length === 0 ? (
				products.length === 0 ? (
					<EmptyState
						variant="menu"
						title="Menu belum tersedia"
						description="Dapur sedang menyiapkan menu. Silakan kembali lagi nanti."
						size="lg"
						surface="solid"
						className="mt-8"
					/>
				) : (
					<EmptyState
						variant="search"
						title="Menu tidak ditemukan"
						description="Coba kata kunci atau kategori lain untuk menemukan hidangan yang kamu cari."
						size="lg"
						surface="solid"
						className="mt-8"
						action={
							<button
								type="button"
								onClick={() => {
									setSearch("");
									setCategory("all");
								}}
								className="rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-bold text-[var(--sea-ink)] transition hover:bg-neutral-50"
							>
								Reset pencarian
							</button>
						}
					/>
				)
			) : (
				<div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
					{visibleProducts.map((product) => {
						const quantity = cartByProduct.get(product.id)?.quantity ?? 0;
						return (
							<article
								key={product.id}
								className="flex gap-3 rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm"
							>
								<img
									src={product.image}
									alt=""
									className="h-20 w-20 shrink-0 rounded-xl bg-neutral-100 object-cover"
								/>
								<div className="min-w-0 flex-1">
									<p className="flex items-center gap-2 truncate font-semibold">
										<span className="truncate">{product.name}</span>
										{product.soldOut ? (
											<span className="shrink-0 rounded-full bg-neutral-900 px-2 py-0.5 text-[11px] font-bold text-white">
												Habis
											</span>
										) : null}
									</p>
									<p className="text-xs text-neutral-500">
										{product.category} · stok {product.stock}
									</p>
									<p className="mt-1 text-sm font-bold text-orange-700">
										{fmtDecimalMoney(product.price)}
									</p>
									<div className="mt-2 flex items-center gap-2">
										<button
											type="button"
											aria-label={`Kurangi ${product.name}`}
											onClick={() => decreaseProduct(product, quantity - 1)}
											className="h-7 w-7 rounded-md border border-neutral-200"
										>
											−
										</button>
										<span className="min-w-5 text-center text-sm">
											{quantity}
										</span>
										<button
											type="button"
											aria-label={`Tambah ${product.name}`}
											disabled={product.soldOut || quantity >= product.stock}
											onClick={() => addProduct(product)}
											className="h-7 w-7 rounded-md border border-neutral-200 disabled:opacity-40"
										>
											+
										</button>
									</div>
								</div>
							</article>
						);
					})}
				</div>
			)}
		</PublicPageLayout>
	);
}
