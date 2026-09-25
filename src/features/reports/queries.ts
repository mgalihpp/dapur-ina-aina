import { queryOptions, useQuery } from "@tanstack/react-query";
import { dataQueryFn, passthroughQueryFn } from "@/lib/query-helpers";
import { qk } from "@/lib/query-keys";
import {
	getLaporanDetail,
	getLaporanRentang,
	listLaporan,
} from "@/server/report-functions";

const fetchReportList = passthroughQueryFn(listLaporan);
const fetchReportDetail = dataQueryFn(getLaporanDetail);
const fetchReportRange = dataQueryFn(getLaporanRentang);

export type ReportDetail = Awaited<ReturnType<typeof getLaporanDetail>>;
export type SavedReportRow = Awaited<ReturnType<typeof listLaporan>>[number];

/** Detail yang dibuka: laporan tersimpan, atau hasil hitung rentang kustom. */
export type ReportSelection =
	| { kind: "periode"; periode: string }
	| { kind: "range"; start: string; end: string; label: string };

export const reportListOptions = queryOptions({
	queryKey: qk.reports.list,
	queryFn: () => fetchReportList(),
});

export function useReportList() {
	return useQuery(reportListOptions);
}

function reportDetailOptions(selection: ReportSelection) {
	return queryOptions({
		queryKey:
			selection.kind === "periode"
				? qk.reports.detail(selection.periode)
				: qk.reports.range(selection.start, selection.end),
		queryFn: (): Promise<ReportDetail> =>
			selection.kind === "periode"
				? fetchReportDetail({ periode: selection.periode })
				: fetchReportRange({ start: selection.start, end: selection.end }).then(
						(computed) => ({
							periode: selection.label,
							tersimpan: null,
							pesanan: computed.pesanan,
						}),
					),
		retry: false,
	});
}

export function useReportDetail(selection: ReportSelection | null) {
	// Tanpa seleksi query tidak dijalankan; key cadangan hanya memuaskan tipe.
	const options = reportDetailOptions(
		selection ?? { kind: "periode", periode: "" },
	);
	return useQuery({ ...options, enabled: selection !== null });
}
