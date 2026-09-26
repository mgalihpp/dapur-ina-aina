import { fmtDate, fmtDateTime, fmtDecimalMoney } from "../lib/format";

export type BillingData = {
	id: string;
	tanggal: string;
	kasir: string;
	mejaNama: string | null;
	tamu: number | null;
	status: "diproses" | "selesai" | "dibatalkan";
	paymentStatus: "lunas" | "belum_lunas" | null;
	paymentMethod: "tunai" | "non_tunai" | null;
	paymentAmount: string | null;
	paymentDate: string | null;
	change: string | null;
	total: string;
	items: {
		id: string;
		name: string;
		qty: number;
		price: string;
		subtotal: string;
	}[];
};

function stampOf(data: BillingData): string {
	if (data.status === "dibatalkan") return "DIBATALKAN";
	if (data.paymentStatus === "lunas") return "LUNAS";
	if (data.paymentStatus === "belum_lunas") return "BELUM LUNAS";
	return "MENUNGGU PEMBAYARAN";
}

function methodLabel(method: BillingData["paymentMethod"]): string {
	if (method === "tunai") return "Tunai";
	if (method === "non_tunai") return "QRIS";
	return "–";
}

function cents(value: string): number {
	return Math.round(Number(value) * 100);
}

export function BillingSheet({ data }: { data: BillingData }) {
	const hasChange = data.change !== null && Number(data.change) > 0;
	const sisa =
		data.paymentStatus === "belum_lunas" && data.paymentAmount
			? cents(data.total) - cents(data.paymentAmount)
			: 0;
	const stampDate = (data.paymentDate ?? data.tanggal).includes("T")
		? fmtDateTime(data.paymentDate ?? data.tanggal).replace(",", " -")
		: fmtDate(data.paymentDate ?? data.tanggal);

	return (
		<div className="text-sm text-neutral-900">
			<header className="text-center">
				<img
					src="/logo.png"
					alt="Dapur Ina Aina"
					className="mx-auto h-14 w-14 rounded-full object-cover"
				/>
				<h2 className="mt-3 text-xl font-bold">Dapur Ina Aina</h2>
				<p className="mt-2 font-bold">
					{data.mejaNama
						? `Makan di tempat / ${data.mejaNama} / ${data.tamu ?? "–"} orang`
						: "Bawa pulang"}
				</p>
			</header>

			<dl className="mt-4 border-t border-dashed border-neutral-300 pt-4">
				<div className="flex items-start justify-between gap-4">
					<div>
						<dt className="text-neutral-500">Tanggal</dt>
						<dd className="font-semibold">{fmtDate(data.tanggal)}</dd>
					</div>
					<div className="text-right">
						<dt className="text-neutral-500">Kasir</dt>
						<dd className="font-semibold">{data.kasir}</dd>
					</div>
				</div>
				<div className="mt-3">
					<dt className="text-neutral-500">No. Transaksi</dt>
					<dd className="font-semibold">DIA-{data.id}</dd>
				</div>
			</dl>

			<ul className="mt-4 space-y-1.5 border-t border-dashed border-neutral-300 pt-4">
				{data.items.map((item) => (
					<li key={item.id} className="flex items-baseline justify-between gap-3">
						<span>
							{item.name} x{item.qty}
						</span>
						<span className="font-medium tabular-nums">
							{fmtDecimalMoney(item.subtotal)}
						</span>
					</li>
				))}
			</ul>

			<div className="mt-4 border-t border-dashed border-neutral-300 pt-4">
				<h3 className="font-bold">Rincian Pembayaran</h3>
				<dl className="mt-2 space-y-1.5">
					<div className="flex items-baseline justify-between gap-3">
						<dt className="text-neutral-600">Subtotal</dt>
						<dd className="tabular-nums">{fmtDecimalMoney(data.total)}</dd>
					</div>
					<div className="flex items-baseline justify-between gap-3 text-base font-bold">
						<dt>Total</dt>
						<dd className="tabular-nums">{fmtDecimalMoney(data.total)}</dd>
					</div>
				</dl>
			</div>

			<div className="mt-4 border-t border-dashed border-neutral-300 pt-4">
				<h3 className="font-bold">Metode Pembayaran</h3>
				<dl className="mt-2 space-y-1.5">
					<div className="flex items-baseline justify-between gap-3">
						<dt className="text-neutral-600">
							{methodLabel(data.paymentMethod)}
						</dt>
						<dd className="tabular-nums">
							{fmtDecimalMoney(data.paymentAmount ?? data.total)}
						</dd>
					</div>
					{sisa > 0 ? (
						<div className="flex items-baseline justify-between gap-3">
							<dt className="text-neutral-600">Sisa</dt>
							<dd className="tabular-nums">
								{fmtDecimalMoney((sisa / 100).toFixed(2))}
							</dd>
						</div>
					) : null}
					{hasChange ? (
						<div className="flex items-baseline justify-between gap-3">
							<dt className="text-neutral-600">Kembalian</dt>
							<dd className="tabular-nums">
								{fmtDecimalMoney(data.change ?? "0")}
							</dd>
						</div>
					) : null}
				</dl>
			</div>

			<div className="mt-4 border-t border-dashed border-neutral-300 pt-4 text-center">
				<p className="font-bold tracking-wide">{stampOf(data)}</p>
				<p className="mt-1 text-neutral-600">{stampDate}</p>
				<p className="mt-4">Terima kasih atas pesanan Anda!</p>
			</div>
		</div>
	);
}
