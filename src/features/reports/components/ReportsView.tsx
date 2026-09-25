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
import { useCallback, useEffect, useMemo, useState } from "react";
import { fmtRp } from "@/features/shared/lib/format";
import type { PeriodeKind } from "@/server/periode";
import {
	generateLaporan,
	getLaporanDetail,
	getLaporanRentang,
	listLaporan,
} from "@/server/report-functions";
import { exactMonthPeriode, exactWeekPeriode, toISODate } from "../lib/periode";
import { PeriodePicker, type Rentang, rangeLabel } from "./PeriodePicker";

type SavedRow = {
	id: number;
	periode: string;
	totalPenjualan: string;
	kind: PeriodeKind | null;
};

type Detail = Awaited<ReturnType<typeof getLaporanDetail>>;

function toCsv(detail: Detail): string {
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
	return kind === "mingguan" ? "Mingguan" : "Bulanan";
}

function metodeLabel(metode: string | null): string {
	if (metode === "tunai") return "Tunai";
	if (metode === "non_tunai") return "Non-tunai";
	return "-";
}

function EmptyVector({ label }: { label: string }) {
	return (
		<svg
			width="180"
			height="140"
			viewBox="0 0 180 140"
			fill="none"
			aria-hidden="true"
			role="img"
			aria-label={label}
		>
			<ellipse cx="90" cy="124" rx="62" ry="8" fill="#F5F6F8" />
			<rect
				x="58"
				y="18"
				width="64"
				height="88"
				rx="8"
				fill="#fff"
				stroke="#E5E7EB"
				strokeWidth="3"
			/>
			<rect x="74" y="10" width="32" height="12" rx="6" fill="#EF7D1A" />
			<path
				d="M68 44h44M68 56h44M68 68h30"
				stroke="#E5E7EB"
				strokeWidth="3"
				strokeLinecap="round"
			/>
			<path
				d="M68 80h20"
				stroke="#EF7D1A"
				strokeWidth="3"
				strokeLinecap="round"
			/>
			<circle cx="130" cy="92" r="14" fill="#FDE9D7" />
			<path
				d="M124 92l4 4 8-8"
				stroke="#EF7D1A"
				strokeWidth="3"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function ReportsView() {
	const [range, setRange] = useState<Rentang>(todayRange);
	const [rows, setRows] = useState<SavedRow[]>([]);
	const [detail, setDetail] = useState<Detail | null>(null);
	const [loading, setLoading] = useState(true);
	const [working, setWorking] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);

	const refresh = useCallback(async () => {
		try {
			setError(null);
			const data = await listLaporan();
			setRows(data);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Gagal memuat laporan");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	async function openDetail(p: string) {
		setWorking(true);
		setError(null);
		setNotice(null);
		try {
			const d = await getLaporanDetail({ data: { periode: p } });
			setDetail(d);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Gagal memuat detail");
		} finally {
			setWorking(false);
		}
	}

	async function generate() {
		const r = range;
		const label = rangeLabel(r);
		setWorking(true);
		setError(null);
		setNotice(null);
		try {
			const computed = await getLaporanRentang({
				data: { start: toISODate(r.from), end: toISODate(r.to) },
			});
			// Rentang pas seminggu/sebulan penuh → simpan sebagai periode.
			const exact = exactWeekPeriode(r) ?? exactMonthPeriode(r);
			if (exact) {
				const saved = await generateLaporan({ data: { periode: exact } });
				if (saved.empty) {
					setNotice(
						`Tidak ada pesanan selesai+lunas pada ${label} — laporan tidak disimpan.`,
					);
					setDetail({ periode: label, tersimpan: null, pesanan: [] });
					return;
				}
				await refresh();
				await openDetail(saved.periode);
				return;
			}
			if (computed.pesanan.length === 0) {
				setNotice(
					`Tidak ada pesanan selesai+lunas pada ${label} — laporan tidak disimpan.`,
				);
			} else {
				setNotice(
					`Rentang kustom ${label} hanya dihitung — tidak disimpan ke daftar.`,
				);
			}
			setDetail({
				periode: label,
				tersimpan: null,
				pesanan: computed.pesanan,
			});
		} catch (e) {
			setError(e instanceof Error ? e.message : "Gagal generate laporan");
		} finally {
			setWorking(false);
		}
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
					<p className="mt-1 text-sm text-neutral-500">
						Rekap pesanan selesai & lunas per minggu atau bulan.
					</p>
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
								setDetail(null);
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
						<div className="flex flex-col items-center px-5 py-8 text-center">
							<EmptyVector label="Belum ada laporan tersimpan" />
							<p className="mt-3 text-sm font-bold text-neutral-900">
								Belum ada laporan tersimpan
							</p>
							<p className="mt-1 text-xs text-neutral-400">
								Pilih rentang tanggal di atas lalu generate.
							</p>
						</div>
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
					<div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 px-5 py-3.5">
						<h2 className="text-sm font-bold">
							{detail ? `Pesanan · ${detail.periode}` : "Detail pesanan"}
						</h2>
						{detail && detail.pesanan.length > 0 ? (
							<p className="text-sm text-neutral-500">
								{detail.pesanan.length} pesanan · Total{" "}
								<span className="font-bold text-neutral-900">
									{fmtRp(liveTotal)}
								</span>
							</p>
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
						<div className="flex flex-col items-center px-5 py-10 text-center">
							<EmptyVector label="Belum ada detail dipilih" />
							<p className="mt-3 text-sm font-bold text-neutral-900">
								Pilih laporan untuk melihat rinciannya
							</p>
							<p className="mt-1 max-w-[320px] text-xs text-neutral-400">
								Klik salah satu laporan tersimpan, atau generate dari rentang
								tanggal di atas.
							</p>
						</div>
					) : detail.pesanan.length === 0 ? (
						<div className="flex flex-col items-center px-5 py-10 text-center">
							<EmptyVector label="Tidak ada pesanan pada rentang ini" />
							<p className="mt-3 text-sm font-bold text-neutral-900">
								Tidak ada pesanan pada rentang ini
							</p>
							<p className="mt-1 max-w-[320px] text-xs text-neutral-400">
								Belum ada pesanan selesai dan lunas di {detail.periode}.
							</p>
						</div>
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
												{o.tanggal}
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
