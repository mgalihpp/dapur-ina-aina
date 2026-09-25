import {
	Area,
	AreaChart,
	CartesianGrid,
	Tooltip as ChartTooltip,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { fmtInt } from "@/features/shared/lib/format";
import type { DailyPoint } from "../types";
import { cardClass } from "./TotalIncomeCard";

type DailySellingChartProps = {
	data: DailyPoint[];
};

export function DailySellingChart({ data }: DailySellingChartProps) {
	return (
		<section className={cardClass}>
			<h2 className="text-base font-bold">Penjualan Harian</h2>
			<div className="mt-3 h-[220px] w-full">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart
						data={data}
						margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
					>
						<defs>
							<linearGradient id="dailyFill" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="#F97316" stopOpacity={0.35} />
								<stop offset="100%" stopColor="#F97316" stopOpacity={0.02} />
							</linearGradient>
						</defs>
						<CartesianGrid vertical={false} stroke="#EEF0F2" />
						<XAxis dataKey="label" hide />
						<YAxis
							domain={[5000, 20000]}
							ticks={[5000, 10000, 15000, 20000]}
							tick={{ fontSize: 11, fill: "#9CA3AF" }}
							tickLine={false}
							axisLine={false}
							width={48}
							tickFormatter={(v: number) => v.toLocaleString("id-ID")}
						/>
						<ChartTooltip
							contentStyle={{
								borderRadius: 12,
								border: "1px solid #eee",
								fontSize: 12,
							}}
							labelFormatter={(label) => String(label)}
							formatter={(value) => [fmtInt(Number(value)), "Penjualan"]}
						/>
						<Area
							type="monotone"
							dataKey="value"
							stroke="#F97316"
							strokeWidth={2.5}
							fill="url(#dailyFill)"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</section>
	);
}
