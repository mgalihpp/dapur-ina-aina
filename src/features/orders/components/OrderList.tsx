import { fmtMoney } from "@/features/shared/lib/format";
import type { OrderSummary, PaymentStatus } from "../types";

const PAYMENT_STYLE: Record<PaymentStatus, string> = {
	Paid: "text-emerald-600",
	Unpaid: "text-orange-500",
};

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
	Paid: "Lunas",
	Unpaid: "Belum Lunas",
};

type OrderListProps = {
	orders: OrderSummary[];
	selectedId: string | null;
	onSelect: (id: string) => void;
};

export function OrderList({ orders, selectedId, onSelect }: OrderListProps) {
	return (
		<div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
			<h2 className="shrink-0 border-b border-neutral-100 px-5 py-4 text-base font-bold">
				Semua Pesanan
			</h2>
			<div className="thin-scroll min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
				{orders.map((o) => {
					const selected = selectedId === o.id;
					return (
						<button
							key={o.id}
							type="button"
							onClick={() => onSelect(o.id)}
							className={`w-full rounded-xl p-4 text-left transition ${
								selected ? "bg-[#EF7D1A]" : "bg-[#F5F6F8] hover:bg-neutral-100"
							}`}
						>
							<span className="flex items-center justify-between">
								<span
									className={`text-sm font-bold ${selected ? "text-white" : ""}`}
								>
									Pesanan #{o.id}
								</span>
								<span
									className={`text-xs font-semibold ${
										selected ? "text-white" : PAYMENT_STYLE[o.payment]
									}`}
								>
									{PAYMENT_LABEL[o.payment]}
								</span>
							</span>
							<span className="mt-2 flex items-center justify-between">
								<span
									className={`text-xs ${selected ? "text-white/90" : "text-neutral-400"}`}
								>
									Meja : {o.table} Tamu : {o.guest}
								</span>
								<span
									className={`text-sm font-bold ${selected ? "text-white" : ""}`}
								>
									{fmtMoney(o.total)}
								</span>
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
