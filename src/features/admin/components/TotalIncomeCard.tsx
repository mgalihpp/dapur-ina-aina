import {
	Cell,
	Tooltip as ChartTooltip,
	Pie,
	PieChart,
	ResponsiveContainer,
} from "recharts";
import { fmtInt } from "@/features/shared/lib/format";
import type { IncomeSlice } from "../types";

export const cardClass =
	"rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm";

type TotalIncomeCardProps = {
	data: IncomeSlice[];
};

export function TotalIncomeCard({ data }: TotalIncomeCardProps) {
	const total = data.reduce((sum, s) => sum + s.value, 0);

	return (
		<section className={cardClass}>
			<h2 className="text-base font-bold">Total Pemasukan</h2>
			<div className="relative mx-auto h-[260px] w-full max-w-[340px]">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={data}
							dataKey="value"
							nameKey="label"
							innerRadius={84}
							outerRadius={104}
							paddingAngle={3}
							strokeWidth={0}
						>
							{data.map((slice) => (
								<Cell key={slice.label} fill={slice.color} />
							))}
						</Pie>
						<ChartTooltip
							contentStyle={{
								borderRadius: 12,
								border: "1px solid #eee",
								fontSize: 12,
							}}
							formatter={(value) => [fmtInt(Number(value)), "Pemasukan"]}
						/>
					</PieChart>
				</ResponsiveContainer>
				<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
					<span className="text-2xl font-bold tabular-nums leading-none whitespace-nowrap">
						{fmtInt(total)}
					</span>
				</div>
			</div>
			<div className="flex items-center justify-center gap-5 pt-2">
				{data.map((slice) => (
					<span
						key={slice.label}
						className="flex items-center gap-1.5 text-xs text-neutral-500"
					>
						<span
							className="h-2.5 w-2.5 rounded-full"
							style={{ backgroundColor: slice.color }}
						/>
						{slice.label}
					</span>
				))}
			</div>
		</section>
	);
}
