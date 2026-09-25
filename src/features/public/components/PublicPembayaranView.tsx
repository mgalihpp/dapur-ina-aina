import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EmptyState } from "@/features/shared/components/EmptyState";
import { fmtDecimalMoney } from "@/features/shared/lib/format";
import { sumMoneyLines } from "@/features/shared/lib/money";
import { createPublicOrder } from "@/server/public-functions";
import type { GuestPaymentMethod } from "@/server/validators";
import {
	rehydrateGuestStore,
	selectGuestCart,
	selectGuestHydrated,
	selectGuestTable,
	useGuestStore,
} from "../lib/guest-store";
import { PublicOrderSummary, PublicPageLayout } from "./PublicLayout";

export function PublicPembayaranView() {
	const navigate = useNavigate();
	const cart = useGuestStore(selectGuestCart);
	const meja = useGuestStore(selectGuestTable);
	const hydrated = useGuestStore(selectGuestHydrated);
	const addOrder = useGuestStore((state) => state.addOrder);
	const clearCart = useGuestStore((state) => state.clearCart);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [paymentMethod, setPaymentMethod] =
		useState<GuestPaymentMethod>("tunai");

	useEffect(() => {
		void rehydrateGuestStore();
	}, []);

	async function confirmOrder() {
		if (busy || !hydrated || !meja || cart.length === 0) return;
		setBusy(true);
		setError(null);
		try {
			const order = await createPublicOrder({
				data: {
					items: cart.map((item) => ({
						productId: item.productId,
						quantity: item.quantity,
					})),
					meja: meja.nama,
					tamu: meja.tamu,
					paymentMethod,
				},
			});
			addOrder({
				id: order.id,
				tanggal: new Date().toISOString().slice(0, 10),
				meja: meja.nama,
			});
			clearCart();
			void navigate({
				to: "/pesanan/$orderId",
				params: { orderId: String(order.id) },
			});
		} catch (cause: unknown) {
			setError(
				cause instanceof Error
					? cause.message
					: "Pesanan tidak dapat dibuat. Coba lagi.",
			);
			setBusy(false);
		}
	}

	return (
		<PublicPageLayout
			summary={
				<PublicOrderSummary
					table={meja}
					cart={cart}
					hydrated={hydrated}
					error={error}
					notice={
						paymentMethod === "tunai" ? (
							<div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
								<p className="font-bold text-neutral-900">
									Pembayaran di kasir
								</p>
								<p className="mt-1 text-sm text-neutral-600">
									Pesanan akan menunggu pembayaran dari kasir.
								</p>
							</div>
						) : (
							<div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
								<p className="font-bold text-neutral-900">QRIS</p>
								<p className="mt-1 text-sm text-neutral-600">
									Pembayaran non-tunai diproses setelah konfirmasi.
								</p>
							</div>
						)
					}
					action={
						<button
							type="button"
							disabled={busy || !hydrated || !meja || cart.length === 0}
							onClick={() => void confirmOrder()}
							className="w-full rounded-xl bg-[#F97316] py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
						>
							{busy
								? "Memproses…"
								: paymentMethod === "non_tunai"
									? "Konfirmasi & bayar QRIS"
									: "Konfirmasi pesanan"}
						</button>
					}
				/>
			}
		>
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold">Pembayaran</h1>
				</div>
				<Link
					to="/keranjang"
					className="text-sm font-bold text-[#EF7D1A] underline"
				>
					Kembali ke keranjang
				</Link>
			</div>

			{hydrated && cart.length > 0 ? (
				<fieldset
					aria-label="Metode pembayaran"
					className="mt-6 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm sm:p-5"
				>
					<p className="text-sm font-bold">Metode pembayaran</p>
					<div className="mt-3 grid gap-3 sm:grid-cols-2">
						<label
							className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
								paymentMethod === "tunai"
									? "border-orange-300 bg-orange-50"
									: "border-neutral-200 hover:border-neutral-300"
							}`}
						>
							<input
								type="radio"
								name="paymentMethod"
								value="tunai"
								checked={paymentMethod === "tunai"}
								onChange={() => setPaymentMethod("tunai")}
								className="mt-0.5 h-4 w-4 accent-[#F97316]"
							/>
							<span>
								<span className="block font-bold">Tunai</span>
								<span className="mt-1 block text-sm text-neutral-500">
									Bayar di kasir setelah pesanan dibuat.
								</span>
							</span>
						</label>
						<label
							className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
								paymentMethod === "non_tunai"
									? "border-orange-300 bg-orange-50"
									: "border-neutral-200 hover:border-neutral-300"
							}`}
						>
							<input
								type="radio"
								name="paymentMethod"
								value="non_tunai"
								checked={paymentMethod === "non_tunai"}
								onChange={() => setPaymentMethod("non_tunai")}
								className="mt-0.5 h-4 w-4 accent-[#F97316]"
							/>
							<span>
								<span className="block font-bold">QRIS</span>
								<span className="mt-1 block text-sm text-neutral-500">
									Pembayaran non-tunai dengan QRIS.
								</span>
							</span>
						</label>
					</div>
				</fieldset>
			) : null}

			{!hydrated ? (
				<p className="mt-6 text-sm text-neutral-500">Memuat ringkasan…</p>
			) : cart.length === 0 ? (
				<EmptyState
					variant="cart"
					title="Keranjang masih kosong"
					description="Pilih menu sebelum melanjutkan ke pembayaran."
					size="lg"
					surface="solid"
					className="mt-6"
					action={
						<div className="flex flex-wrap justify-center gap-3">
							<Link
								to="/keranjang"
								className="rounded-xl bg-[#F97316] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#ea6a0a]"
							>
								Buka keranjang
							</Link>
							<Link
								to="/menu"
								className="rounded-xl border border-neutral-200 px-6 py-3 text-sm font-bold text-[var(--sea-ink)] transition hover:bg-neutral-50"
							>
								Lihat menu
							</Link>
						</div>
					}
				/>
			) : (
				<section className="mt-6 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm sm:p-5">
					<h2 className="font-bold">Item pesanan</h2>
					<ul className="mt-3 divide-y divide-neutral-100">
						{cart.map((item) => (
							<li
								key={item.productId}
								className="flex items-center justify-between gap-4 py-3 text-sm"
							>
								<div className="flex min-w-0 items-center gap-3">
									<img
										src={item.image}
										alt=""
										className="h-12 w-12 shrink-0 rounded-lg bg-neutral-100 object-cover"
									/>
									<span className="min-w-0 truncate">
										{item.name} × {item.quantity}
									</span>
								</div>
								<div className="shrink-0 text-right">
									<p className="text-xs text-neutral-500">
										{fmtDecimalMoney(item.price)} / item
									</p>
									<p className="font-semibold text-orange-700">
										{fmtDecimalMoney(
											sumMoneyLines([
												{ price: item.price, quantity: item.quantity },
											]),
										)}
									</p>
								</div>
							</li>
						))}
					</ul>
				</section>
			)}
		</PublicPageLayout>
	);
}
