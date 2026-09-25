import { UtensilsCrossed } from "lucide-react";
import { fmtMoney } from "@/features/shared/lib/format";
import type { BestDish } from "../types";
import { cardClass } from "./TotalIncomeCard";

type BestDishesListProps = {
	data: BestDish[];
};

export function BestDishesList({ data }: BestDishesListProps) {
	return (
		<section className={cardClass}>
			<h2 className="text-base font-bold">Menu Terlaris</h2>
			<div className="mt-1 flex items-center justify-between text-xs text-neutral-400">
				<span>Menu</span>
				<span className="font-semibold">Pesanan</span>
			</div>
			<ul className="mt-2 divide-y divide-neutral-100">
				{data.map((dish) => (
					<li key={dish.id} className="flex items-center gap-3 py-3">
						{dish.image ? (
							<img
								src={dish.image}
								alt={dish.name}
								className="h-11 w-11 shrink-0 rounded-xl object-cover"
								loading="lazy"
							/>
						) : (
							<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
								<UtensilsCrossed className="h-5 w-5 text-[#EF7D1A]" />
							</div>
						)}
						<div>
							<p className="text-sm font-bold">{dish.name}</p>
							<p className="text-xs font-semibold text-[#EF7D1A]">
								{fmtMoney(dish.price)}
							</p>
						</div>
						<span className="ml-auto text-sm font-bold">
							{dish.orders.toLocaleString("id-ID")}
						</span>
					</li>
				))}
			</ul>
		</section>
	);
}
