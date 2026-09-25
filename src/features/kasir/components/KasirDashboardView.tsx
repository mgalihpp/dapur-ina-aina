import { Link } from "@tanstack/react-router";
import { EmptyState } from "@/features/shared/components/EmptyState";
import { queryErrorMessage } from "@/lib/query-errors";
import { useCashierDashboard } from "../queries";

export function KasirDashboardView() {
	const dashboardQuery = useCashierDashboard();
	const summary = dashboardQuery.data ?? null;
	const error = dashboardQuery.isError
		? queryErrorMessage(dashboardQuery.error, "Gagal memuat dasbor.")
		: null;

	return (
		<main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 sm:px-8">
			<h1 className="text-2xl font-bold">Dasbor kasir</h1>
			{error ? (
				<p
					role="alert"
					className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
				>
					{error}
				</p>
			) : null}
			<div className="mt-5 grid gap-4 sm:grid-cols-2">
				<Link
					to="/kasir/orders"
					className="rounded-2xl border border-neutral-100 bg-white p-5 text-neutral-900 shadow-sm transition hover:border-orange-200"
				>
					<p className="text-sm text-neutral-500">Pesanan perlu diproses</p>
					<p className="mt-2 text-3xl font-bold">
						{summary?.pendingOrders ?? "—"}
					</p>
				</Link>
				<Link
					to="/kasir/stock"
					className="rounded-2xl border border-neutral-100 bg-white p-5 text-neutral-900 shadow-sm transition hover:border-orange-200"
				>
					<p className="text-sm text-neutral-500">Produk stok menipis (≤ 5)</p>
					<p className="mt-2 text-3xl font-bold">
						{summary?.lowStock.length ?? "—"}
					</p>
				</Link>
			</div>
			<section className="mt-6 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
				<div className="flex items-center justify-between">
					<h2 className="font-bold">Peringatan stok</h2>
					<Link
						to="/kasir/stock"
						className="text-sm font-semibold text-orange-700"
					>
						Lihat stok
					</Link>
				</div>
				{summary?.lowStock.length ? (
					<ul className="mt-3 divide-y divide-neutral-100">
						{summary.lowStock.map((product) => (
							<li
								key={product.id}
								className="flex justify-between gap-3 py-3 text-sm"
							>
								<span>{product.name}</span>
								<span className="font-semibold text-amber-800">
									{product.stock} tersisa
								</span>
							</li>
						))}
					</ul>
				) : summary ? (
					<EmptyState
						variant="stock"
						title="Stok sedang aman"
						description="Belum ada produk dengan stok lima atau kurang."
						size="sm"
						surface="plain"
						className="mt-3 py-5"
					/>
				) : (
					<p className="mt-3 text-sm text-neutral-500">Memuat data stok…</p>
				)}
			</section>
			<Link
				to="/kasir/pos"
				className="mt-6 inline-flex rounded-xl bg-[#F97316] px-5 py-3 text-sm font-bold text-white"
			>
				Buat pesanan baru
			</Link>
		</main>
	);
}
