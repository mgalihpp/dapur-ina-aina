import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { AdminOrderDetail, AdminOrderRow } from "@/server/order-functions";
import { getOrderDetail, listOrders } from "@/server/order-functions";
import type { OrderDetail as OrderDetailData } from "../types";
import { InvoiceModal } from "./InvoiceModal";
import { OrderDetail } from "./OrderDetail";
import { OrderDetailEmpty } from "./OrderDetailEmpty";
import { OrderList } from "./OrderList";
import { OrderListEmpty } from "./OrderListEmpty";

function toView(d: AdminOrderDetail): OrderDetailData {
	return {
		id: d.id,
		table: d.table,
		guest: d.guest,
		total: d.total,
		payment: d.payment,
		customer: d.customer,
		paymentMethod: d.paymentMethod,
		items: d.items,
	};
}

export function OrdersView() {
	const navigate = useNavigate();
	const [orders, setOrders] = useState<AdminOrderRow[]>([]);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [detail, setDetail] = useState<AdminOrderDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [detailLoading, setDetailLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [invoiceId, setInvoiceId] = useState<string | null>(null);

	useEffect(() => {
		let alive = true;
		listOrders()
			.then((rows) => {
				if (alive) setOrders(rows);
			})
			.catch((e: unknown) => {
				if (alive)
					setError(e instanceof Error ? e.message : "Gagal memuat pesanan");
			})
			.finally(() => {
				if (alive) setLoading(false);
			});
		return () => {
			alive = false;
		};
	}, []);

	useEffect(() => {
		if (!selectedId) {
			setDetail(null);
			return;
		}
		let alive = true;
		setDetailLoading(true);
		getOrderDetail({ data: { id: selectedId } })
			.then((d) => {
				if (alive) setDetail(d);
			})
			.catch((e: unknown) => {
				if (alive) {
					setDetail(null);
					setError(e instanceof Error ? e.message : "Gagal memuat detail");
				}
			})
			.finally(() => {
				if (alive) setDetailLoading(false);
			});
		return () => {
			alive = false;
		};
	}, [selectedId]);

	const invoiceOrder =
		invoiceId && detail && detail.id === invoiceId ? toView(detail) : undefined;

	return (
		<div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 items-stretch gap-6 px-4 py-6 sm:px-8">
			<section className="flex min-h-0 w-full shrink-0 flex-col lg:w-[340px] xl:w-[380px]">
				<h1 className="shrink-0 text-xl font-bold">Pesanan Tertunda</h1>
				{error ? (
					<p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
						{error}
					</p>
				) : null}
				{loading ? (
					<p className="mt-4 text-sm text-neutral-500">Memuat pesanan…</p>
				) : orders.length === 0 ? (
					<OrderListEmpty />
				) : (
					<OrderList
						orders={orders}
						selectedId={selectedId}
						onSelect={setSelectedId}
					/>
				)}
			</section>

			<div className="hidden min-h-0 flex-1 flex-col lg:flex">
				<p
					aria-hidden="true"
					className="invisible shrink-0 select-none text-xl font-bold"
				>
					Pesanan Tertunda
				</p>
				<div className="mt-4 min-h-0 flex-1">
					{detailLoading ? (
						<p className="text-sm text-neutral-500">Memuat detail…</p>
					) : detail ? (
						<OrderDetail
							order={toView(detail)}
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
