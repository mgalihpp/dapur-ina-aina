import { fmtDecimalMoney, fmtOrderDay } from "@/features/shared/lib/format";
import { cn } from "@/lib/utils";
import type { AdminOrderRow } from "@/server/order-functions";
import { groupOrdersByBucket, toneStyles } from "../lib/order-buckets";

type OrderListProps = {
	orders: readonly AdminOrderRow[];
	selectedId: string | null;
	onSelect: (id: string) => void;
};

function paymentWord(status: AdminOrderRow["paymentStatus"]): string {
	if (status === "lunas") return "Lunas";
	if (status === "belum_lunas") return "Belum lunas";
	return "Belum dibayar";
}

export function OrderList({ orders, selectedId, onSelect }: OrderListProps) {
	const groups = groupOrdersByBucket(orders);
	if (groups.length === 0) return null;
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
			{groups.map(({ bucket, rows }) => {
				const tone = toneStyles[bucket.tone];
				return (
					<section
						key={bucket.id}
						className="min-w-0 rounded-xl bg-neutral-50/70 p-2 ring-1 ring-neutral-100"
					>
						<div className="sticky top-0 z-10 flex items-center gap-2 bg-neutral-50/95 px-1 py-2 backdrop-blur-sm">
							<span
								aria-hidden="true"
								className={cn("size-2 shrink-0 rounded-full", tone.bar)}
							/>
							<h2 className={cn("shrink-0 text-xs font-bold", tone.label)}>
								{bucket.label}
							</h2>
							{bucket.hint ? (
								<span className="min-w-0 truncate text-xs font-medium text-neutral-500">
									{bucket.hint}
								</span>
							) : null}
							<span
								className={cn(
									"ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
									tone.count,
								)}
							>
								{rows.length}
							</span>
						</div>
						<ul className="space-y-2">
							{rows.map((order) => {
								const selected = selectedId === order.id;
								const lead = order.meja?.nama ?? null;
								const orderNumber = `#${order.id}`;
								const meta = [
									order.tamu ? `${order.tamu} tamu` : null,
									fmtOrderDay(order.tanggal),
									order.kasir,
								]
									.filter((part): part is string => Boolean(part))
									.join(" · ");
								return (
									<li key={order.id}>
										<button
											type="button"
											onClick={() => onSelect(order.id)}
											aria-current={selected ? "true" : undefined}
											className={cn(
												"relative w-full overflow-hidden rounded-xl py-2.5 pl-4 pr-3 text-left transition",
												selected
													? "bg-orange-50 ring-1 ring-orange-200"
													: "bg-white ring-1 ring-transparent hover:bg-neutral-100",
											)}
										>
											<span
												aria-hidden="true"
												className={cn(
													"absolute inset-y-0 left-0 w-1",
													selected ? "bg-[var(--lagoon)]" : tone.bar,
												)}
											/>
											<span className="flex items-baseline justify-between gap-3">
												<span className="min-w-0 truncate text-sm font-bold text-neutral-900">
													{lead ?? orderNumber}
													{lead ? (
														<span className="ml-2 text-xs font-medium text-neutral-500">
															{orderNumber}
														</span>
													) : null}
												</span>
												<span className="shrink-0 text-sm font-bold tabular-nums text-neutral-900">
													{fmtDecimalMoney(order.total)}
												</span>
											</span>
											<span className="mt-1 block truncate text-xs text-neutral-500">
												{meta}
											</span>
											<span
												className={cn(
													"mt-1 block truncate text-[11px] font-semibold",
													tone.label,
												)}
											>
												{order.itemCount} item ·{" "}
												{paymentWord(order.paymentStatus)}
											</span>
										</button>
									</li>
								);
							})}
						</ul>
					</section>
				);
			})}
		</div>
	);
}
