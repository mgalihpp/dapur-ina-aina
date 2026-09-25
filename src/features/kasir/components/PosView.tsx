import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { fmtDecimalMoney } from "@/features/shared/lib/format";
import {
	fromMinorUnits,
	sumMoneyLines,
	toMinorUnits,
} from "@/features/shared/lib/money";
import { createOrder } from "@/server/order-functions";
import { listCashierCatalog } from "@/server/product-functions";

type CatalogProduct = Awaited<ReturnType<typeof listCashierCatalog>>[number];

export function PosView() {
	const navigate = useNavigate();
	const [products, setProducts] = useState<CatalogProduct[]>([]);
	const [cart, setCart] = useState<Map<number, number>>(() => new Map());
	const [category, setCategory] = useState("all");
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [createdId, setCreatedId] = useState<number | null>(null);

	useEffect(() => {
		let active = true;
		listCashierCatalog()
			.then((rows) => {
				if (active) setProducts(rows);
			})
			.catch((cause: unknown) => {
				if (active)
					setError(
						cause instanceof Error ? cause.message : "Gagal memuat menu.",
					);
			})
			.finally(() => {
				if (active) setLoading(false);
			});
		return () => {
			active = false;
		};
	}, []);

	const categories = [...new Set(products.map((product) => product.category))];
	const visibleProducts = products.filter(
		(product) =>
			(category === "all" || product.category === category) &&
			product.name
				.toLocaleLowerCase("id-ID")
				.includes(search.trim().toLocaleLowerCase("id-ID")),
	);
	const cartItems = useMemo(
		() =>
			products.flatMap((product) => {
				const quantity = cart.get(product.id);
				return quantity ? [{ ...product, quantity }] : [];
			}),
		[products, cart],
	);
	const total = sumMoneyLines(
		cartItems.map((item) => ({ price: item.price, quantity: item.quantity })),
	);

	function setQuantity(product: CatalogProduct, quantity: number) {
		setCart((current) => {
			const next = new Map(current);
			if (quantity <= 0) next.delete(product.id);
			else next.set(product.id, Math.min(quantity, product.stock));
			return next;
		});
		setCreatedId(null);
	}

	async function submitOrder() {
		if (busy || cartItems.length === 0) return;
		setBusy(true);
		setError(null);
		try {
			const order = await createOrder({
				data: {
					items: cartItems.map((item) => ({
						productId: item.id,
						quantity: item.quantity,
					})),
				},
			});
			setCreatedId(order.id);
			setCart(new Map());
			const updated = await listCashierCatalog();
			setProducts(updated);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: "Pesanan tidak dapat dibuat. Muat ulang menu dan coba lagi.",
			);
		} finally {
			setBusy(false);
		}
	}

	return (
		<main className="mx-auto grid w-full max-w-[1500px] flex-1 grid-cols-1 gap-5 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_360px] sm:px-8">
			<section className="min-w-0">
				<div className="flex flex-wrap items-end justify-between gap-3">
					<div>
						<h1 className="text-2xl font-bold">POS</h1>
					</div>
					<input
						aria-label="Cari produk"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Cari menu…"
						className="w-full max-w-xs rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500"
					/>
				</div>
				<div className="mt-4 flex gap-2 overflow-x-auto pb-1">
					<button
						type="button"
						onClick={() => setCategory("all")}
						className={`shrink-0 rounded-full px-4 py-2 text-sm ${category === "all" ? "bg-neutral-900 text-white" : "bg-white text-neutral-600"}`}
					>
						Semua
					</button>
					{categories.map((item) => (
						<button
							key={item}
							type="button"
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
				{createdId ? (
					<div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
						<span>Pesanan #{createdId} tersimpan. Stok sudah diperbarui.</span>
						<button
							type="button"
							onClick={() => void navigate({ to: "/kasir/orders" })}
							className="font-bold underline"
						>
							Buka transaksi
						</button>
					</div>
				) : null}
				{loading ? (
					<p className="mt-8 text-sm text-neutral-500">Memuat menu…</p>
				) : visibleProducts.length === 0 ? (
					<p className="mt-8 rounded-xl bg-white p-8 text-center text-sm text-neutral-500">
						Tidak ada produk tersedia sesuai pencarian.
					</p>
				) : (
					<div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
						{visibleProducts.map((product) => {
							const quantity = cart.get(product.id) ?? 0;
							const soldOut = product.stock <= 0;
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
											{soldOut ? (
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
												onClick={() => setQuantity(product, quantity - 1)}
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
												disabled={soldOut || quantity >= product.stock}
												onClick={() => setQuantity(product, quantity + 1)}
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
			</section>
			<aside className="h-fit rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm lg:sticky lg:top-6">
				<h2 className="text-lg font-bold">Keranjang</h2>
				<p className="text-sm text-neutral-500">
					{cartItems.reduce((count, item) => count + item.quantity, 0)} item
				</p>
				<ul className="mt-4 max-h-[48vh] space-y-3 overflow-y-auto">
					{cartItems.map((item) => (
						<li key={item.id} className="flex justify-between gap-3 text-sm">
							<span className="min-w-0">
								{item.name} × {item.quantity}
							</span>
							<span className="shrink-0 font-medium">
								{fmtDecimalMoney(
									fromMinorUnits(
										toMinorUnits(item.price) * BigInt(item.quantity),
									),
								)}
							</span>
						</li>
					))}
				</ul>
				<div className="mt-4 flex justify-between border-t border-neutral-100 pt-4 font-bold">
					<span>Total</span>
					<span>{fmtDecimalMoney(total)}</span>
				</div>
				<button
					type="button"
					disabled={busy || cartItems.length === 0}
					onClick={() => void submitOrder()}
					className="mt-4 w-full rounded-xl bg-[#F97316] py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
				>
					{busy ? "Menyimpan pesanan…" : "Buat pesanan"}
				</button>
			</aside>
		</main>
	);
}
