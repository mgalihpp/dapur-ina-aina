import { useCallback, useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	getStockOverview,
	listStockMoves,
	restockProduct,
} from "@/server/stock-functions";

type StockRow = Awaited<ReturnType<typeof getStockOverview>>[number];
type StockMove = Awaited<ReturnType<typeof listStockMoves>>[number];

export function StockView() {
	const [products, setProducts] = useState<StockRow[]>([]);
	const [moves, setMoves] = useState<StockMove[]>([]);
	const [productId, setProductId] = useState("");
	const [moveProductId, setMoveProductId] = useState("");
	const [quantity, setQuantity] = useState("");
	const [type, setType] = useState("");
	const [start, setStart] = useState("");
	const [end, setEnd] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	const refreshProducts = useCallback(async () => {
		setProducts(await getStockOverview());
	}, []);

	const refreshMoves = useCallback(async () => {
		setMoves(
			await listStockMoves({
				data: {
					productId: moveProductId ? Number(moveProductId) : undefined,
					type: type || undefined,
					start: start || undefined,
					end: end || undefined,
				},
			}),
		);
	}, [moveProductId, type, start, end]);

	useEffect(() => {
		void Promise.all([refreshProducts(), refreshMoves()]).catch(
			(cause: unknown) =>
				setError(
					cause instanceof Error ? cause.message : "Gagal memuat data stok.",
				),
		);
	}, [refreshProducts, refreshMoves]);

	async function submitRestock(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (busy || !productId) return;
		setBusy(true);
		setError(null);
		try {
			await restockProduct({
				data: { productId: Number(productId), quantity: Number(quantity) },
			});
			setQuantity("");
			await Promise.all([refreshProducts(), refreshMoves()]);
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Gagal menambah stok.");
		} finally {
			setBusy(false);
		}
	}

	async function applyFilters() {
		setError(null);
		try {
			await refreshMoves();
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : "Gagal memuat riwayat stok.",
			);
		}
	}

	return (
		<main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-8">
			<h1 className="text-2xl font-bold">Stok</h1>
			{error ? (
				<p
					role="alert"
					className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
				>
					{error}
				</p>
			) : null}
			<form
				onSubmit={(event) => void submitRestock(event)}
				className="mt-5 grid grid-cols-1 gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm sm:grid-cols-[1fr_180px_auto]"
			>
				<div className="text-sm font-medium">
					Produk
					<Select value={productId || undefined} onValueChange={setProductId}>
						<SelectTrigger
							aria-label="Pilih produk untuk restock"
							className="mt-1 w-full rounded-lg border-neutral-200 bg-white px-3 py-2.5 text-sm"
						>
							<SelectValue placeholder="Pilih produk" />
						</SelectTrigger>
						<SelectContent>
							{products.map((product) => (
								<SelectItem key={product.id} value={String(product.id)}>
									{product.name} · stok {product.stock}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<label className="text-sm font-medium">
					Jumlah masuk
					<input
						type="number"
						min="1"
						step="1"
						value={quantity}
						onChange={(event) => setQuantity(event.target.value)}
						required
						className="mt-1 block w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
					/>
				</label>
				<button
					type="submit"
					disabled={busy}
					className="self-end rounded-lg bg-[#F97316] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
				>
					{busy ? "Menyimpan…" : "Catat stok masuk"}
				</button>
			</form>
			<section className="mt-6">
				<h2 className="text-lg font-bold">Persediaan saat ini</h2>
				<div className="mt-3 overflow-x-auto rounded-2xl border border-neutral-100 bg-white shadow-sm">
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
			</section>
			<section className="mt-6">
				<div className="flex flex-wrap items-end justify-between gap-3">
					<div>
						<h2 className="text-lg font-bold">Riwayat pergerakan</h2>
					</div>
					<div className="flex flex-wrap gap-2">
						<Select
							value={moveProductId || "all"}
							onValueChange={(value) =>
								setMoveProductId(value === "all" ? "" : value)
							}
						>
							<SelectTrigger
								aria-label="Filter produk"
								className="w-[180px] rounded-lg border-neutral-200 bg-white px-3 py-2 text-sm"
							>
								<SelectValue placeholder="Semua produk" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Semua produk</SelectItem>
								{products.map((product) => (
									<SelectItem key={product.id} value={String(product.id)}>
										{product.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select
							value={type || "all"}
							onValueChange={(value) => setType(value === "all" ? "" : value)}
						>
							<SelectTrigger
								aria-label="Jenis pergerakan"
								className="w-[160px] rounded-lg border-neutral-200 bg-white px-3 py-2 text-sm"
							>
								<SelectValue placeholder="Semua jenis" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Semua jenis</SelectItem>
								<SelectItem value="masuk">Masuk</SelectItem>
								<SelectItem value="keluar">Keluar</SelectItem>
							</SelectContent>
						</Select>
						<input
							aria-label="Dari tanggal"
							type="date"
							value={start}
							onChange={(event) => setStart(event.target.value)}
							className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
						/>
						<input
							aria-label="Sampai tanggal"
							type="date"
							value={end}
							onChange={(event) => setEnd(event.target.value)}
							className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
						/>
						<button
							type="button"
							onClick={() => void applyFilters()}
							className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold"
						>
							Terapkan
						</button>
					</div>
				</div>
				<div className="mt-3 overflow-x-auto rounded-2xl border border-neutral-100 bg-white shadow-sm">
					<table className="w-full min-w-[600px] text-left text-sm">
						<thead className="bg-neutral-50 text-xs text-neutral-500">
							<tr>
								<th className="px-4 py-3">Tanggal</th>
								<th className="px-4 py-3">Produk</th>
								<th className="px-4 py-3">Jenis</th>
								<th className="px-4 py-3">Jumlah</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-neutral-100">
							{moves.map((move) => (
								<tr key={move.id}>
									<td className="px-4 py-3">{move.date}</td>
									<td className="px-4 py-3">{move.product}</td>
									<td className="px-4 py-3">
										{move.type === "masuk" ? "Masuk" : "Keluar"}
									</td>
									<td className="px-4 py-3">{move.quantity}</td>
								</tr>
							))}
						</tbody>
					</table>
					{moves.length === 0 ? (
						<p className="px-4 py-6 text-center text-sm text-neutral-500">
							Belum ada pergerakan sesuai filter.
						</p>
					) : null}
				</div>
			</section>
		</main>
	);
}
