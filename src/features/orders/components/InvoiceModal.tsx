import { useEffect } from "react";
import { BillingSheet } from "@/features/shared/components/BillingSheet";
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
		const prevBodyOverflow = document.body.style.overflow;
		const prevHtmlOverflow = document.documentElement.style.overflow;
		document.body.style.overflow = "hidden";
		document.documentElement.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = prevBodyOverflow;
			document.documentElement.style.overflow = prevHtmlOverflow;
		};
	}, [onClose]);

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-label="Billing pesanan"
			onClick={onClose}
			className="fixed inset-0 z-50 overflow-y-auto bg-black/40 print:static print:overflow-visible print:bg-transparent print:p-0"
		>
			<div className="relative flex min-h-full items-start justify-center p-4 print:block print:p-0">
			<article
				data-print-invoice
				onClick={(event) => event.stopPropagation()}
				className="relative w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-xl print:max-w-none print:rounded-none print:p-0 print:shadow-none"
			>
				<BillingSheet
					data={{
						id: order.id,
						tanggal: order.tanggal,
						kasir: order.kasir,
						mejaNama: order.meja?.nama ?? null,
						tamu: order.tamu,
						status: order.status,
						paymentStatus: order.paymentStatus,
						paymentMethod: order.paymentMethod,
						paymentAmount: order.paymentAmount,
						paymentDate: order.paymentDate,
						change: order.change,
						total: order.total,
						items: order.items,
					}}
				/>
				<div className="mt-6 flex justify-center border-t border-dashed border-neutral-300 pt-6 print:hidden">
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
		</div>
	);
}
