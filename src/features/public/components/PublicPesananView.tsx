import { Link } from "@tanstack/react-router";
import {
	ArrowUpRight,
	CalendarDays,
	Clock3,
	ShoppingBag,
	Utensils,
} from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState } from "@/features/shared/components/EmptyState";
import { fmtDecimalMoney } from "@/features/shared/lib/format";
import type { PublicOrderDetail } from "@/server/public-functions";
import { getPublicOrderDetail } from "@/server/public-functions";
import {
	rehydrateGuestStore,
	selectGuestHydrated,
	selectGuestOrders,
	useGuestStore,
} from "../lib/guest-store";

type Row = {
	id: number;
	meja: string | null;
	detail: PublicOrderDetail | null;
};

type OrderAppearance = {
	label: string;
	badgeClassName: string;
	dotClassName: string;
};

function orderAppearance(detail: PublicOrderDetail | null): OrderAppearance {
	if (!detail) {
		return {
			label: "Belum tersedia",
			badgeClassName: "bg-neutral-100 text-neutral-600",
			dotClassName: "bg-neutral-400",
		};
	}
	if (detail.status === "dibatalkan") {
		return {
			label: "Dibatalkan",
			badgeClassName: "bg-red-50 text-red-700",
			dotClassName: "bg-red-500",
		};
	}
	if (detail.paymentStatus === "lunas") {
		return {
			label: "Lunas",
			badgeClassName: "bg-neutral-900 text-white",
			dotClassName: "bg-white",
		};
	}
	return {
		label: "Menunggu kasir",
		badgeClassName: "bg-orange-50 text-orange-800",
		dotClassName: "bg-orange-500",
	};
}

function shortDate(value: string): string {
	const [year, month, day] = value.split("-");
	if (!year || !month || !day) return value;
	return `${day}/${month}/${year}`;
}

export function PublicPesananView() {
	const [rows, setRows] = useState<Row[]>([]);
	const [loading, setLoading] = useState(true);
	const hydrated = useGuestStore(selectGuestHydrated);
	const saved = useGuestStore(selectGuestOrders);

	useEffect(() => {
		void rehydrateGuestStore();
	}, []);

	useEffect(() => {
		if (!hydrated) return;
		if (saved.length === 0) {
			setRows([]);
			setLoading(false);
			return;
		}
		let active = true;
		setLoading(true);
		Promise.all(
			saved.map(async (order) => {
				try {
					const detail = await getPublicOrderDetail({
						data: { id: order.id },
					});
					return { id: order.id, meja: order.meja, detail };
				} catch {
					return { id: order.id, meja: order.meja, detail: null };
				}
			}),
		).then((result) => {
			if (active) {
				setRows(result);
				setLoading(false);
			}
		});
		return () => {
			active = false;
		};
	}, [hydrated, saved]);

	if (!hydrated || loading) {
		return (
			<main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-8">
				<div className="rounded-2xl border border-neutral-100 bg-white p-8 shadow-sm">
					<p className="text-sm text-neutral-500">Memuat pesanan…</p>
				</div>
			</main>
		);
	}

	if (rows.length === 0) {
		return (
			<main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-8">
				<EmptyState
					variant="orders"
					title="Belum ada pesanan"
					description="Pesanan yang sudah kamu buat akan muncul di sini."
					size="lg"
					surface="solid"
					action={
						<Link
							to="/menu"
							className="inline-flex items-center gap-2 rounded-xl bg-[#F97316] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#ea6a0a]"
						>
							Pilih menu
							<ArrowUpRight className="h-4 w-4" />
						</Link>
					}
				/>
			</main>
		);
	}

	return (
		<main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-8">
			<header>
				<h1 className="text-3xl font-bold tracking-tight">Pesanan</h1>
			</header>

			<ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{rows.map((row) => {
					const appearance = orderAppearance(row.detail);
					const total = row.detail ? fmtDecimalMoney(row.detail.total) : "–";
					return (
						<li key={row.id}>
							<Link
								to="/pesanan/$orderId"
								params={{ orderId: String(row.id) }}
								className="flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2"
							>
								<div className="flex items-start justify-between gap-4 border-b border-neutral-100 p-5">
									<div className="flex min-w-0 items-start gap-3">
										<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#EF7D1A]">
											<ShoppingBag className="h-5 w-5" aria-hidden="true" />
										</span>
										<div className="min-w-0">
											<h2 className="truncate text-lg font-bold">
												Pesanan #{row.id}
											</h2>
										</div>
									</div>
									<span
										className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${appearance.badgeClassName}`}
									>
										<span
											className={`h-1.5 w-1.5 rounded-full ${appearance.dotClassName}`}
										/>
										{appearance.label}
									</span>
								</div>

								<div className="flex flex-1 flex-col p-5">
									<div className="space-y-3 text-sm">
										<div className="flex items-center gap-3 text-neutral-600">
											<CalendarDays className="h-4 w-4 shrink-0 text-neutral-400" />
											<span>
												{row.detail ? shortDate(row.detail.tanggal) : "–"}
											</span>
										</div>
										<div className="flex items-center gap-3 text-neutral-600">
											<Utensils className="h-4 w-4 shrink-0 text-neutral-400" />
											<span>{row.detail?.meja ?? row.meja ?? "–"}</span>
										</div>
										{row.detail?.paymentStatus === "belum_lunas" ? (
											<div className="flex items-center gap-3 text-orange-700">
												<Clock3 className="h-4 w-4 shrink-0" />
												<span>Pembayaran belum lunas</span>
											</div>
										) : null}
									</div>

									<div className="mt-auto flex items-end justify-between gap-4 border-t border-neutral-100 pt-5">
										<div>
											<p className="text-xs text-neutral-500">Total</p>
											<p className="mt-1 text-xl font-bold text-orange-700">
												{total}
											</p>
										</div>
										<span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
											<ArrowUpRight className="h-4 w-4" />
										</span>
									</div>
								</div>
							</Link>
						</li>
					);
				})}
			</ul>
		</main>
	);
}
