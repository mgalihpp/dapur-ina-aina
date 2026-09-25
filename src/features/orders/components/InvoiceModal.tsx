import { useEffect } from "react";
import { fmtMoney } from "@/features/shared/lib/format";
import type { OrderDetail as OrderDetailData } from "../types";

const TAX = 2;
const CHARGES = 8;

type InvoiceModalProps = {
	order: OrderDetailData;
	onClose: () => void;
	onPrinted: () => void;
};

export function InvoiceModal({ order, onClose, onPrinted }: InvoiceModalProps) {
	const subtotal = order.items.reduce((sum, item) => sum + item.price, 0);
	const total = subtotal + TAX + CHARGES;

	useEffect(() => {
		function onKey(event: KeyboardEvent) {
			if (event.key === "Escape") onClose();
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [onClose]);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<button
				type="button"
				aria-label="Tutup struk"
				onClick={onClose}
				className="absolute inset-0 cursor-default bg-black/40"
			/>
			<div
				role="dialog"
				aria-modal="true"
				aria-label={`Struk pesanan ${order.id}`}
				className="thin-scroll relative max-h-full w-full max-w-[400px] overflow-y-auto rounded-2xl bg-white shadow-xl"
			>
				<div className="p-6">
					<h2 className="text-lg font-bold">Pesanan #{order.id}</h2>
					<hr className="my-4 border-neutral-100" />
					<dl className="space-y-3">
						<div className="flex items-center justify-between">
							<dt className="text-sm font-semibold">Nama Pelanggan</dt>
							<dd className="text-sm font-bold">{order.customer}</dd>
						</div>
						<div className="flex items-center justify-between">
							<dt className="text-sm font-semibold">Tamu</dt>
							<dd className="text-sm font-bold">{order.guest}</dd>
						</div>
						<div className="flex items-center justify-between">
							<dt className="text-sm font-semibold">Pembayaran</dt>
							<dd className="text-sm font-bold">{order.paymentMethod}</dd>
						</div>
					</dl>
					<hr className="my-4 border-neutral-100" />
					<ul className="space-y-3">
						{order.items.map((item, index) => (
							<li
								key={item.id}
								className="grid grid-cols-[1fr_auto_auto] items-center gap-4 text-sm"
							>
								<span className="font-medium">
									{index + 1}). {item.name}
								</span>
								<span className="font-bold">{item.qty}</span>
								<span className="font-semibold">{fmtMoney(item.price)}</span>
							</li>
						))}
					</ul>
					<div className="mt-6 space-y-2">
						<div className="flex items-center justify-between">
							<span className="text-sm font-bold">Subtotal</span>
							<span className="text-sm font-bold">{fmtMoney(subtotal)}</span>
						</div>
						<div className="flex items-center justify-between text-neutral-400">
							<span className="text-sm">Pajak</span>
							<span className="text-sm">{fmtMoney(TAX)}</span>
						</div>
						<div className="flex items-center justify-between text-neutral-400">
							<span className="text-sm">Biaya Layanan</span>
							<span className="text-sm">{fmtMoney(CHARGES)}</span>
						</div>
					</div>
					<hr className="my-4 border-neutral-100" />
					<div className="flex items-center justify-between">
						<span className="text-base font-bold">Total</span>
						<span className="text-base font-bold">{fmtMoney(total)}</span>
					</div>
					<div className="mt-6 flex justify-center">
						<button
							type="button"
							onClick={onPrinted}
							className="rounded-lg bg-[#EF7D1A] px-12 py-3 text-sm font-bold text-white transition hover:bg-[#d96f15]"
						>
							Cetak Struk
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
