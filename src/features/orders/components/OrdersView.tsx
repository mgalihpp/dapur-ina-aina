import { useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarIcon, ReceiptText } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { sessionQueryOptions } from "@/features/auth/queries";
import { userRoleOf } from "@/lib/roles";
import { useOrdersStore } from "@/features/orders/lib/orders-store";
import {
	PeriodePicker,
	type Rentang,
} from "@/features/reports/components/PeriodePicker";
import { addDays, toISODate } from "@/features/reports/lib/periode";
import { EmptyState } from "@/features/shared/components/EmptyState";
import { ConfirmModal } from "@/features/shared/components/ConfirmModal";
import { SearchSelect } from "@/features/shared/components/search-select";
import { fmtDateTime, fmtDecimalMoney } from "@/features/shared/lib/format";
import { mutationErrorMessage, queryErrorMessage } from "@/lib/query-errors";
import { useDeleteOrder, useRecordPayment, useSetOrderStatus } from "../mutations";
import { useOrderDetail, useOrdersList } from "../queries";
import { InvoiceModal } from "./InvoiceModal";

type OrdersSearch = {
	start?: string;
	end?: string;
	status?: string;
	product?: string;
	orderId?: string;
};

function orderStatusLabel(status: "diproses" | "selesai" | "dibatalkan"): string {
	if (status === "selesai") return "Selesai";
	if (status === "dibatalkan") return "Dibatalkan";
	return "Diproses";
}

function orderStatusClass(status: "diproses" | "selesai" | "dibatalkan"): string {
	if (status === "selesai") return "bg-emerald-100 text-emerald-700";
	if (status === "dibatalkan") return "bg-neutral-200 text-neutral-600";
	return "bg-amber-100 text-amber-800";
}

function paymentStatusLabel(status: "lunas" | "belum_lunas" | null): string {
	if (status === "lunas") return "Lunas";
	if (status === "belum_lunas") return "Belum lunas";
	return "Belum dibayar";
}

function paymentStatusClass(status: "lunas" | "belum_lunas" | null): string {
	if (status === "lunas") return "bg-emerald-100 text-emerald-700";
	if (status === "belum_lunas") return "bg-amber-100 text-amber-800";
	return "bg-neutral-200 text-neutral-600";
}

/** Selisih tagihan dalam sen (hindari float). */
function cents(value: string): number {
	return Math.round(Number(value) * 100);
}

function centsToMoney(value: number): string {
	return (value / 100).toFixed(2);
}

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
	const [cancelOpen, setCancelOpen] = useState(false);
	const [finishOpen, setFinishOpen] = useState(false);
	const [payOpen, setPayOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
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
	const deleteOrderMutation = useDeleteOrder();
	const busy =
		recordPaymentMutation.isPending ||
		setStatusMutation.isPending ||
		deleteOrderMutation.isPending;
	const sessionQuery = useQuery(sessionQueryOptions());
	const isAdmin =
		sessionQuery.data?.user != null &&
		userRoleOf(sessionQuery.data.user) === "admin";

	const detailItemCount = detail?.items.length ?? 0;
	const detailTotalQty =
		detail?.items.reduce((sum, item) => sum + item.qty, 0) ?? 0;
	const detailPaidCents = detail?.paymentAmount
		? cents(detail.paymentAmount)
		: 0;
	const detailTotalCents = detail ? cents(detail.total) : 0;
	const detailSisaCents = detailTotalCents - detailPaidCents;
	const detailInputCents =
		/^\d{1,8}(\.\d{1,2})?$/.test(amount.trim())
			? cents(amount.trim())
			: null;

	const TUNAI_KEYS = [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"00",
		"0",
		"⌫",
	];
	const TUNAI_PRESETS = [10000, 20000, 50000, 100000];

	function pushDigit(key: string) {
		if (key === "⌫") {
			setAmount(amount.slice(0, -1));
			return;
		}
		setAmount(`${amount}${key}`.replace(/^0+(?=\d)/, ""));
	}

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
					: deleteOrderMutation.isError
						? mutationErrorMessage(
								deleteOrderMutation.error,
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
			amount:
				detail.paymentAmount && Number(detail.paymentAmount) > 0
					? detail.paymentAmount
					: "",
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
			<div className="mt-4 grid min-h-0 flex-1 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(340px,0.9fr)_minmax(0,1.1fr)]">
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
									className={`w-full rounded-xl p-3 text-left ${selectedId === order.id ? "bg-orange-50 ring-1 ring-orange-200" : "bg-neutral-50 hover:bg-neutral-100"}`}
								>
									<span className="flex items-center justify-between gap-2">
										<span className="text-sm font-bold">
											Pesanan #{order.id}
										</span>
										<span
											className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${order.paymentStatus === "lunas" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
										>
											{order.paymentStatus === "lunas"
												? "Lunas"
												: order.paymentStatus === "belum_lunas"
													? "Belum lunas"
													: "Belum dibayar"}
										</span>
									</span>
									<span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
										<span className="truncate">
											{fmtDateTime(order.tanggal)}
										</span>
										<span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[11px] font-bold text-neutral-700">
											{order.meja ? order.meja.nama : "Tanpa meja"}
										</span>
										{order.tamu ? (
											<span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[11px] font-bold text-neutral-700">
												{order.tamu} org
											</span>
										) : null}
										<span
											className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${order.status === "diproses" ? "bg-sky-100 text-sky-800" : order.status === "selesai" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}
										>
											{orderStatusLabel(order.status)}
										</span>
									</span>
									<span className="mt-1 flex items-center justify-between gap-2">
										<span className="truncate text-xs text-neutral-400">
											{order.kasir}
										</span>
										<span className="shrink-0 text-sm font-bold text-neutral-900 tabular-nums">
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
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div>
									<div className="flex flex-wrap items-center gap-2">
										<h2 className="text-xl font-bold">
											Pesanan #{detail.id}
										</h2>
										<span
											className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${orderStatusClass(detail.status)}`}
										>
											{orderStatusLabel(detail.status)}
										</span>
										<span
											className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${paymentStatusClass(detail.paymentStatus)}`}
										>
											{paymentStatusLabel(detail.paymentStatus)}
										</span>
									</div>
									<p className="mt-1.5 text-sm text-neutral-500">
										{fmtDateTime(detail.tanggal)} · Kasir {detail.kasir}
									</p>
								</div>
								<button
									type="button"
									onClick={() => setInvoiceOpen(true)}
									className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-semibold"
								>
									<ReceiptText className="size-4" aria-hidden="true" />
									Lihat billing
								</button>
							</div>
							<dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-neutral-50 p-4 text-sm sm:grid-cols-4">
								<div>
									<dt className="text-xs text-neutral-500">Meja</dt>
									<dd className="mt-0.5 font-semibold">
										{detail.meja ? `${detail.meja.nama} · ${detail.meja.lantai}` : "Tanpa meja"}
									</dd>
								</div>
								<div>
									<dt className="text-xs text-neutral-500">Tamu</dt>
									<dd className="mt-0.5 font-semibold tabular-nums">
										{detail.tamu ?? "–"}
									</dd>
								</div>
								<div>
									<dt className="text-xs text-neutral-500">Item</dt>
									<dd className="mt-0.5 font-semibold tabular-nums">
										{detailItemCount} menu · {detailTotalQty} pcs
									</dd>
								</div>
								<div>
									<dt className="text-xs text-neutral-500">Total</dt>
									<dd className="mt-0.5 font-semibold text-orange-700 tabular-nums">
										{fmtDecimalMoney(detail.total)}
									</dd>
								</div>
							</dl>
							<h3 className="mt-5 font-bold">Rincian item</h3>
							<div className="mt-2 overflow-x-auto">
								<table className="w-full text-left text-sm">
									<thead className="border-b border-neutral-100 text-xs text-neutral-500">
										<tr>
											<th className="py-2 pr-2">Item</th>
											<th className="py-2 text-right">Qty</th>
											<th className="py-2 text-right">Harga</th>
											<th className="py-2 text-right">Subtotal</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-neutral-100 tabular-nums">
										{detail.items.map((item) => (
											<tr key={item.id}>
												<td className="py-3 pr-2">{item.name}</td>
												<td className="py-3 text-right">{item.qty}</td>
												<td className="py-3 text-right">
													{fmtDecimalMoney(item.price)}
												</td>
												<td className="py-3 text-right font-medium">
													{fmtDecimalMoney(item.subtotal)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
							<div className="mt-3 flex justify-between border-t border-neutral-100 pt-4 font-bold">
								<span>Total</span>
								<span className="tabular-nums">
									{fmtDecimalMoney(detail.total)}
								</span>
							</div>
							<div className="mt-4 rounded-xl border border-neutral-200 p-4">
								<div className="flex items-center justify-between gap-3">
									<h3 className="font-bold">Pembayaran</h3>
									<span
										className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${paymentStatusClass(detail.paymentStatus)}`}
									>
										{paymentStatusLabel(detail.paymentStatus)}
									</span>
								</div>
								{detail.paymentStatus !== null ? (
									<dl className="mt-3 space-y-2 text-sm">
										<div className="flex items-center justify-between gap-3">
											<dt className="text-neutral-500">Metode</dt>
											<dd className="font-semibold">
												{detail.paymentMethod === "tunai"
													? "Tunai"
													: detail.paymentMethod === "non_tunai"
														? "Non-tunai"
														: "–"}
											</dd>
										</div>
										<div className="flex items-center justify-between gap-3">
											<dt className="text-neutral-500">Dibayar</dt>
											<dd className="font-semibold tabular-nums">
												{detail.paymentAmount
													? fmtDecimalMoney(detail.paymentAmount)
													: "–"}
											</dd>
										</div>
										{detail.paymentStatus === "belum_lunas" ? (
											<div className="flex items-center justify-between gap-3">
												<dt className="text-neutral-500">Sisa tagihan</dt>
												<dd className="font-bold text-amber-700 tabular-nums">
													{fmtDecimalMoney(centsToMoney(detailSisaCents))}
												</dd>
											</div>
										) : null}
										{detail.change && Number(detail.change) > 0 ? (
											<div className="flex items-center justify-between gap-3">
												<dt className="text-neutral-500">Kembalian</dt>
												<dd className="font-semibold tabular-nums">
													{fmtDecimalMoney(detail.change)}
												</dd>
											</div>
										) : null}
										{detail.paymentDate ? (
											<div className="flex items-center justify-between gap-3">
												<dt className="text-neutral-500">Tanggal bayar</dt>
												<dd className="font-medium">
													{fmtDateTime(detail.paymentDate)}
												</dd>
											</div>
										) : null}
									</dl>
								) : (
									<p className="mt-2 text-sm text-neutral-500">
										Belum ada pembayaran.
									</p>
								)}
								{detail.status === "diproses" &&
								detail.paymentStatus !== "lunas" ? (
									<form
										onSubmit={(event) => {
											event.preventDefault();
											if (busy) return;
											setPayOpen(true);
										}}
										className="mt-4 space-y-4 border-t border-neutral-100 pt-4"
									>
										<div>
											<p className="text-xs font-bold text-neutral-700">
												Metode
											</p>
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
												className="mt-1.5 w-full sm:max-w-60"
											/>
										</div>
										{method === "tunai" ? (
											<div>
												<p className="text-xs font-bold text-neutral-700">
													Nominal
												</p>
												<div className="mt-2 flex flex-wrap gap-2">
													<button
														type="button"
														onClick={() =>
															setAmount(String(detailTotalCents / 100))
														}
														className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-100"
													>
														Uang pas
													</button>
													{TUNAI_PRESETS.map((nominal) => (
														<button
															key={nominal}
															type="button"
															onClick={() => setAmount(String(nominal))}
															className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-700 tabular-nums hover:bg-neutral-100"
														>
															{nominal >= 1000
																? `${nominal / 1000}rb`
																: String(nominal)}
														</button>
													))}
												</div>
												<fieldset className="mt-2 grid grid-cols-3 gap-1.5">
													<legend className="sr-only">
														Tombol angka tunai
													</legend>
													{TUNAI_KEYS.map((key) => (
														<button
															key={key}
															type="button"
															onClick={() => pushDigit(key)}
															className="rounded-lg bg-neutral-100 py-2.5 text-base font-bold text-neutral-800 tabular-nums hover:bg-neutral-200 active:bg-neutral-300"
														>
															{key}
														</button>
													))}
												</fieldset>
											</div>
										) : null}
										<div>
											<div className="flex items-center justify-between gap-2 text-xs font-medium text-neutral-500">
												<span>Jumlah diterima</span>
												{amount ? (
													<button
														type="button"
														onClick={() => setAmount("")}
														className="font-semibold text-neutral-400 hover:text-neutral-600"
													>
														Bersihkan
													</button>
												) : null}
											</div>
											<input
												type="text"
												inputMode="decimal"
												value={amount}
												onChange={(event) => setAmount(event.target.value)}
												placeholder={
													detail.paymentStatus === "belum_lunas"
														? `Sisa ${fmtDecimalMoney(centsToMoney(detailSisaCents))}`
														: "Contoh: 50000"
												}
												className="mt-1 block w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 tabular-nums"
											/>
											{method === "tunai" &&
											detailInputCents !== null &&
											detailInputCents > 0 ? (
												detailInputCents >= detailTotalCents ? (
													<p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 tabular-nums">
														Kembalian:{" "}
														{fmtDecimalMoney(
															centsToMoney(
																detailInputCents - detailTotalCents,
															),
														)}
													</p>
												) : (
													<p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700 tabular-nums">
														Kurang:{" "}
														{fmtDecimalMoney(
															centsToMoney(
																detailTotalCents - detailInputCents,
															),
														)}
													</p>
												)
											) : null}
										</div>
										<button
											type="submit"
											disabled={busy}
											className="w-full rounded-xl bg-[#F97316] py-3 text-sm font-bold text-white disabled:opacity-50"
										>
											Catat pembayaran
										</button>
										<ConfirmModal
											open={payOpen}
											title="Catat Pembayaran Ini ?"
											message={`${method === "tunai" ? "Tunai" : "Non-tunai"} ${fmtDecimalMoney(amount.trim() || "0")}${method === "tunai" && detailInputCents !== null && detailInputCents > 0 ? (detailInputCents >= detailTotalCents ? `, kembali ${fmtDecimalMoney(centsToMoney(detailInputCents - detailTotalCents))}` : `, kurang ${fmtDecimalMoney(centsToMoney(detailTotalCents - detailInputCents))}`) : ""}.`}
											busy={busy}
											onConfirm={() =>
												recordPaymentMutation.mutate(
													{
														orderId: Number(detail.id),
														method,
														amount,
													},
													{ onSettled: () => setPayOpen(false) },
												)
											}
											onCancel={() => setPayOpen(false)}
										/>
									</form>
								) : null}
							</div>
							{detail.status === "diproses" ? (
								<div className="mt-4">
									{detail.paymentStatus === "lunas" ? (
										<>
											<button
												type="button"
												disabled={busy}
												onClick={() => setFinishOpen(true)}
												className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
											>
												Tandai selesai
											</button>
											<ConfirmModal
												open={finishOpen}
												title="Selesaikan Pesanan Ini ?"
												message="Pesanan selesai dan tidak bisa diubah."
												busy={busy}
												onConfirm={() =>
													setStatusMutation.mutate(
														{
															id: Number(detail.id),
															status: "selesai",
														},
														{ onSettled: () => setFinishOpen(false) },
													)
												}
												onCancel={() => setFinishOpen(false)}
											/>
										</>
									) : (
										<>
											<button
												type="button"
												disabled={busy}
												onClick={() => setCancelOpen(true)}
												className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-50"
											>
												Batalkan pesanan
											</button>
											<ConfirmModal
												open={cancelOpen}
												title="Batalkan Pesanan Ini ?"
												message="Stok item akan dikembalikan."
												busy={busy}
												onConfirm={() =>
													setStatusMutation.mutate(
														{
															id: Number(detail.id),
															status: "dibatalkan",
														},
														{ onSettled: () => setCancelOpen(false) },
													)
												}
												onCancel={() => setCancelOpen(false)}
											/>
										</>
									)}
								</div>
							) : (
								<div className="mt-4">
									<p className="text-sm text-neutral-500">
										Pesanan {orderStatusLabel(detail.status).toLowerCase()}.
										{detail.status === "selesai" &&
										detail.meja !== null
											? " Meja masih terisi sampai dibebaskan kasir."
											: ""}
									</p>
									{detail.status === "dibatalkan" && isAdmin ? (
										<>
											<button
												type="button"
												disabled={busy}
												onClick={() => setDeleteOpen(true)}
												className="mt-3 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-50"
											>
												Hapus pesanan
											</button>
											<ConfirmModal
												open={deleteOpen}
												title="Hapus Pesanan Ini ?"
												message="Pesanan dibatalkan ini dihapus permanen dan tidak bisa dikembalikan."
												busy={busy}
												onConfirm={() =>
													deleteOrderMutation.mutate(
														{ id: Number(detail.id) },
														{
															onSuccess: () => {
																setDeleteOpen(false);
																selectOrder(null);
															},
															onError: () => setDeleteOpen(false),
														},
													)
												}
												onCancel={() => setDeleteOpen(false)}
											/>
										</>
									) : null}
								</div>
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
