import { useNavigate, useSearch } from "@tanstack/react-router";
import { CalendarIcon, ReceiptText, RotateCcw, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
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

type OrdersSearch = {
	start?: string;
	end?: string;
	status?: string;
	product?: string;
	orderId?: string;
};

function statusBadgeVariant(status: string) {
	if (status === "selesai") return "default";
	if (status === "dibatalkan") return "destructive";
	return "secondary";
}

function statusLabel(status: string) {
	if (status === "selesai") return "Selesai";
	if (status === "dibatalkan") return "Dibatalkan";
	return "Diproses";
}

function paymentBadge(order: { paymentStatus: string }): {
	label: string;
	className: string;
} {
	if (order.paymentStatus === "lunas")
		return {
			label: "Lunas",
			className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
		};
	if (order.paymentStatus === "belum_lunas")
		return {
			label: "Belum lunas",
			className: "bg-amber-50 text-amber-800 ring-amber-200",
		};
	return {
		label: "Belum dibayar",
		className: "bg-neutral-100 text-neutral-600 ring-neutral-200",
	};
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
	const hasFilter = Boolean(start || end || status || product);

	function applyDefaultRange() {
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		patchSearch({
			start: toISODate(addDays(today, -29)),
			end: toISODate(today),
		});
	}

	function resetFilter() {
		setProductDraft("");
		patchSearch({
			start: undefined,
			end: undefined,
			status: undefined,
			product: undefined,
		});
	}

	useEffect(() => {
		if (!detail) return;
		setPaymentDraft({
			method: detail.paymentMethod ?? "tunai",
			amount: detail.paymentAmount ?? "",
		});
	}, [detail, setPaymentDraft]);

	return (
		<main className="mx-auto flex min-h-0 w-full max-w-[1500px] flex-1 flex-col px-4 py-6 sm:px-8">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Pesanan</h1>
					<p className="mt-0.5 text-sm text-muted-foreground">
						{loading
							? "Memuat transaksi…"
							: `${orders.length} transaksi${refreshing ? " · memperbarui…" : ""}`}
					</p>
				</div>
				{hasFilter ? (
					<Button variant="ghost" size="sm" onClick={resetFilter}>
						<RotateCcw />
						Reset filter
					</Button>
				) : null}
			</div>

			{error ? (
				<Alert variant="destructive" className="mt-4">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			) : null}

			<div className="mt-4 grid min-h-0 flex-1 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(340px,0.85fr)_minmax(0,1.15fr)]">
				<Card size="sm" className="min-w-0">
					<CardHeader>
						<CardTitle>Daftar transaksi</CardTitle>
						<CardDescription>
							Pilih satu transaksi untuk melihat rincian dan pembayaran.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr]">
							<div>
								<Label className="mb-1.5 block text-xs">Periode</Label>
								<div className="flex items-center gap-1.5">
									{dateRange ? (
										<>
											<PeriodePicker
												range={dateRange}
												onApply={(r) => {
													patchSearch({
														start: toISODate(r.from),
														end: toISODate(r.to),
													});
												}}
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() =>
													patchSearch({ start: undefined, end: undefined })
												}
											>
												Reset
											</Button>
										</>
									) : (
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={applyDefaultRange}
										>
											<CalendarIcon />
											Pilih rentang
										</Button>
									)}
								</div>
							</div>
							<div>
								<Label className="mb-1.5 block text-xs">Status</Label>
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
									className="w-full"
								/>
							</div>
						</div>
						<div className="relative">
							<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								value={productDraft}
								onChange={(event) => setProductDraft(event.target.value)}
								placeholder="Cari nama produk…"
								aria-label="Cari nama produk"
								className="pl-9"
							/>
						</div>
						<Separator />
						<ScrollArea className="max-h-[62dvh] pr-1">
							<div ref={listRef} className="space-y-2 pb-1">
								{loading ? (
									<div className="space-y-2">
										{Array.from({ length: 5 }).map((_, i) => (
											<Skeleton
												key={i}
												className="h-[76px] w-full rounded-2xl"
											/>
										))}
									</div>
								) : (
									orders.map((order) => {
										const active = selectedId === order.id;
										const pay = paymentBadge(order);
										return (
											<button
												key={order.id}
												type="button"
												onClick={() => selectOrder(active ? null : order.id)}
												aria-pressed={active}
												className={`w-full rounded-2xl border p-3.5 text-left transition outline-none ${
													active
														? "border-[#F97316]/40 bg-[#F97316]/5 ring-1 ring-[#F97316]/40"
														: "border-neutral-100 bg-neutral-50/60 hover:border-neutral-200 hover:bg-neutral-50"
												}`}
											>
												<span className="flex items-center justify-between gap-2">
													<span className="font-bold">Pesanan #{order.id}</span>
													<span className="flex items-center gap-1.5">
														<Badge variant={statusBadgeVariant(order.status)}>
															{statusLabel(order.status)}
														</Badge>
														<span
															className={`inline-flex items-center rounded-3xl px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${pay.className}`}
														>
															{pay.label}
														</span>
													</span>
												</span>
												<span className="mt-1.5 flex items-end justify-between gap-2 text-sm">
													<span className="text-xs text-muted-foreground">
														{fmtDateTime(order.tanggal)} · {order.kasir}
													</span>
													<span className="font-bold whitespace-nowrap">
														{fmtDecimalMoney(order.total)}
													</span>
												</span>
											</button>
										);
									})
								)}
								{!loading && orders.length === 0 ? (
									<EmptyState
										variant="orders"
										title={
											hasFilter
												? "Tidak ada transaksi yang cocok"
												: "Belum ada transaksi"
										}
										description={
											hasFilter
												? "Coba ubah atau kosongkan filter untuk melihat transaksi lain."
												: "Pesanan yang dibuat kasir akan muncul di daftar ini."
										}
										action={
											hasFilter ? (
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={resetFilter}
												>
													Reset filter
												</Button>
											) : null
										}
										size="sm"
										surface="plain"
										className="p-5"
									/>
								) : null}
							</div>
						</ScrollArea>
					</CardContent>
				</Card>

				<Card size="sm" className="min-w-0 xl:sticky xl:top-6">
					{detailLoading ? (
						<CardContent className="space-y-3">
							<Skeleton className="h-7 w-48" />
							<Skeleton className="h-4 w-64" />
							<Skeleton className="h-40 w-full rounded-2xl" />
							<Skeleton className="h-24 w-full rounded-2xl" />
						</CardContent>
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
							<CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
								<div>
									<div className="flex flex-wrap items-center gap-2">
										<CardTitle className="text-xl font-bold">
											Pesanan #{detail.id}
										</CardTitle>
										<Badge variant={statusBadgeVariant(detail.status)}>
											{statusLabel(detail.status)}
										</Badge>
									</div>
									<CardDescription className="mt-1">
										{fmtDateTime(detail.tanggal)} · Kasir {detail.kasir}
										{detail.meja ? ` · ${detail.meja}` : ""}
									</CardDescription>
								</div>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setInvoiceOpen(true)}
								>
									<ReceiptText />
									Billing
								</Button>
							</CardHeader>
							<CardContent>
								<div className="overflow-x-auto rounded-2xl border border-neutral-100">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Item</TableHead>
												<TableHead className="text-right">Qty</TableHead>
												<TableHead className="text-right">Harga</TableHead>
												<TableHead className="text-right">Subtotal</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{detail.items.map((item) => (
												<TableRow key={item.id}>
													<TableCell className="font-medium">
														{item.name}
													</TableCell>
													<TableCell className="text-right">
														{item.qty}
													</TableCell>
													<TableCell className="text-right whitespace-nowrap">
														{fmtDecimalMoney(item.price)}
													</TableCell>
													<TableCell className="text-right font-medium whitespace-nowrap">
														{fmtDecimalMoney(item.subtotal)}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
										<TableFooter>
											<TableRow>
												<TableCell colSpan={3}>Total</TableCell>
												<TableCell className="text-right font-bold">
													{fmtDecimalMoney(detail.total)}
												</TableCell>
											</TableRow>
										</TableFooter>
									</Table>
								</div>

								<div className="mt-3 rounded-2xl bg-neutral-50 p-4 ring-1 ring-neutral-100 ring-inset">
									<div className="flex flex-wrap items-center justify-between gap-2">
										<h3 className="font-bold">Pembayaran</h3>
										<span
											className={`inline-flex items-center rounded-3xl px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${paymentBadge(detail).className}`}
										>
											{paymentBadge(detail).label}
										</span>
									</div>
									<p className="mt-1 text-sm text-muted-foreground">
										{detail.paymentStatus === "lunas"
											? `Lunas · ${detail.paymentMethod === "non_tunai" ? "non-tunai" : "tunai"} ${fmtDecimalMoney(detail.paymentAmount ?? "0.00")}`
											: detail.paymentStatus === "belum_lunas"
												? `Terkumpul ${fmtDecimalMoney(detail.paymentAmount ?? "0.00")} dari ${fmtDecimalMoney(detail.total)}`
												: `Belum ada pembayaran · total ${fmtDecimalMoney(detail.total)}`}
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
											className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[140px_1fr_auto] sm:items-end"
										>
											<div>
												<Label className="mb-1.5 block text-xs">Metode</Label>
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
													className="w-full"
												/>
											</div>
											<div>
												<Label className="mb-1.5 block text-xs">
													Jumlah diterima
												</Label>
												<Input
													type="text"
													inputMode="decimal"
													value={amount}
													onChange={(event) => setAmount(event.target.value)}
													placeholder="Contoh: 50000"
												/>
											</div>
											<Button type="submit" disabled={busy}>
												Catat pembayaran
											</Button>
										</form>
									) : null}
								</div>

								{detail.status === "diproses" ? (
									<div className="mt-4 flex flex-wrap gap-2">
										{detail.paymentStatus === "lunas" ? (
											<Button
												type="button"
												disabled={busy}
												onClick={() =>
													setStatusMutation.mutate({
														id: Number(detail.id),
														status: "selesai",
													})
												}
												className="bg-emerald-700 text-white hover:bg-emerald-700/90"
											>
												Tandai selesai
											</Button>
										) : null}
										{detail.paymentStatus !== "lunas" ? (
											<Button
												type="button"
												variant="destructive"
												disabled={busy}
												onClick={() =>
													setStatusMutation.mutate({
														id: Number(detail.id),
														status: "dibatalkan",
													})
												}
											>
												Batalkan pesanan
											</Button>
										) : null}
									</div>
								) : (
									<p className="mt-4 text-sm text-muted-foreground">
										Status pesanan: {statusLabel(detail.status)}.
									</p>
								)}
							</CardContent>
						</>
					)}
				</Card>
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
