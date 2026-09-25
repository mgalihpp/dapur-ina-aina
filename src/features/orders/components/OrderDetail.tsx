import { X } from "lucide-react";
import { fmtMoney } from "@/features/shared/lib/format";
import type { OrderDetail as OrderDetailData, PaymentStatus } from "../types";

const PAYMENT_STYLE: Record<PaymentStatus, string> = {
	Paid: "text-emerald-600",
	Unpaid: "text-orange-500",
};

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
	Paid: "Lunas",
	Unpaid: "Belum Lunas",
};

type OrderDetailProps = {
	order: OrderDetailData;
	onUnselect?: () => void;
	onPrint?: () => void;
};

export function OrderDetail({ order, onUnselect, onPrint }: OrderDetailProps) {
	return (
		<section className="flex h-full min-h-0 flex-col rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
			<div className="flex shrink-0 items-center justify-between gap-2">
				<h2 className="text-base font-bold">Pesanan #{order.id}</h2>
				<span className="ml-auto flex items-center gap-1">
					<span
						className={`text-xs font-semibold ${PAYMENT_STYLE[order.payment]}`}
					>
						{PAYMENT_LABEL[order.payment]}
					</span>
					{onUnselect ? (
						<button
							type="button"
							onClick={onUnselect}
							title="Tutup detail"
							aria-label="Tutup detail pesanan"
							className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
						>
							<X className="h-4 w-4" />
						</button>
					) : null}
				</span>
			</div>
			<hr className="my-4 shrink-0 border-neutral-100" />
			<div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
				<h3 className="text-sm font-bold">Detail</h3>
				<dl className="mt-3 grid grid-cols-4 gap-4">
					<div>
						<dt className="text-xs text-neutral-400">No. Meja</dt>
						<dd className="mt-1 text-sm font-bold">{order.table}</dd>
					</div>
					<div>
						<dt className="text-xs text-neutral-400">Tamu</dt>
						<dd className="mt-1 text-sm font-bold">{order.guest}</dd>
					</div>
					<div>
						<dt className="text-xs text-neutral-400">Pelanggan</dt>
						<dd className="mt-1 text-sm font-bold">{order.customer}</dd>
					</div>
					<div>
						<dt className="text-xs text-neutral-400">Pembayaran</dt>
						<dd className="mt-1 text-sm font-bold">{order.paymentMethod}</dd>
					</div>
				</dl>
				<h3 className="mt-6 text-sm font-bold">Pesanan</h3>
				<ul className="mt-3 space-y-3">
					{order.items.map((item) => (
						<li
							key={item.id}
							className="flex items-center gap-3 rounded-xl border border-neutral-100 p-3"
						>
							<span
								aria-hidden="true"
								className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F5F6F8] text-lg font-bold text-neutral-500"
							>
								{item.name.charAt(0)}
							</span>
							<span className="min-w-0 flex-1 truncate text-sm">
								{item.name}{" "}
								<span className="text-neutral-400">x{item.qty}</span>
							</span>
							<span className="shrink-0 text-sm font-bold text-[#EF7D1A]">
								{fmtMoney(item.price)}
							</span>
						</li>
					))}
				</ul>
			</div>
			<button
				type="button"
				onClick={onPrint}
				className="mt-6 w-full shrink-0 rounded-xl bg-[#EF7D1A] py-3 text-sm font-bold text-white transition hover:bg-[#d96f15]"
			>
				Cetak Struk
			</button>
		</section>
	);
}
