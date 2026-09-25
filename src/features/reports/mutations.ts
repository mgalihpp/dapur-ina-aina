import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invalidateKeys } from "@/features/shared/lib/invalidate";
import { dataQueryFn } from "@/lib/query-helpers";
import { qk } from "@/lib/query-keys";
import { generateLaporan, getLaporanRentang } from "@/server/report-functions";
import type { Rentang } from "./components/PeriodePicker";
import { rangeLabel } from "./components/PeriodePicker";
import { exactMonthPeriode, exactWeekPeriode, toISODate } from "./lib/periode";
import type { ReportSelection } from "./queries";

const generateFn = dataQueryFn(generateLaporan);
const rangeFn = dataQueryFn(getLaporanRentang);

export type GenerateReportInput = { range: Rentang };

export type GenerateReportResult = {
	notice: string | null;
	selection: ReportSelection;
};

/**
 * Generate laporan: hitung rentang dulu, lalu simpan sebagai periode kalau
 * rentangnya pas seminggu/sebulan penuh. Refresh daftar datang dari invalidasi.
 */
export function useGenerateReport() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			range,
		}: GenerateReportInput): Promise<GenerateReportResult> => {
			const label = rangeLabel(range);
			const computed = await rangeFn({
				start: toISODate(range.from),
				end: toISODate(range.to),
			});
			const exact = exactWeekPeriode(range) ?? exactMonthPeriode(range);
			if (exact) {
				const saved = await generateFn({ periode: exact });
				return {
					notice: saved.empty
						? `Tidak ada pesanan selesai+lunas pada ${label} — tersimpan Rp0 agar teraudit.`
						: null,
					selection: { kind: "periode", periode: saved.periode },
				};
			}
			return {
				notice:
					computed.pesanan.length === 0
						? `Tidak ada pesanan selesai+lunas pada ${label} — laporan tidak disimpan.`
						: `Rentang kustom ${label} hanya dihitung — tidak disimpan ke daftar.`,
				selection: {
					kind: "range",
					start: toISODate(range.from),
					end: toISODate(range.to),
					label,
				},
			};
		},
		onSuccess: async () => {
			await invalidateKeys(queryClient, [
				qk.reports.list,
				qk.reports.detailRoot,
				qk.reports.rangeRoot,
			]);
		},
	});
}
