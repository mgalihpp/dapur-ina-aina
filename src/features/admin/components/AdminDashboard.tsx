import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { EmptyState } from "@/features/shared/components/EmptyState";
import { queryErrorMessage } from "@/lib/query-errors";
import { useAdminDashboard, useStockOverview } from "../queries";
import type { DashboardPeriod, PeriodData } from "../types";
import { BestDishesList } from "./BestDishesList";
import { DailySellingChart } from "./DailySellingChart";
import { DashboardEmpty } from "./DashboardEmpty";
import { PeriodFilter } from "./PeriodFilter";
import { TotalBalanceCard } from "./TotalBalanceCard";
import { TotalIncomeCard } from "./TotalIncomeCard";

export function AdminDashboard() {
	const [period, setPeriod] = useState<DashboardPeriod>("today");
	const dashboard = useAdminDashboard(period);
	const stock = useStockOverview();

	const data: PeriodData | null = dashboard.data ?? null;
	const loading = dashboard.isPending;
	const error = dashboard.isError
		? queryErrorMessage(dashboard.error, "Gagal memuat dasbor")
		: null;
	const lowStock = (stock.data ?? []).filter((row) => row.low);
	const stockLoading = stock.isPending;
	const stockError = stock.isError
		? queryErrorMessage(stock.error, "Gagal memuat peringatan stok.")
		: null;

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
			<section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
				<div className="flex items-center justify-between gap-3">
					<div>
						<h2 className="font-bold text-amber-950">
							Peringatan stok menipis
						</h2>
						<p className="mt-1 text-sm text-amber-900">
							{stockLoading
								? "Memuat status stok…"
								: stockError
									? "Status stok belum tersedia."
									: `${lowStock.length} produk memiliki stok 5 atau kurang.`}
						</p>
					</div>
					<Link
						to="/admin/stock"
						className="shrink-0 rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-950"
					>
						Kelola stok
					</Link>
				</div>
				{stockLoading ? (
					<p className="mt-3 text-sm text-amber-900">Memuat peringatan stok…</p>
				) : stockError ? (
					<p role="alert" className="mt-3 text-sm font-medium text-red-800">
						{stockError}
					</p>
				) : lowStock.length ? (
					<ul className="mt-3 flex flex-wrap gap-2">
						{lowStock.slice(0, 8).map((row) => (
							<li
								key={row.id}
								className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-amber-950"
							>
								{row.name} · {row.stock}
							</li>
						))}
					</ul>
				) : (
					<EmptyState
						variant="stock"
						title="Stok sedang aman"
						description="Belum ada produk dengan stok lima atau kurang."
						size="sm"
						surface="solid"
						className="mt-3 py-3"
					/>
				)}
			</section>
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
