import {
	AlertTriangle,
	ChevronRight,
	Download,
	Info,
	Printer,
	ReceiptText,
	ShoppingBag,
	Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/features/shared/components/EmptyState";
import { fmtDateTime, fmtRp } from "@/features/shared/lib/format";
import { mutationErrorMessage, queryErrorMessage } from "@/lib/query-errors";
import type { PeriodeKind } from "@/server/periode";
import { useGenerateReport } from "../mutations";
import {
	type ReportDetail,
	type ReportSelection,
	type SavedReportRow,
	useReportDetail,
	useReportList,
} from "../queries";
import { PeriodePicker, type Rentang } from "./PeriodePicker";
import { ReportDetailSkeleton, ReportStatsSkeleton } from "@/components/ui/skeletons";

function toCsv(detail: ReportDetail): string {
	const head = "no_pesanan;tanggal;kasir;metode;total;jumlah_item";
	const lines = detail.pesanan.map((o) =>
		[
			o.id,
			o.tanggal,
			`"${o.kasir.replace(/"/g, '""')}"`,
			o.metode ?? "",
			o.total,
			o.itemCount,
		].join(";"),
	);
	return [...(lines ? [head, ...lines] : [head])].join("\n");
}

function todayRange(): Rentang {
	const t = new Date();
	const d = new Date(t.getFullYear(), t.getMonth(), t.getDate());
	return { from: d, to: d };
}

const KIND_STYLE: Record<string, string> = {
	mingguan: "bg-sky-100 text-sky-700",
	bulanan: "bg-emerald-100 text-emerald-700",
};

function kindLabel(kind: PeriodeKind | null): string {
	if (kind === "mingguan") return "Mingguan";
	if (kind === "bulanan") return "Bulanan";
	return "Kustom";
}

function detailKindOf(periode: string): PeriodeKind | null {
	if (/^\d{4}-W(0[1-9]|[1-4][0-9]|5[0-3])$/.test(periode)) return "mingguan";
	if (/^\d{4}-(0[1-9]|1[0-2])$/.test(periode)) return "bulanan";
	return null;
}

function metodeLabel(metode: string | null): string {
	if (metode === "tunai") return "Tunai";
	if (metode === "non_tunai") return "Non-tunai";
	return "-";
}

export function ReportsView() {
	const [range, setRange] = useState<Rentang>(todayRange);
	const [selection, setSelection] = useState<ReportSelection | null>(null);
	const [notice, setNotice] = useState<string | null>(null);

	const listQuery = useReportList();
	const rows: SavedReportRow[] = listQuery.data ?? [];
	const loading = listQuery.isPending;
	const detailQuery = useReportDetail(selection);
	const detail = detailQuery.data ?? null;
	const detailLoading = detailQuery.isPending;
	const generateMutation = useGenerateReport();
	const working = generateMutation.isPending || detailQuery.isFetching === true;

	const error = generateMutation.isError
		? mutationErrorMessage(generateMutation.error, "Gagal generate laporan")
		: listQuery.isError
			? queryErrorMessage(listQuery.error, "Gagal memuat laporan")
			: detailQuery.isError
				? queryErrorMessage(detailQuery.error, "Gagal memuat detail")
				: null;

	function openDetail(p: string) {
		setNotice(null);
		setSelection({ kind: "periode", periode: p });
	}

	function generate() {
		setNotice(null);
		generateMutation.mutate(
			{ range },
			{
				onSuccess: (result) => {
					setNotice(result.notice);
					setSelection(result.selection);
				},
			},
		);
	}

	function downloadCsv() {
		if (!detail) return;
		const blob = new Blob([toCsv(detail)], {
			type: "text/csv;charset=utf-8",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `laporan-${detail.periode.replace(/[^A-Za-z0-9-]+/g, "_")}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}

	const liveTotal = useMemo(() => {
		if (!detail) return 0;
		return detail.pesanan.reduce((s, o) => s + Number(o.total), 0);
	}, [detail]);

	const stats = useMemo(() => {
		if (!detail || detail.pesanan.length === 0) return null;
		const count = detail.pesanan.length;
		return {
			total: liveTotal,
			count,
			avg: liveTotal / count,
		};
	}, [detail, liveTotal]);

	const outOfSync =
		detail?.tersimpan !== null &&
		detail?.tersimpan !== undefined &&
		Number(detail.tersimpan) !== liveTotal;

	return (
		<div className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-8">
			<div className="hidden print:block">
				<h1 className="text-xl font-bold">Dapur Ina Aina</h1>
				<p className="text-sm text-neutral-500">
					Laporan Penjualan{detail ? ` — ${detail.periode}` : ""}
				</p>
			</div>

			<div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
				<div>
					<h1 className="text-xl font-bold sm:text-2xl">Laporan Penjualan</h1>
				</div>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={downloadCsv}
						disabled={!detail || working}
						className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50"
					>
						<Download className="size-4" />
						Unduh CSV
					</button>
					<button
						type="button"
						onClick={() => window.print()}
						disabled={!detail}
						className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50"
					>
						<Printer className="size-4" />
						Cetak
					</button>
				</div>
			</div>

			<div className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm print:hidden">
				<div>
					<span className="text-xs font-semibold text-neutral-500">
						Rentang tanggal
					</span>
					<div className="mt-1">
						<PeriodePicker
							range={range}
							onApply={(r) => {
								setRange(r);
								setSelection(null);
								setNotice(null);
							}}
						/>
					</div>
				</div>
				<button
					type="button"
					onClick={() => void generate()}
					disabled={working}
					className="rounded-lg bg-[#F97316] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ea6a0a] disabled:opacity-50"
				>
					{working ? "Memproses…" : "Generate / Refresh"}
				</button>
			</div>
			{error ? (
				<p className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 print:hidden">
					<AlertTriangle className="mt-0.5 size-4 shrink-0" />
					{error}
				</p>
			) : null}
			{notice ? (
				<p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 print:hidden">
					<Info className="mt-0.5 size-4 shrink-0" />
					{notice}
				</p>
			) : null}

			{stats ? (
				<div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
						<span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#F97316]">
							<Wallet className="size-5" />
						</span>
						<span className="min-w-0">
							<span className="block text-xs font-medium text-neutral-500">
								Total penjualan
							</span>
							<span className="block truncate text-lg font-bold text-neutral-900">
								{fmtRp(stats.total)}
							</span>
						</span>
					</div>
					<div className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
						<span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
							<ReceiptText className="size-5" />
						</span>
						<span className="min-w-0">
							<span className="block text-xs font-medium text-neutral-500">
								Jumlah pesanan
							</span>
							<span className="block text-lg font-bold text-neutral-900">
								{stats.count} pesanan
							</span>
						</span>
					</div>
					<div className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
						<span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
							<ShoppingBag className="size-5" />
						</span>
						<span className="min-w-0">
							<span className="block text-xs font-medium text-neutral-500">
								Rata-rata per pesanan
							</span>
							<span className="block truncate text-lg font-bold text-neutral-900">
								{fmtRp(Math.round(stats.avg * 100) / 100)}
							</span>
						</span>
					</div>
				</div>
			) : working ? (
				<ReportStatsSkeleton />
			) : null}

			<div className="mt-5 grid grid-cols-1 items-start gap-5 xl:grid-cols-[380px_1fr]">
				<section className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm print:hidden">
					<h2 className="border-b border-neutral-100 px-5 py-3.5 text-sm font-bold">
						Laporan tersimpan
						{rows.length > 0 ? (
							<span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-500">
								{rows.length}
							</span>
						) : null}
					</h2>
					{loading ? (
						<div className="space-y-3 px-5 py-4">
							{[0, 1, 2].map((i) => (
								<div
									key={i}
									className="h-12 animate-pulse rounded-xl bg-neutral-100"
								/>
							))}
						</div>
					) : rows.length === 0 ? (
						<EmptyState
							variant="report"
							title="Belum ada laporan tersimpan"
							description="Generate laporan pertama dari periode penjualan yang tersedia."
							size="sm"
							surface="plain"
							className="px-5 py-8"
							action={
								<button
									type="button"
									onClick={() => void generate()}
									disabled={working}
									className="rounded-xl bg-[#F97316] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#ea6a0a] disabled:opacity-50"
								>
									{working ? "Memproses…" : "Generate laporan"}
								</button>
							}
						/>
					) : (
						<ul className="max-h-[480px] divide-y divide-neutral-100 overflow-y-auto p-2">
							{rows.map((r) => {
								const selected = detail?.periode === r.periode;
								return (
									<li key={r.id}>
										<button
											type="button"
											onClick={() => void openDetail(r.periode)}
											className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
												selected
													? "bg-orange-50 ring-1 ring-orange-200"
													: "hover:bg-neutral-50"
											}`}
										>
											<span className="min-w-0 flex-1">
												<span className="flex items-center gap-2">
													<span className="truncate text-sm font-bold text-neutral-900">
														{r.periode}
													</span>
													<span
														className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${KIND_STYLE[kindLabel(r.kind)] ?? "bg-neutral-100 text-neutral-500"}`}
													>
														{kindLabel(r.kind)}
													</span>
												</span>
												<span className="mt-0.5 block text-sm font-bold text-[#F97316]">
													{fmtRp(Number(r.totalPenjualan))}
												</span>
											</span>
											<ChevronRight
												className={`size-4 shrink-0 ${selected ? "text-[#F97316]" : "text-neutral-300"}`}
											/>
										</button>
									</li>
								);
							})}
						</ul>
					)}
				</section>

				<section className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
					<div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 bg-gradient-to-r from-orange-50/70 via-white to-white px-5 py-4">
						<div className="flex min-w-0 items-center gap-3">
							<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F97316] text-white shadow-sm">
								<ReceiptText className="size-5" />
							</span>
							<span className="min-w-0">
								<span className="flex flex-wrap items-center gap-2">
									<h2 className="truncate text-base font-bold text-neutral-900">
										{detail ? `Pesanan · ${detail.periode}` : "Detail pesanan"}
									</h2>
									{detail ? (
										<span
											className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${KIND_STYLE[detailKindOf(detail.periode) ?? ""] ?? "bg-neutral-100 text-neutral-500"}`}
										>
											{kindLabel(detailKindOf(detail.periode))}
										</span>
									) : null}
								</span>
								<span className="mt-0.5 block text-xs text-neutral-500">
									{detail && detail.pesanan.length > 0
										? `${detail.pesanan.length} pesanan`
										: "Rincian pesanan"}
								</span>
							</span>
						</div>
						{detail && detail.pesanan.length > 0 ? (
							<div className="flex shrink-0 items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-white shadow-sm">
								<Wallet className="size-4 text-orange-300" />
								<span className="text-xs font-medium text-neutral-300">
									Total
								</span>
								<span className="text-sm font-bold tabular-nums">
									{fmtRp(liveTotal)}
								</span>
							</div>
						) : null}
					</div>
					{outOfSync ? (
						<p className="flex items-start gap-2 border-b border-amber-100 bg-amber-50 px-5 py-2.5 text-xs text-amber-700">
							<AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
							Total tersimpan {fmtRp(Number(detail?.tersimpan))} berbeda dengan
							hitungan terbaru — generate ulang untuk sinkron.
						</p>
					) : null}
					{!detail ? (
						detailLoading ? (
							<ReportDetailSkeleton />
						) : (
							<EmptyState
								variant="report"
								title="Pilih laporan"
								description="Pilih laporan tersimpan atau generate periode baru untuk melihat rinciannya."
								size="md"
								surface="plain"
								className="px-5 py-10"
							/>
						)
					) : detail.pesanan.length === 0 ? (
						<EmptyState
							variant="report"
							title="Tidak ada pesanan pada rentang ini"
							description="Belum ada pesanan selesai dan lunas yang masuk ke rentang tersebut."
							size="md"
							surface="plain"
							className="px-5 py-10"
						/>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full min-w-[680px] text-sm">
								<thead>
									<tr className="bg-neutral-50 text-left text-xs text-neutral-500">
										<th className="px-5 py-2.5 font-semibold">No</th>
										<th className="px-4 py-2.5 font-semibold">Tanggal</th>
										<th className="px-4 py-2.5 font-semibold">Kasir</th>
										<th className="px-4 py-2.5 font-semibold">Metode</th>
										<th className="px-4 py-2.5 font-semibold">Item</th>
										<th className="px-5 py-2.5 text-right font-semibold">
											Total
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-neutral-100">
									{detail.pesanan.map((o) => (
										<tr key={o.id} className="transition hover:bg-orange-50/50">
											<td className="px-5 py-3 font-bold text-neutral-900">
												#{o.id}
											</td>
											<td className="whitespace-nowrap px-4 py-3 text-neutral-600">
												{fmtDateTime(o.tanggal)}
											</td>
											<td className="px-4 py-3">{o.kasir}</td>
											<td className="px-4 py-3">
												<span
													className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
														o.metode === "tunai"
															? "bg-emerald-100 text-emerald-700"
															: o.metode === "non_tunai"
																? "bg-sky-100 text-sky-700"
																: "bg-neutral-100 text-neutral-500"
													}`}
												>
													{metodeLabel(o.metode)}
												</span>
											</td>
											<td className="max-w-[280px] px-4 py-3 text-neutral-500">
												{o.items
													.map((i) => `${i.nama} ×${i.jumlah}`)
													.join(", ")}
											</td>
											<td className="whitespace-nowrap px-5 py-3 text-right font-bold text-neutral-900">
												{fmtRp(Number(o.total))}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
