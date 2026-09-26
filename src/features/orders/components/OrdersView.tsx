import { useNavigate, useSearch } from "@tanstack/react-router";
import { CalendarIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useOrdersStore } from "@/features/orders/lib/orders-store";
import {
	PeriodePicker,
	type Rentang,
} from "@/features/reports/components/PeriodePicker";
import { addDays, toISODate } from "@/features/reports/lib/periode";
import { EmptyState } from "@/features/shared/components/EmptyState";
import { SearchSelect } from "@/features/shared/components/search-select";
import { fmtDateTime, fmtDecimalMoney } from "@/features/shared/lib/format";
import { mutationErrorMessage, queryErrorMessage } from "@/lib/query-errors";
import { useRecordPayment, useSetOrderStatus } from "../mutations";
import { useOrderDetail, useOrdersList } from "../queries";
import { InvoiceModal } from "./InvoiceModal";
import { OrderList } from "./OrderList";

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

	function parseFilterDate(value: string): Date | undefined {
		const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
		if (!match) return undefined;
		const date = new Date(
			Number(match[1]),
			Number(match[2]) - 1,
			Number(match[3]),
		);
		return Number.isNaN(date.getTime()) ? undefined : date;
	}

	const fromDate = parseFilterDate(start);
	const toDate = parseFilterDate(end);
	const dateRange: Rentang | null =
		fromDate && toDate ? { from: fromDate, to: toDate } : null;

	function applyDefaultRange() {
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		patchSearch({
			start: toISODate(addDays(today, -29)),
			end: toISODate(today),
		});
	}

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
			<div className="mt-4 min-h-0 flex-1">
				<section className="min-w-0">
					<div className="grid grid-cols-2 gap-2 rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm md:grid-cols-3">
						<div className="text-xs font-medium text-neutral-500">
							Periode
							<div className="mt-1 flex flex-wrap items-center gap-2">
								{dateRange ? (
									<PeriodePicker
										range={dateRange}
										onApply={(r) => {
											patchSearch({
												start: toISODate(r.from),
												end: toISODate(r.to),
											});
										}}
									/>
								) : (
									<button
										type="button"
										onClick={applyDefaultRange}
										className="flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-700"
									>
										<CalendarIcon className="size-4 shrink-0" />
										Pilih rentang
									</button>
								)}
								{dateRange ? (
									<button
										type="button"
										onClick={() =>
											patchSearch({ start: undefined, end: undefined })
										}
										className="rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700"
									>
										Reset
									</button>
								) : null}
							</div>
						</div>
						<div className="text-xs font-medium text-neutral-500">
							Status
							<SearchSelect
								value={status || "all"}
								onChange={(value) =>
									patchSearch({
										status: value === "all" ? undefined : value,
									})
								}
								options={[
									{ value: "all", label: "Semua status" },
									{ value: "diproses", label: "Diproses" },
									{ value: "selesai", label: "Selesai" },
									{ value: "dibatalkan", label: "Dibatalkan" },
								]}
								placeholder="Semua status"
								searchPlaceholder="Cari status…"
								emptyText="Tidak ada status yang cocok."
								ariaLabel="Filter status"
								className="mt-1 w-full"
							/>
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
						className="thin-scroll mt-3 max-h-[70dvh] space-y-2 overflow-y-auto rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm"
					>
						{loading ? (
							<p className="p-5 text-sm text-neutral-500">Memuat transaksi…</p>
						) : (
							<OrderList
								orders={orders}
								selectedId={selectedId}
								onSelect={(id) => selectOrder(selectedId === id ? null : id)}
								onMove={(id, status) => {
									if (busy) return;
									setStatusMutation.mutate({ id: Number(id), status });
								}}
							/>
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
				<Sheet
					open={selectedId !== null}
					onOpenChange={(open) => {
						if (!open) selectOrder(null);
					}}
				>
					<SheetContent className="overflow-y-auto sm:max-w-lg">
						{detailLoading ? (
							<>
								<SheetTitle className="sr-only">Detail pesanan</SheetTitle>
								<p className="text-sm text-neutral-500">Memuat detail…</p>
							</>
						) : !detail ? (
							<>
								<SheetTitle className="sr-only">Detail pesanan</SheetTitle>
								<EmptyState
									variant="orders"
									title="Pilih pesanan"
									description="Pilih transaksi di daftar untuk melihat rincian, pembayaran, dan aksi status."
									size="sm"
									surface="plain"
									className="min-h-72"
								/>
							</>
						) : (
							<>
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<SheetTitle className="text-xl font-bold">
											Pesanan #{detail.id}
										</SheetTitle>
										<p className="mt-1 text-sm text-neutral-500">
											{fmtDateTime(detail.tanggal)} · Kasir {detail.kasir}
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
												<SearchSelect
													value={method}
													onChange={(value) =>
														setMethod(
															value === "non_tunai" ? "non_tunai" : "tunai",
														)
													}
													disabled={detail.paymentStatus === "belum_lunas"}
													options={[
														{ value: "tunai", label: "Tunai" },
														{ value: "non_tunai", label: "Non-tunai" },
													]}
													placeholder="Pilih metode"
													searchPlaceholder="Cari metode…"
													emptyText="Tidak ada metode yang cocok."
													ariaLabel="Metode pembayaran"
													className="mt-1 w-full"
												/>
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
					</SheetContent>
				</Sheet>
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
