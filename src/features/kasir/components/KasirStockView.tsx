import { useEffect, useState } from "react";
import { getStockOverview, listStockMoves } from "@/server/stock-functions";

type StockRow = Awaited<ReturnType<typeof getStockOverview>>[number];
type StockMove = Awaited<ReturnType<typeof listStockMoves>>[number];

export function KasirStockView() {
	const [products, setProducts] = useState<StockRow[]>([]);
	const [moves, setMoves] = useState<StockMove[]>([]);
	const [error, setError] = useState<string | null>(null);
	useEffect(() => {
		let active = true;
		Promise.all([getStockOverview(), listStockMoves({ data: {} })])
			.then(([rows, history]) => {
				if (active) {
					setProducts(rows);
					setMoves(history);
				}
			})
			.catch((cause: unknown) => {
				if (active)
					setError(
						cause instanceof Error ? cause.message : "Gagal memuat stok.",
					);
			});
		return () => {
			active = false;
		};
	}, []);
	return (
		<main className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-8">
			<h1 className="text-2xl font-bold">Stok</h1>
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
						{moves.length === 0 ? (
							<tr>
								<td
									colSpan={4}
									className="px-4 py-6 text-center text-sm text-neutral-500"
								>
									Belum ada riwayat pergerakan.
								</td>
							</tr>
						) : null}
					</tbody>
				</table>
			</div>
		</main>
	);
}
