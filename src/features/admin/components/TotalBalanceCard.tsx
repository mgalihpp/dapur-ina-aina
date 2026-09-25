import { BarChart3, Wallet } from "lucide-react";
import { fmtInt } from "@/features/shared/lib/format";
import type { BalanceSummary } from "../types";
import { cardClass } from "./TotalIncomeCard";

type TotalBalanceCardProps = {
	data: BalanceSummary;
};

export function TotalBalanceCard({ data }: TotalBalanceCardProps) {
	return (
		<section className={`${cardClass} flex h-full flex-col`}>
			<h2 className="text-lg font-bold text-neutral-900">Total Saldo</h2>
			<div className="flex flex-1 items-center justify-center px-4 py-6">
				<p className="text-center text-[32px] leading-tight font-bold text-emerald-600 tabular-nums break-words">
					{fmtInt(data.total)}
				</p>
			</div>
			<div className="mt-auto space-y-5 pt-6">
				<div className="flex items-center gap-3">
					<div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-neutral-900">
						<BarChart3 className="size-5 text-white" />
					</div>
					<div>
						<p className="text-sm text-neutral-900">Total Pemasukan</p>
						<p className="text-sm font-bold text-neutral-900 tabular-nums">
							{fmtInt(data.income)}
						</p>
					</div>
					{data.incomeDelta !== "-" ? (
						<span className="ml-auto shrink-0 text-xs text-neutral-400">
							({data.incomeDelta})
						</span>
					) : null}
				</div>
				<div className="flex items-center gap-3">
					<div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#EF7D1A]">
						<Wallet className="size-5 text-white" />
					</div>
					<div>
						<p className="text-sm text-neutral-900">Total Pengeluaran</p>
						<p className="text-sm font-bold text-neutral-900 tabular-nums">
							{fmtInt(data.expense)}
						</p>
					</div>
					{data.expenseDelta !== "-" ? (
						<span className="ml-auto shrink-0 text-xs text-neutral-400">
							({data.expenseDelta})
						</span>
					) : null}
				</div>
			</div>
		</section>
	);
}
