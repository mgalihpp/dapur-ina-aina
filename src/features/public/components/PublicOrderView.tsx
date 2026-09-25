import { Link } from "@tanstack/react-router";
import { ChevronLeft, ReceiptText } from "lucide-react";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { fmtDecimalMoney } from "@/features/shared/lib/format";
import type { PublicOrderDetail } from "@/server/public-functions";
import { getPublicOrderDetail } from "@/server/public-functions";

function orderStatusLabel(status: PublicOrderDetail["status"]): string {
	if (status === "diproses") return "Diproses";
	if (status === "selesai") return "Selesai";
	return "Dibatalkan";
}

function paymentStatusLabel(
	status: PublicOrderDetail["paymentStatus"],
): string {
	if (status === "lunas") return "Lunas";
	if (status === "belum_lunas") return "Belum lunas";
	return "Menunggu kasir";
}

function paymentMethodLabel(
	method: PublicOrderDetail["paymentMethod"],
): string {
	if (method === "tunai") return "Tunai";
	if (method === "non_tunai") return "QRIS";
	return "Menunggu kasir";
}

function QrisPanel({ orderId, total }: { orderId: string; total: string }) {
	return (
		<section className="mt-5 rounded-2xl border border-neutral-200 bg-white p-5 text-center shadow-sm">
			<h2 className="text-lg font-bold">QRIS</h2>
			<div className="mt-4 flex flex-col items-center">
				<div className="rounded-xl border border-neutral-200 p-3">
					<QRCode
						value={`DAPUR-INA-AINA|QRIS|${orderId}|${total}`}
						size={192}
						level="M"
						bgColor="#ffffff"
						fgColor="#000000"
						title="QRIS Dapur Ina Aina"
					/>
				</div>
				<div className="mt-4">
					<p className="text-sm text-neutral-500">Total pembayaran</p>
					<p className="mt-1 text-2xl font-bold text-neutral-900">
						{fmtDecimalMoney(total)}
					</p>
				</div>
			</div>
		</section>
	);
}

function toInvoiceOrder(order: PublicOrderDetail) {
	return {
		...order,
		kasir: "-",
		paymentDate: null,
	};
}

export function PublicOrderView({ orderId }: { orderId: string }) {
	const [order, setOrder] = useState<PublicOrderDetail | null>(null);
	const [invoice, setInvoice] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		getPublicOrderDetail({ data: { id: orderId } })
			.then((row) => {
				if (active) setOrder(row);
			})
			.catch((cause: unknown) => {
				if (active) {
					setError(
						cause instanceof Error ? cause.message : "Gagal memuat pesanan.",
					);
				}
			})
			.finally(() => {
				if (active) setLoading(false);
			});
		return () => {
			active = false;
		};
	}, [orderId]);

	if (loading) {
		return (
			<main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-10 sm:px-8">
				<p className="text-sm text-neutral-500">Memuat pesanan…</p>
			</main>
		);
	}

	if (error || !order) {
		return (
			<main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-10 sm:px-8">
				<p
					role="alert"
					className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
				>
					{error ?? "Pesanan tidak ditemukan."}
				</p>
				<Link to="/pesanan" className="mt-4 inline-block font-bold underline">
					Lihat pesanan
				</Link>
			</main>
		);
	}

	return (
		<main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-8">
			<Link
				to="/pesanan"
				aria-label="Kembali ke daftar pesanan"
				className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#F97316] text-white transition hover:bg-[#ea6a0a]"
			>
				<ChevronLeft className="h-5 w-5" />
			</Link>
			<div className="mx-auto w-full max-w-3xl">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div>
						<h1 className="text-2xl font-bold">Pesanan #{order.id}</h1>
						<div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-neutral-600">
							<span>
								Status pesanan:{" "}
								<strong className="font-semibold text-neutral-900">
									{orderStatusLabel(order.status)}
								</strong>
							</span>
							<span>
								Pembayaran:{" "}
								<strong className="font-semibold text-neutral-900">
									{paymentStatusLabel(order.paymentStatus)}
								</strong>
							</span>
						</div>
					</div>
					<button
						type="button"
						onClick={() => setInvoice(true)}
						className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold"
					>
						<ReceiptText className="size-4" aria-hidden="true" />
						{order.paymentStatus === "lunas" ? "Lihat struk" : "Lihat billing"}
					</button>
				</div>

				{order.paymentMethod === "non_tunai" ? (
					<QrisPanel orderId={order.id} total={order.total} />
				) : null}

				<section className="mt-5 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
					<dl className="grid grid-cols-2 gap-4 border-b border-neutral-100 pb-4 text-sm">
						<div>
							<dt className="text-neutral-500">Meja</dt>
							<dd className="mt-1 font-semibold">{order.meja ?? "–"}</dd>
						</div>
						<div>
							<dt className="text-neutral-500">Tamu</dt>
							<dd className="mt-1 font-semibold">{order.tamu ?? "–"}</dd>
						</div>
						<div>
							<dt className="text-neutral-500">Tanggal</dt>
							<dd className="mt-1 font-semibold">{order.tanggal}</dd>
						</div>
						<div>
							<dt className="text-neutral-500">Total</dt>
							<dd className="mt-1 font-semibold text-orange-700">
								{fmtDecimalMoney(order.total)}
							</dd>
						</div>
					</dl>
					<table className="mt-4 w-full text-left text-sm">
						<thead className="border-b border-neutral-100 text-xs text-neutral-500">
							<tr>
								<th className="py-2">Item</th>
								<th className="py-2 text-right">Qty</th>
								<th className="py-2 text-right">Harga</th>
								<th className="py-2 text-right">Subtotal</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-neutral-100">
							{order.items.map((item) => (
								<tr key={item.id}>
									<td className="py-3">{item.name}</td>
									<td className="py-3 text-right">{item.qty}</td>
									<td className="py-3 text-right">
										{fmtDecimalMoney(item.price)}
									</td>
									<td className="py-3 text-right">
										{fmtDecimalMoney(item.subtotal)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
					<div className="mt-3 flex justify-between border-t border-neutral-100 pt-4 font-bold">
						<span>Total</span>
						<span>{fmtDecimalMoney(order.total)}</span>
					</div>
					{order.paymentAmount ? (
						<div className="mt-2 flex justify-between text-sm">
							<span>Jumlah dibayar</span>
							<span>{fmtDecimalMoney(order.paymentAmount)}</span>
						</div>
					) : null}
					{order.change ? (
						<div className="mt-2 flex justify-between text-sm">
							<span>Kembalian</span>
							<span>{fmtDecimalMoney(order.change)}</span>
						</div>
					) : null}
				</section>

				<div className="mt-4 flex flex-wrap gap-4">
					<Link
						to="/pesanan"
						className="rounded-xl bg-[#F97316] px-5 py-3 text-sm font-bold text-white"
					>
						Lihat pesanan
					</Link>
					<Link to="/menu" className="py-3 text-sm font-bold underline">
						Pesan lagi
					</Link>
				</div>
				{invoice ? (
					<PublicInvoiceModal order={order} onClose={() => setInvoice(false)} />
				) : null}
			</div>
		</main>
	);
}

function PublicInvoiceModal({
	order,
	onClose,
}: {
	order: PublicOrderDetail;
	onClose: () => void;
}) {
	const view = toInvoiceOrder(order);
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:static print:block print:p-0">
			<button
				type="button"
				aria-label="Tutup struk"
				onClick={onClose}
				className="absolute inset-0 cursor-default bg-black/40 print:hidden"
			/>
			<article className="relative max-h-full w-full max-w-[420px] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl print:max-h-none print:max-w-none print:rounded-none print:shadow-none">
				<header className="text-center">
					<h2 className="text-xl font-bold">Dapur Ina Aina</h2>
					<p className="mt-1 text-sm text-neutral-500">
						Billing pesanan #{view.id}
					</p>
				</header>
				<dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 border-y border-dashed border-neutral-300 py-4 text-sm">
					<dt className="text-neutral-500">Tanggal</dt>
					<dd className="text-right font-medium">{view.tanggal}</dd>
					<dt className="text-neutral-500">Status pesanan</dt>
					<dd className="text-right font-medium">
						{orderStatusLabel(view.status)}
					</dd>
					<dt className="text-neutral-500">Status pembayaran</dt>
					<dd className="text-right font-medium">
						{paymentStatusLabel(view.paymentStatus)}
					</dd>
					<dt className="text-neutral-500">Metode</dt>
					<dd className="text-right font-medium">
						{paymentMethodLabel(view.paymentMethod)}
					</dd>
				</dl>
				<table className="mt-4 w-full text-sm">
					<thead>
						<tr className="text-left text-xs text-neutral-500">
							<th className="pb-2 text-left">Item</th>
							<th className="pb-2 text-right">Qty</th>
							<th className="pb-2 text-right">Harga</th>
							<th className="pb-2 text-right">Subtotal</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-neutral-100">
						{view.items.map((item) => (
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
						<dd>{fmtDecimalMoney(view.total)}</dd>
					</div>
					{view.paymentAmount ? (
						<div className="flex justify-between">
							<dt>Jumlah dibayar</dt>
							<dd>{fmtDecimalMoney(view.paymentAmount)}</dd>
						</div>
					) : null}
					{view.change ? (
						<div className="flex justify-between">
							<dt>Kembalian</dt>
							<dd>{fmtDecimalMoney(view.change)}</dd>
						</div>
					) : null}
				</dl>
				<div className="mt-6 flex justify-center print:hidden">
					<button
						type="button"
						onClick={() => {
							window.print();
							onClose();
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
