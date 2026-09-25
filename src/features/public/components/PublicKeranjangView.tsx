import { Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { EmptyState } from "@/features/shared/components/EmptyState";
import { fmtDecimalMoney } from "@/features/shared/lib/format";
import { sumMoneyLines } from "@/features/shared/lib/money";
import {
	rehydrateGuestStore,
	selectGuestCart,
	selectGuestHydrated,
	selectGuestTable,
	useGuestStore,
} from "../lib/guest-store";
import { PublicOrderSummary, PublicPageLayout } from "./PublicLayout";

function lineTotal(price: string, quantity: number): string {
	return sumMoneyLines([{ price, quantity }]);
}

export function PublicKeranjangView() {
	const navigate = useNavigate();
	const cart = useGuestStore(selectGuestCart);
	const meja = useGuestStore(selectGuestTable);
	const hydrated = useGuestStore(selectGuestHydrated);
	const updateCartItem = useGuestStore((state) => state.updateCartItem);
	const removeFromCart = useGuestStore((state) => state.removeFromCart);

	useEffect(() => {
		void rehydrateGuestStore();
	}, []);

	function changeQuantity(productId: number, quantity: number) {
		updateCartItem(productId, quantity);
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
							disabled={!hydrated || !meja || cart.length === 0}
							onClick={() => void navigate({ to: "/pembayaran" })}
							className="w-full rounded-xl bg-[#F97316] py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
						>
							Lanjut ke pembayaran
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
					<h1 className="text-2xl font-bold">Keranjang</h1>
				</div>
				<Link to="/menu" className="text-sm font-bold text-[#EF7D1A] underline">
					Tambah menu
				</Link>
			</div>

			{!hydrated ? (
				<p className="mt-6 text-sm text-neutral-500">Memuat keranjang…</p>
			) : cart.length === 0 ? (
				<EmptyState
					variant="cart"
					title="Keranjang masih kosong"
					description="Pilih menu favoritmu untuk memulai pesanan."
					size="lg"
					surface="solid"
					className="mt-6"
					action={
						<Link
							to="/menu"
							className="rounded-xl bg-[#F97316] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#ea6a0a]"
						>
							Lihat menu
						</Link>
					}
				/>
			) : (
				<section className="mt-6 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm sm:p-5">
					<h2 className="font-bold">Item pesanan</h2>
					<ul className="mt-3 divide-y divide-neutral-100">
						{cart.map((item) => (
							<li
								key={item.productId}
								className="flex gap-3 py-4 first:pt-0 last:pb-0"
							>
								<img
									src={item.image}
									alt=""
									className="h-16 w-16 shrink-0 rounded-xl bg-neutral-100 object-cover"
								/>
								<div className="min-w-0 flex-1">
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<p className="truncate font-semibold">{item.name}</p>
											{item.category ? (
												<p className="mt-0.5 text-xs text-neutral-500">
													{item.category}
												</p>
											) : null}
										</div>
										<button
											type="button"
											aria-label={`Hapus ${item.name}`}
											onClick={() => removeFromCart(item.productId)}
											className="rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600"
										>
											<Trash2 className="h-4 w-4" />
										</button>
									</div>
									<div className="mt-3 flex flex-wrap items-center justify-between gap-3">
										<div className="flex items-center gap-2">
											<button
												type="button"
												aria-label={`Kurangi ${item.name}`}
												onClick={() =>
													changeQuantity(item.productId, item.quantity - 1)
												}
												className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200"
											>
												<Minus className="h-3.5 w-3.5" />
											</button>
											<span className="min-w-6 text-center text-sm font-semibold">
												{item.quantity}
											</span>
											<button
												type="button"
												aria-label={`Tambah ${item.name}`}
												disabled={item.quantity >= item.stock}
												onClick={() =>
													changeQuantity(item.productId, item.quantity + 1)
												}
												className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
											>
												<Plus className="h-3.5 w-3.5" />
											</button>
										</div>
										<div className="text-right">
											<p className="text-xs text-neutral-500">
												{fmtDecimalMoney(item.price)} / item
											</p>
											<p className="font-bold text-orange-700">
												{fmtDecimalMoney(lineTotal(item.price, item.quantity))}
											</p>
										</div>
									</div>
								</div>
							</li>
						))}
					</ul>
				</section>
			)}
		</PublicPageLayout>
	);
}
