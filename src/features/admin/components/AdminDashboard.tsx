import { useEffect, useState } from "react";
import { getDashboard } from "@/server/dashboard-functions";
import type { DashboardPeriod, PeriodData } from "../types";
import { BestDishesList } from "./BestDishesList";
import { DailySellingChart } from "./DailySellingChart";
import { DashboardEmpty } from "./DashboardEmpty";
import { PeriodFilter } from "./PeriodFilter";
import { TotalBalanceCard } from "./TotalBalanceCard";
import { TotalIncomeCard } from "./TotalIncomeCard";

export function AdminDashboard() {
	const [period, setPeriod] = useState<DashboardPeriod>("today");
	const [data, setData] = useState<PeriodData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let alive = true;
		setLoading(true);
		getDashboard({ data: { period } })
			.then((d) => {
				if (alive) {
					setData(d);
					setError(null);
				}
			})
			.catch((e: unknown) => {
				if (alive) {
					setData(null);
					setError(e instanceof Error ? e.message : "Gagal memuat dasbor");
				}
			})
			.finally(() => {
				if (alive) setLoading(false);
			});
		return () => {
			alive = false;
		};
	}, [period]);

	return (
		<div className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-8">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-xl font-bold sm:text-2xl">Dasbor Manajer</h1>
				<PeriodFilter value={period} onChange={setPeriod} />
			</div>

			{error ? (
				<p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
					{error}
				</p>
			) : null}
			{loading ? (
				<p className="mt-6 text-sm text-neutral-500">Memuat dasbor…</p>
			) : !data ||
				(data.income.length === 0 &&
					data.daily.length === 0 &&
					data.dishes.length === 0) ? (
				<DashboardEmpty />
			) : (
				<div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
					<TotalIncomeCard data={data.income} />
					<TotalBalanceCard data={data.balance} />
					<DailySellingChart data={data.daily} />
					<BestDishesList data={data.dishes} />
				</div>
			)}
		</div>
	);
}
