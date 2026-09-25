import { BarChart3, Wallet } from "lucide-react";
import { fmtInt } from "@/features/shared/lib/format";
import type { BalanceSummary } from "../types";
import { cardClass } from "./TotalIncomeCard";

type TotalBalanceCardProps = {
	data: BalanceSummary;
};

export function TotalBalanceCard({ data }: TotalBalanceCardProps) {
	return (
		<section className={cardClass}>
			<h2 className="text-base font-bold">Total Saldo</h2>
			<p className="mt-2 text-3xl font-bold text-emerald-500">
				{fmtInt(data.total)}
			</p>
			<div className="mt-5 space-y-4">
				<div className="flex items-center gap-3">
					<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-900">
						<BarChart3 className="h-5 w-5 text-white" />
					</div>
					<div>
						<p className="text-xs text-neutral-400">Total Pemasukan</p>
						<p className="text-sm font-bold">{fmtInt(data.income)}</p>
					</div>
					<span className="ml-auto text-xs font-medium text-emerald-500">
						{data.incomeDelta}
					</span>
				</div>
				<div className="flex items-center gap-3">
					<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EF7D1A]">
						<Wallet className="h-5 w-5 text-white" />
					</div>
					<div>
						<p className="text-xs text-neutral-400">Total Pengeluaran</p>
						<p className="text-sm font-bold">{fmtInt(data.expense)}</p>
					</div>
					<span className="ml-auto text-xs font-medium text-emerald-500">
						{data.expenseDelta}
					</span>
				</div>
			</div>
		</section>
	);
}
