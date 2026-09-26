import type { ReactNode } from "react";
import { EmptyState } from "@/features/shared/components/EmptyState";
import { fmtDecimalMoney } from "@/features/shared/lib/format";
import { sumMoneyLines } from "@/features/shared/lib/money";
import type { GuestCartItem, GuestTable } from "../lib/guest-store";
import { OrderSummaryLinesSkeleton } from "@/components/ui/skeletons";

export function PublicPageLayout({
	children,
	summary,
}: {
	children: ReactNode;
	summary: ReactNode;
}) {
	return (
		<main className="mx-auto grid w-full max-w-[1500px] flex-1 grid-cols-1 items-start gap-5 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_360px] sm:px-8">
			<section className="min-w-0">{children}</section>
			{summary}
		</main>
	);
}

export function PublicOrderSummary({
	table,
	cart,
	hydrated,
	action,
	notice,
	error,
}: {
	table: GuestTable | null;
	cart: GuestCartItem[];
	hydrated: boolean;
	action: ReactNode;
	notice?: ReactNode;
	error?: string | null;
}) {
	const total = sumMoneyLines(
		cart.map((item) => ({ price: item.price, quantity: item.quantity })),
	);
	const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

	return (
		<aside className="h-fit rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-sm lg:sticky lg:top-6">
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="text-xs text-[var(--sea-ink-soft)]">Meja</p>
					<p className="mt-1 font-semibold">{table?.nama ?? "Belum dipilih"}</p>
				</div>
				<div className="text-right">
					<p className="text-xs text-[var(--sea-ink-soft)]">Tamu</p>
					<p className="mt-1 font-semibold">{table?.tamu ?? "–"}</p>
				</div>
			</div>

			<div className="mt-5 border-t border-[var(--line)] pt-4">
				<div className="flex items-center justify-between gap-3">
					<h2 className="font-bold">Rincian pesanan</h2>
					<span className="text-sm text-[var(--sea-ink-soft)]">
						{itemCount} item
					</span>
				</div>
				{!hydrated ? (
					<OrderSummaryLinesSkeleton />
				) : cart.length === 0 ? (
					<EmptyState
						variant="cart"
						title="Belum ada pesanan"
						description="Item yang dipilih akan muncul di sini."
						size="sm"
						className="mt-4"
					/>
				) : (
					<ul className="mt-4 max-h-56 space-y-3 overflow-y-auto">
						{cart.map((item) => (
							<li
								key={item.productId}
								className="flex items-center justify-between gap-3 text-sm"
							>
								<div className="flex min-w-0 items-center gap-2">
									<img
										src={item.image}
										alt=""
										className="h-9 w-9 shrink-0 rounded-lg bg-neutral-100 object-cover"
									/>
									<span className="min-w-0 truncate">
										{item.name} × {item.quantity}
									</span>
								</div>
								<span className="shrink-0 font-medium">
									{fmtDecimalMoney(
										sumMoneyLines([
											{ price: item.price, quantity: item.quantity },
										]),
									)}
								</span>
							</li>
						))}
					</ul>
				)}
				<div className="mt-4 flex justify-between border-t border-[var(--line)] pt-4 font-bold">
					<span>Total</span>
					<span>{fmtDecimalMoney(total)}</span>
				</div>
			</div>

			{notice ? <div className="mt-4">{notice}</div> : null}
			{error ? (
				<p
					role="alert"
					className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
				>
					{error}
				</p>
			) : null}
			<div className="mt-5">{action}</div>
		</aside>
	);
}
