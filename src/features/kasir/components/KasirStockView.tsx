import { EmptyState } from "@/features/shared/components/EmptyState";
import { queryErrorMessage } from "@/lib/query-errors";
import { useCashierStockMoves, useCashierStockOverview } from "../queries";

export function KasirStockView() {
	const overviewQuery = useCashierStockOverview();
	const movesQuery = useCashierStockMoves();
	const products = overviewQuery.data ?? [];
	const moves = movesQuery.data ?? [];
	const loading = overviewQuery.isPending || movesQuery.isPending;
	const error =
		overviewQuery.isError || movesQuery.isError
			? queryErrorMessage(
					overviewQuery.error ?? movesQuery.error,
					"Gagal memuat stok.",
				)
			: null;
	return (
		<main className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-8">
			<h1 className="text-2xl font-bold">Stok</h1>
			{loading ? (
				<p className="mt-4 text-sm text-neutral-500">Memuat data stok…</p>
			) : null}
			{error ? (
				<p
					role="alert"
					className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
				>
					{error}
				</p>
			) : null}
			<div className="mt-5 overflow-x-auto rounded-2xl border border-neutral-100 bg-white shadow-sm">
				<table className="w-full min-w-[600px] text-left text-sm">
					<thead className="bg-neutral-50 text-xs text-neutral-500">
						<tr>
							<th className="px-4 py-3">Produk</th>
							<th className="px-4 py-3">Kategori</th>
							<th className="px-4 py-3">Stok</th>
							<th className="px-4 py-3">Kondisi</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-neutral-100">
						{products.map((product) => (
							<tr key={product.id}>
								<td className="px-4 py-3 font-medium">{product.name}</td>
								<td className="px-4 py-3">{product.category}</td>
								<td className="px-4 py-3">{product.stock}</td>
								<td className="px-4 py-3">
									{product.low ? (
										<span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
											Stok menipis
										</span>
									) : (
										<span className="text-emerald-700">Aman</span>
									)}
								</td>
							</tr>
						))}
						{!loading && products.length === 0 ? (
							<tr>
								<td colSpan={4} className="p-2">
									<EmptyState
										variant="stock"
										title="Belum ada produk"
										description="Produk yang tersedia akan muncul setelah admin menambahkannya."
										size="sm"
										surface="plain"
										width="content"
										className="min-w-[280px]"
									/>
								</td>
							</tr>
						) : null}
					</tbody>
				</table>
			</div>
			<h2 className="mt-8 text-lg font-bold">Riwayat pergerakan</h2>
			<div className="mt-3 overflow-x-auto rounded-2xl border border-neutral-100 bg-white shadow-sm">
				<table className="w-full min-w-[600px] text-left text-sm">
					<thead className="bg-neutral-50 text-xs text-neutral-500">
						<tr>
							<th className="px-4 py-3">Tanggal</th>
							<th className="px-4 py-3">Produk</th>
							<th className="px-4 py-3">Jenis</th>
							<th className="px-4 py-3 text-right">Jumlah</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-neutral-100">
						{moves.map((move) => (
							<tr key={move.id}>
								<td className="px-4 py-3">{move.date}</td>
								<td className="px-4 py-3 font-medium">{move.product}</td>
								<td className="px-4 py-3">{move.type}</td>
								<td className="px-4 py-3 text-right">{move.quantity}</td>
							</tr>
						))}
						{!loading && moves.length === 0 ? (
							<tr>
								<td colSpan={4} className="p-2">
									<EmptyState
										variant="stock"
										title="Belum ada riwayat pergerakan"
										description="Riwayat stok masuk dan keluar akan tampil di sini."
										size="sm"
										surface="plain"
										width="content"
										className="min-w-[280px]"
									/>
								</td>
							</tr>
						) : null}
					</tbody>
				</table>
			</div>
		</main>
	);
}
