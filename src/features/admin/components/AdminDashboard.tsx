import { useState } from "react";
import { MOCK } from "../data/dashboard-mock";
import type { DashboardPeriod } from "../types";
import { BestDishesList } from "./BestDishesList";
import { DailySellingChart } from "./DailySellingChart";
import { PeriodFilter } from "./PeriodFilter";
import { TotalBalanceCard } from "./TotalBalanceCard";
import { TotalIncomeCard } from "./TotalIncomeCard";

export function AdminDashboard() {
	const [period, setPeriod] = useState<DashboardPeriod>("today");
	const data = MOCK[period];

	return (
		<div className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-8">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-xl font-bold sm:text-2xl">Dasbor Manajer</h1>
				<PeriodFilter value={period} onChange={setPeriod} />
			</div>

			<div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
				<TotalIncomeCard data={data.income} />
				<TotalBalanceCard data={data.balance} />
				<DailySellingChart data={data.daily} />
				<BestDishesList data={data.dishes} />
			</div>
		</div>
	);
}
