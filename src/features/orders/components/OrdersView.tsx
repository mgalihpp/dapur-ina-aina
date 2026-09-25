import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useOrdersStore } from "@/features/orders/lib/orders-store";
import { EmptyState } from "@/features/shared/components/EmptyState";
import { fmtDecimalMoney } from "@/features/shared/lib/format";
import { mutationErrorMessage, queryErrorMessage } from "@/lib/query-errors";
import { useRecordPayment, useSetOrderStatus } from "../mutations";
import { useOrderDetail, useOrdersList } from "../queries";
import { InvoiceModal } from "./InvoiceModal";

type OrdersSearch = {
	start?: string;
	end?: string;
	status?: string;
	product?: string;
	orderId?: string;
};

export function OrdersView() {
	const search = useSearch({ strict: false }) as OrdersSearch;
	const navigate = useNavigate();
	const start = search.start ?? "";
	const end = search.end ?? "";
	const status = search.status ?? "";
	const product = search.product ?? "";
	const selectedId = search.orderId ?? null;
	const method = useOrdersStore((state) => state.method);
	const amount = useOrdersStore((state) => state.amount);
	const invoiceOpen = useOrdersStore((state) => state.invoiceOpen);
	const setPaymentDraft = useOrdersStore((state) => state.setPaymentDraft);
	const setMethod = useOrdersStore((state) => state.setMethod);
	const setAmount = useOrdersStore((state) => state.setAmount);
	const setInvoiceOpen = useOrdersStore((state) => state.setInvoiceOpen);

	const [productDraft, setProductDraft] = useState(product);
	const listRef = useRef<HTMLDivElement>(null);

	const listQuery = useOrdersList({ start, end, status, product });
	const orders = listQuery.data ?? [];
	const loading = listQuery.isPending;
	const refreshing = listQuery.isFetching && !listQuery.isPending;

	const detailQuery = useOrderDetail(selectedId);
	const detail = detailQuery.data ?? null;
	const detailLoading = Boolean(selectedId) && detailQuery.isPending;

	const recordPaymentMutation = useRecordPayment();
	const setStatusMutation = useSetOrderStatus();
	const busy = recordPaymentMutation.isPending || setStatusMutation.isPending;

	const error = listQuery.isError
		? queryErrorMessage(listQuery.error, "Gagal memuat pesanan.")
		: detailQuery.isError
			? queryErrorMessage(detailQuery.error, "Gagal memuat detail.")
			: recordPaymentMutation.isError
				? mutationErrorMessage(
						recordPaymentMutation.error,
						"Aksi tidak berhasil.",
					)
				: setStatusMutation.isError
					? mutationErrorMessage(
							setStatusMutation.error,
							"Aksi tidak berhasil.",
						)
					: null;

	const patchSearch = useCallback(
		(patch: Partial<OrdersSearch>) => {
			void navigate({
				search: (prev) => {
					const next = { ...(prev as OrdersSearch), ...patch };
					for (const key of Object.keys(next) as (keyof OrdersSearch)[]) {
						if (!next[key]) delete next[key];
					}
					return next;
				},
				replace: true,
			});
		},
		[navigate],
	);

	function selectOrder(id: string | null) {
		const top = listRef.current?.scrollTop ?? 0;
		patchSearch({ orderId: id ?? undefined });
		requestAnimationFrame(() => {
			if (listRef.current) listRef.current.scrollTop = top;
		});
	}

	useEffect(() => {
		setProductDraft(product);
	}, [product]);

	useEffect(() => {
		if (!productDraft && product) {
			patchSearch({ product: undefined });
			return;
		}
		if (!productDraft) return;
		const timer = setTimeout(() => {
			if (productDraft !== product) patchSearch({ product: productDraft });
		}, 350);
		return () => clearTimeout(timer);
	}, [productDraft, product, patchSearch]);

	useEffect(() => {
		if (!selectedId) return;
		if (!orders.length) return;
		if (!orders.some((row) => row.id === selectedId)) {
			patchSearch({ orderId: undefined });
		}
	}, [selectedId, orders, patchSearch]);

	// Draft pembayaran mengikuti detail yang sedang dibuka.
	useEffect(() => {
		if (!detail) return;
		setPaymentDraft({
			method: detail.paymentMethod ?? "tunai",
			amount: detail.paymentAmount ?? "",
		});
	}, [detail, setPaymentDraft]);

	return (
		<main className="mx-auto flex min-h-0 w-full max-w-[1500px] flex-1 flex-col px-4 py-6 sm:px-8">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<h1 className="text-2xl font-bold">Pesanan</h1>
				{refreshing ? (
					<span className="text-sm text-neutral-400">Memperbarui…</span>
				) : null}
			</div>
			<div className="mt-4 grid min-h-0 flex-1 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
				<section className="min-w-0">
					<div className="grid grid-cols-2 gap-2 rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm md:grid-cols-4">
						<label className="text-xs font-medium text-neutral-500">
							Dari
							<input
								aria-label="Dari tanggal"
								type="date"
								value={start}
								onChange={(event) =>
									patchSearch({ start: event.target.value || undefined })
								}
								className="mt-1 block w-full rounded-lg border border-neutral-200 px-2 py-2 text-sm text-neutral-900"
							/>
						</label>
						<label className="text-xs font-medium text-neutral-500">
							Sampai
							<input
								aria-label="Sampai tanggal"
								type="date"
								value={end}
								onChange={(event) =>
									patchSearch({ end: event.target.value || undefined })
								}
								className="mt-1 block w-full rounded-lg border border-neutral-200 px-2 py-2 text-sm text-neutral-900"
							/>
						</label>
						<div className="text-xs font-medium text-neutral-500">
							Status
							<Select
								value={status || "all"}
								onValueChange={(value) =>
									patchSearch({
										status: value === "all" ? undefined : value,
									})
								}
							>
								<SelectTrigger
									aria-label="Filter status"
									className="mt-1 w-full rounded-lg border-neutral-200 bg-white px-2 py-2 text-sm text-neutral-900"
								>
									<SelectValue placeholder="Semua status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Semua status</SelectItem>
									<SelectItem value="diproses">Diproses</SelectItem>
									<SelectItem value="selesai">Selesai</SelectItem>
									<SelectItem value="dibatalkan">Dibatalkan</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<label className="text-xs font-medium text-neutral-500">
							Nama produk
							<input
								value={productDraft}
								onChange={(event) => setProductDraft(event.target.value)}
								placeholder="Cari produk"
								className="mt-1 block w-full rounded-lg border border-neutral-200 px-2 py-2 text-sm text-neutral-900"
							/>
						</label>
					</div>
					{error ? (
						<p
							role="alert"
							className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
						>
							{error}
						</p>
					) : null}
					<div
						ref={listRef}
						className="mt-3 max-h-[70dvh] space-y-2 overflow-y-auto rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm"
					>
						{loading ? (
							<p className="p-5 text-sm text-neutral-500">Memuat transaksi…</p>
						) : (
							orders.map((order) => (
								<button
									key={order.id}
									type="button"
									onClick={() =>
										selectOrder(selectedId === order.id ? null : order.id)
									}
									className={`w-full rounded-xl p-4 text-left ${selectedId === order.id ? "bg-orange-50 ring-1 ring-orange-200" : "bg-neutral-50 hover:bg-neutral-100"}`}
								>
									<span className="flex items-center justify-between gap-2">
										<span className="font-bold">Pesanan #{order.id}</span>
										<span
											className={`rounded-full px-2 py-1 text-xs font-semibold ${order.paymentStatus === "lunas" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}
										>
											{order.paymentStatus === "lunas"
												? "Lunas"
												: order.paymentStatus === "belum_lunas"
													? "Belum lunas"
													: "Belum dibayar"}
										</span>
									</span>
									<span className="mt-2 flex justify-between gap-2 text-sm text-neutral-500">
										<span>
											{order.tanggal} · {order.kasir} · {order.status}
										</span>
										<span className="font-semibold text-neutral-900">
											{fmtDecimalMoney(order.total)}
										</span>
									</span>
								</button>
							))
						)}
						{!loading && orders.length === 0 ? (
							<EmptyState
								variant="orders"
								title={
									start || end || status || product
										? "Tidak ada transaksi yang cocok"
										: "Belum ada transaksi"
								}
								description={
									start || end || status || product
										? "Coba ubah atau kosongkan filter untuk melihat transaksi lain."
										: "Pesanan yang dibuat kasir akan muncul di daftar ini."
								}
								action={
									start || end || status || product ? (
										<button
											type="button"
											onClick={() =>
												patchSearch({
													start: undefined,
													end: undefined,
													status: undefined,
													product: undefined,
												})
											}
											className="rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-bold text-[var(--sea-ink)] transition hover:bg-neutral-50"
										>
											Reset filter
										</button>
									) : null
								}
								size="sm"
								surface="plain"
								className="p-5"
							/>
						) : null}
					</div>
				</section>
				<section className="min-w-0 self-start rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm xl:sticky xl:top-6">
					{detailLoading ? (
						<p className="text-sm text-neutral-500">Memuat detail…</p>
					) : !detail ? (
						<EmptyState
							variant="orders"
							title="Pilih pesanan"
							description="Pilih transaksi di daftar untuk melihat rincian, pembayaran, dan aksi status."
							size="sm"
							surface="plain"
							className="min-h-72"
						/>
					) : (
						<>
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div>
									<h2 className="text-xl font-bold">Pesanan #{detail.id}</h2>
									<p className="mt-1 text-sm text-neutral-500">
										{detail.tanggal} · Kasir {detail.kasir}
									</p>
								</div>
								<button
									type="button"
									onClick={() => setInvoiceOpen(true)}
									className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-semibold"
								>
									Lihat billing
								</button>
							</div>
							<div className="mt-4 overflow-x-auto">
								<table className="w-full min-w-[500px] text-left text-sm">
									<thead className="border-b border-neutral-100 text-xs text-neutral-500">
										<tr>
											<th className="py-2">Item</th>
											<th className="py-2 text-right">Qty</th>
											<th className="py-2 text-right">Harga</th>
											<th className="py-2 text-right">Subtotal</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-neutral-100">
										{detail.items.map((item) => (
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
							</div>
							<div className="mt-3 flex justify-between border-t border-neutral-100 pt-4 font-bold">
								<span>Total</span>
								<span>{fmtDecimalMoney(detail.total)}</span>
							</div>
							<div className="mt-4 rounded-xl bg-neutral-50 p-4">
								<h3 className="font-bold">Pembayaran</h3>
								<p className="mt-1 text-sm text-neutral-600">
									{detail.paymentStatus === "lunas"
										? "Lunas"
										: detail.paymentStatus === "belum_lunas"
											? `Belum lunas · tercatat ${fmtDecimalMoney(detail.paymentAmount ?? "0.00")}`
											: "Belum ada pembayaran"}
									{detail.change
										? ` · kembalian ${fmtDecimalMoney(detail.change)}`
										: ""}
								</p>
								{detail.status === "diproses" &&
								detail.paymentStatus !== "lunas" ? (
									<form
										onSubmit={(event) => {
											event.preventDefault();
											if (busy) return;
											recordPaymentMutation.mutate({
												orderId: Number(detail.id),
												method,
												amount,
											});
										}}
										className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[160px_1fr_auto]"
									>
										<div className="text-xs font-medium text-neutral-500">
											Metode
											<Select
												value={method}
												onValueChange={(value) =>
													setMethod(
														value === "non_tunai" ? "non_tunai" : "tunai",
													)
												}
												disabled={detail.paymentStatus === "belum_lunas"}
											>
												<SelectTrigger
													aria-label="Metode pembayaran"
													className="mt-1 w-full rounded-lg border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
												>
													<SelectValue placeholder="Pilih metode" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="tunai">Tunai</SelectItem>
													<SelectItem value="non_tunai">Non-tunai</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<label className="text-xs font-medium text-neutral-500">
											Jumlah kumulatif diterima
											<input
												type="text"
												inputMode="decimal"
												value={amount}
												onChange={(event) => setAmount(event.target.value)}
												placeholder="Contoh: 50000"
												className="mt-1 block w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900"
											/>
										</label>
										<button
											type="submit"
											disabled={busy}
											className="self-end rounded-lg bg-[#F97316] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
										>
											Catat pembayaran
										</button>
									</form>
								) : null}
							</div>
							{detail.status === "diproses" ? (
								<div className="mt-4 flex flex-wrap gap-2">
									{detail.paymentStatus === "lunas" ? (
										<button
											type="button"
											disabled={busy}
											onClick={() =>
												setStatusMutation.mutate({
													id: Number(detail.id),
													status: "selesai",
												})
											}
											className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
										>
											Tandai selesai
										</button>
									) : null}
									{detail.paymentStatus !== "lunas" ? (
										<button
											type="button"
											disabled={busy}
											onClick={() =>
												setStatusMutation.mutate({
													id: Number(detail.id),
													status: "dibatalkan",
												})
											}
											className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-50"
										>
											Batalkan pesanan
										</button>
									) : null}
								</div>
							) : (
								<p className="mt-4 text-sm text-neutral-500">
									Status pesanan: {detail.status}.
								</p>
							)}
						</>
					)}
				</section>
			</div>
			{invoiceOpen && detail ? (
				<InvoiceModal
					order={detail}
					onClose={() => setInvoiceOpen(false)}
					onPrinted={() => setInvoiceOpen(false)}
				/>
			) : null}
		</main>
	);
}
