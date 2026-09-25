import { useEffect } from "react";
import { fmtDecimalMoney } from "@/features/shared/lib/format";
import type { AdminOrderDetail } from "@/server/order-functions";

type InvoiceModalProps = {
	order: AdminOrderDetail;
	onClose: () => void;
	onPrinted: () => void;
};

export function InvoiceModal({ order, onClose, onPrinted }: InvoiceModalProps) {
	useEffect(() => {
		function onKey(event: KeyboardEvent) {
			if (event.key === "Escape") onClose();
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [onClose]);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:static print:block print:p-0">
			<button
				type="button"
				aria-label="Tutup struk"
				onClick={onClose}
				className="absolute inset-0 cursor-default bg-black/40 print:hidden"
			/>
			<article
				data-print-invoice
				className="relative max-h-full w-full max-w-[420px] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl print:max-h-none print:max-w-none print:overflow-visible print:rounded-none print:p-0 print:shadow-none"
			>
				<header className="text-center">
					<h2 className="text-xl font-bold">Dapur Ina Aina</h2>
					<p className="mt-1 text-sm text-neutral-500">
						Billing pesanan #{order.id}
					</p>
				</header>
				<dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 border-y border-dashed border-neutral-300 py-4 text-sm">
					<dt className="text-neutral-500">Tanggal</dt>
					<dd className="text-right font-medium">{order.tanggal}</dd>
					<dt className="text-neutral-500">Kasir</dt>
					<dd className="text-right font-medium">{order.kasir}</dd>
					<dt className="text-neutral-500">Status pesanan</dt>
					<dd className="text-right font-medium">{order.status}</dd>
					<dt className="text-neutral-500">Status pembayaran</dt>
					<dd className="text-right font-medium">
						{order.paymentStatus === "lunas" ? "Lunas" : "Belum lunas"}
					</dd>
					<dt className="text-neutral-500">Metode</dt>
					<dd className="text-right font-medium">
						{order.paymentMethod === "tunai"
							? "Tunai"
							: order.paymentMethod === "non_tunai"
								? "Non-tunai"
								: "Belum dibayar"}
					</dd>
					{order.paymentDate ? (
						<>
							<dt className="text-neutral-500">Tanggal bayar</dt>
							<dd className="text-right font-medium">{order.paymentDate}</dd>
						</>
					) : null}
				</dl>
				<table className="mt-4 w-full text-sm">
					<thead>
						<tr className="text-left text-xs text-neutral-500">
							<th className="pb-2">Item</th>
							<th className="pb-2 text-right">Qty</th>
							<th className="pb-2 text-right">Harga</th>
							<th className="pb-2 text-right">Subtotal</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-neutral-100">
						{order.items.map((item) => (
							<tr key={item.id}>
								<td className="py-2 pr-2">{item.name}</td>
								<td className="py-2 text-right">{item.qty}</td>
								<td className="py-2 text-right">
									{fmtDecimalMoney(item.price)}
								</td>
								<td className="py-2 text-right">
									{fmtDecimalMoney(item.subtotal)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
				<dl className="mt-4 space-y-2 border-t border-dashed border-neutral-300 pt-4 text-sm">
					<div className="flex justify-between font-bold">
						<dt>Total</dt>
						<dd>{fmtDecimalMoney(order.total)}</dd>
					</div>
					{order.paymentAmount ? (
						<div className="flex justify-between">
							<dt>Jumlah dibayar</dt>
							<dd>{fmtDecimalMoney(order.paymentAmount)}</dd>
						</div>
					) : null}
					{order.change ? (
						<div className="flex justify-between">
							<dt>Kembalian</dt>
							<dd>{fmtDecimalMoney(order.change)}</dd>
						</div>
					) : null}
				</dl>
				<div className="mt-6 flex justify-center print:hidden">
					<button
						type="button"
						onClick={() => {
							window.print();
							onPrinted();
						}}
						className="rounded-lg bg-[#EF7D1A] px-10 py-3 text-sm font-bold text-white"
					>
						Cetak billing
					</button>
				</div>
			</article>
		</div>
	);
}
