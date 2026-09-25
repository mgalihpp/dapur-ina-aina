import type { DashboardPeriod } from "../types";

const PERIODS: { id: DashboardPeriod; label: string }[] = [
	{ id: "today", label: "Hari Ini" },
	{ id: "week", label: "Minggu Ini" },
	{ id: "month", label: "Bulan Ini" },
	{ id: "year", label: "Tahun Ini" },
];

type PeriodFilterProps = {
	value: DashboardPeriod;
	onChange: (period: DashboardPeriod) => void;
};

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
	return (
		<div className="flex items-center gap-1 rounded-xl border border-neutral-200/70 bg-[#E8EAED] p-1.5">
			{PERIODS.map((p) => (
				<button
					key={p.id}
					type="button"
					onClick={() => onChange(p.id)}
					className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
						value === p.id
							? "bg-[#EF7D1A] text-white shadow-sm"
							: "text-neutral-500 hover:text-neutral-700"
					}`}
				>
					{p.label}
				</button>
			))}
		</div>
	);
}
