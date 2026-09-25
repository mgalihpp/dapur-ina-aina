import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ORDER_DETAILS, ORDERS } from "../data/orders-mock";
import { InvoiceModal } from "./InvoiceModal";
import { OrderDetail } from "./OrderDetail";
import { OrderDetailEmpty } from "./OrderDetailEmpty";
import { OrderList } from "./OrderList";

export function OrdersView() {
	const navigate = useNavigate();
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [invoiceId, setInvoiceId] = useState<string | null>(null);
	const detail = selectedId ? ORDER_DETAILS[selectedId] : undefined;
	const invoiceOrder = invoiceId ? ORDER_DETAILS[invoiceId] : undefined;

	return (
		<div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 items-stretch gap-6 px-4 py-6 sm:px-8">
			<section className="flex min-h-0 w-full shrink-0 flex-col lg:w-[340px] xl:w-[380px]">
				<h1 className="shrink-0 text-xl font-bold">Pesanan Tertunda</h1>
				<OrderList
					orders={ORDERS}
					selectedId={selectedId}
					onSelect={setSelectedId}
				/>
			</section>

			<div className="hidden min-h-0 flex-1 flex-col lg:flex">
				<p
					aria-hidden="true"
					className="invisible shrink-0 select-none text-xl font-bold"
				>
					Pesanan Tertunda
				</p>
				<div className="mt-4 min-h-0 flex-1">
					{detail ? (
						<OrderDetail
							order={detail}
							onUnselect={() => setSelectedId(null)}
							onPrint={() => setInvoiceId(detail.id)}
						/>
					) : (
						<OrderDetailEmpty />
					)}
				</div>
			</div>

			{invoiceOrder ? (
				<InvoiceModal
					order={invoiceOrder}
					onClose={() => setInvoiceId(null)}
					onPrinted={() => void navigate({ to: "/admin/orders/success" })}
				/>
			) : null}
		</div>
	);
}
