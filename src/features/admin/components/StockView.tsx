import {
	ArrowDownRight,
	ArrowRight,
	ArrowUpRight,
	Boxes,
	CalendarIcon,
	CircleAlert,
	CircleCheck,
	CircleX,
	History,
	Plus,
	Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	PeriodePicker,
	type Rentang,
} from "@/features/reports/components/PeriodePicker";
import { addDays, toISODate } from "@/features/reports/lib/periode";
import { EmptyState } from "@/features/shared/components/EmptyState";
import { SearchSelect } from "@/features/shared/components/search-select";
import {
	StockStatusBadge,
	stockBarTone,
	stockConditionOf,
} from "@/features/shared/components/stock-status";
import { fmtDateTime } from "@/features/shared/lib/format";
import { mutationErrorMessage, queryErrorMessage } from "@/lib/query-errors";
import { useRestockProduct } from "../mutations";
import { useStockMoves, useStockOverview } from "../queries";

type ConditionFilter = "all" | "aman" | "menipis" | "habis";

const MAX_BAR = 20;

export function StockView() {
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState("all");
	const [condition, setCondition] = useState<ConditionFilter>("all");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogProductId, setDialogProductId] = useState("");
	const [dialogQuantity, setDialogQuantity] = useState("");
	const [formError, setFormError] = useState<string | null>(null);

	const [moveProductId, setMoveProductId] = useState("");
	const [moveType, setMoveType] = useState("");
	const [start, setStart] = useState("");
	const [end, setEnd] = useState("");

	const overviewQuery = useStockOverview();
	const movesQuery = useStockMoves({
		productId: moveProductId ? Number(moveProductId) : undefined,
		type: moveType || undefined,
		start: start || undefined,
		end: end || undefined,
	});
	const restock = useRestockProduct();

	const products = useMemo(
		() => overviewQuery.data ?? [],
		[overviewQuery.data],
	);
	const moves = useMemo(() => movesQuery.data ?? [], [movesQuery.data]);
	const categories = useMemo(
		() => [...new Set(products.map((p) => p.category))].sort(),
		[products],
	);

	const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
	const habis = products.filter((p) => p.stock <= 0).length;
	const menipis = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
	const aman = products.length - habis - menipis;

	const filtered = products.filter((p) => {
		if (
			query &&
			!`${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase())
		)
			return false;
		if (category !== "all" && p.category !== category) return false;
		if (condition !== "all" && stockConditionOf(p.stock) !== condition)
			return false;
		return true;
	});

	const loading = overviewQuery.isPending;
	const movesLoading = movesQuery.isPending;
	const busy = restock.isPending;
	const loadError = overviewQuery.isError
		? queryErrorMessage(overviewQuery.error, "Gagal memuat data stok.")
		: null;
	const movesError = movesQuery.isError
		? queryErrorMessage(movesQuery.error, "Gagal memuat riwayat pergerakan.")
		: null;
	const hasMoveFilters = Boolean(moveProductId || moveType || start || end);
	const fromDate = parseFilterDate(start);
	const toDate = parseFilterDate(end);
	const dateRange: Rentang | null =
		fromDate && toDate ? { from: fromDate, to: toDate } : null;

	function applyDefaultRange() {
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		setStart(toISODate(addDays(today, -29)));
		setEnd(toISODate(today));
	}
	const dialogProduct = products.find((p) => String(p.id) === dialogProductId);

	function openRestock(productId?: number) {
		setFormError(null);
		setDialogQuantity("");
		setDialogProductId(productId ? String(productId) : "");
		setDialogOpen(true);
	}

	function submitRestock(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (busy || !dialogProductId) return;
		setFormError(null);
		restock.mutate(
			{ productId: Number(dialogProductId), quantity: Number(dialogQuantity) },
			{
				onSuccess: () => {
					setDialogOpen(false);
					setDialogQuantity("");
				},
				onError: (cause) =>
					setFormError(mutationErrorMessage(cause, "Gagal menambah stok.")),
			},
		);
	}

	function resetMoveFilters() {
		setMoveProductId("");
		setMoveType("");
		setStart("");
		setEnd("");
	}

	function parseFilterDate(value: string): Date | undefined {
		const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
		if (!match) return undefined;
		const date = new Date(
			Number(match[1]),
			Number(match[2]) - 1,
			Number(match[3]),
		);
		return Number.isNaN(date.getTime()) ? undefined : date;
	}

	const stats = [
		{
			label: "Total produk",
			value: products.length,
			hint: `${totalUnits} unit tersimpan`,
			icon: Boxes,
		},
		{
			label: "Stok aman",
			value: aman,
			hint: "Siap dijual",
			icon: CircleCheck,
		},
		{
			label: "Menipis",
			value: menipis,
			hint: "5 unit atau kurang",
			icon: CircleAlert,
		},
		{
			label: "Habis",
			value: habis,
			hint: "Perlu restock",
			icon: CircleX,
		},
	];

	return (
		<main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-8">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Stok</h1>
				</div>
				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<DialogTrigger asChild>
						<Button
							onClick={() => openRestock()}
							className="bg-[#EF7D1A] text-white hover:bg-[#ea6a0a]"
						>
							<Plus /> Catat stok masuk
						</Button>
					</DialogTrigger>
					<DialogContent onCloseAutoFocus={(event) => event.preventDefault()}>
						<DialogHeader>
							<DialogTitle>Catat stok masuk</DialogTitle>
						</DialogHeader>
						<form onSubmit={submitRestock} className="grid gap-4">
							<div className="grid gap-2">
								<Label htmlFor="restock-product">Produk</Label>
								<SearchSelect
									id="restock-product"
									value={dialogProductId}
									onChange={setDialogProductId}
									options={products.map((p) => ({
										value: String(p.id),
										label: p.name,
										hint: `stok ${p.stock}`,
									}))}
									placeholder="Pilih produk"
									searchPlaceholder="Cari produk…"
									emptyText="Tidak ada produk yang cocok."
									ariaLabel="Pilih produk untuk restock"
									className="w-full"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="restock-qty">Jumlah masuk</Label>
								<Input
									id="restock-qty"
									type="number"
									min="1"
									step="1"
									required
									placeholder="cth. 12"
									value={dialogQuantity}
									onChange={(e) => setDialogQuantity(e.target.value)}
								/>
								{dialogProduct &&
								Number.isInteger(Number(dialogQuantity)) &&
								Number(dialogQuantity) > 0 ? (
									<div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
										<span className="text-muted-foreground tabular-nums">
											{Number(dialogProduct.stock)}
										</span>
										<ArrowRight className="size-4 shrink-0 text-muted-foreground" />
										<span className="font-bold tabular-nums">
											{Number(dialogProduct.stock) + Number(dialogQuantity)}
										</span>
										<span className="ml-auto text-xs text-muted-foreground tabular-nums">
											+{Number(dialogQuantity)} masuk
										</span>
									</div>
								) : null}
							</div>
							{formError ? (
								<Alert variant="destructive">
									<AlertTitle>Gagal menyimpan</AlertTitle>
									<AlertDescription>{formError}</AlertDescription>
								</Alert>
							) : null}
							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => setDialogOpen(false)}
								>
									Batal
								</Button>
								<Button type="submit" disabled={busy || !dialogProductId}>
									{busy ? "Menyimpan…" : "Simpan"}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{loadError ? (
				<Alert variant="destructive" className="mt-4">
					<AlertTitle>Gagal memuat stok</AlertTitle>
					<AlertDescription>{loadError}</AlertDescription>
				</Alert>
			) : null}

			<div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
				{loading
					? ["s1", "s2", "s3", "s4"].map((k) => (
							<Card key={k}>
								<CardHeader>
									<Skeleton className="h-4 w-24" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-8 w-16" />
								</CardContent>
							</Card>
						))
					: stats.map((s) => (
							<Card key={s.label}>
								<CardHeader className="flex flex-row items-center justify-between gap-2 pb-0">
									<CardTitle className="text-sm font-medium text-muted-foreground">
										{s.label}
									</CardTitle>
									<s.icon className="size-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<p className="text-3xl font-bold tabular-nums">{s.value}</p>
									<p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
								</CardContent>
							</Card>
						))}
			</div>

			<Tabs defaultValue="persediaan" className="mt-6">
				<TabsList className="h-auto w-fit flex-none items-center gap-1 rounded-xl border border-neutral-200/70 bg-[#E8EAED] p-1.5 group-data-horizontal/tabs:h-auto">
					<TabsTrigger
						value="persediaan"
						className="flex-none rounded-lg px-4 py-1.5 text-sm font-semibold text-neutral-500 transition data-active:hover:text-white data-[state=inactive]:hover:text-neutral-700 data-active:bg-[#EF7D1A] data-active:text-white data-active:shadow-sm"
					>
						Persediaan
					</TabsTrigger>
					<TabsTrigger
						value="riwayat"
						className="group flex-none rounded-lg px-4 py-1.5 text-sm font-semibold text-neutral-500 transition data-active:hover:text-white data-[state=inactive]:hover:text-neutral-700 data-active:bg-[#EF7D1A] data-active:text-white data-active:shadow-sm"
					>
						Riwayat
						{moves.length > 0 ? (
							<Badge
								variant="secondary"
								className="ml-1 bg-white text-neutral-600 tabular-nums group-data-active:bg-white/25 group-data-active:text-white"
							>
								{moves.length}
							</Badge>
						) : null}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="persediaan">
					<Card>
						<CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<CardTitle>Persediaan saat ini</CardTitle>
								<CardDescription>
									{filtered.length} dari {products.length} produk
									{habis > 0 ? ` · ${habis} habis perlu restock` : ""}
								</CardDescription>
							</div>
							<div className="flex flex-wrap gap-2">
								<div className="relative">
									<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										aria-label="Cari produk"
										placeholder="Cari produk…"
										value={query}
										onChange={(e) => setQuery(e.target.value)}
										className="w-[200px] pl-9"
									/>
								</div>
								<SearchSelect
									value={category}
									onChange={setCategory}
									options={[
										{ value: "all", label: "Semua kategori" },
										...categories.map((c) => ({ value: c, label: c })),
									]}
									placeholder="Kategori"
									searchPlaceholder="Cari kategori…"
									emptyText="Tidak ada kategori yang cocok."
									ariaLabel="Filter kategori"
									className="w-[160px]"
								/>
								<SearchSelect
									value={condition}
									onChange={(v) => setCondition(v as ConditionFilter)}
									options={[
										{ value: "all", label: "Semua kondisi" },
										{ value: "aman", label: "Aman" },
										{ value: "menipis", label: "Menipis" },
										{ value: "habis", label: "Habis" },
									]}
									placeholder="Kondisi"
									searchPlaceholder="Cari kondisi…"
									emptyText="Tidak ada kondisi yang cocok."
									ariaLabel="Filter kondisi"
									className="w-[150px]"
								/>
							</div>
						</CardHeader>
						<CardContent className="px-0">
							{loading ? (
								<div className="space-y-2 px-6 py-2">
									{["r1", "r2", "r3", "r4", "r5"].map((k) => (
										<Skeleton key={k} className="h-12 w-full" />
									))}
								</div>
							) : filtered.length === 0 ? (
								<EmptyState
									variant={products.length === 0 ? "stock" : "search"}
									title={
										products.length === 0
											? "Belum ada produk untuk dipantau"
											: "Tidak ada produk yang cocok"
									}
									description={
										products.length === 0
											? "Tambahkan produk dan catat stok masuk untuk mulai memantau persediaan."
											: "Coba ubah kata kunci atau kosongkan filter kategori dan kondisi."
									}
									action={
										query || category !== "all" || condition !== "all" ? (
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													setQuery("");
													setCategory("all");
													setCondition("all");
												}}
											>
												Reset filter
											</Button>
										) : undefined
									}
									size="sm"
									surface="plain"
									className="py-8"
								/>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Produk</TableHead>
											<TableHead>Kategori</TableHead>
											<TableHead className="w-[220px]">Stok</TableHead>
											<TableHead>Kondisi</TableHead>
											<TableHead className="text-right">Aksi</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filtered.map((p) => (
											<TableRow key={p.id}>
												<TableCell className="font-medium">{p.name}</TableCell>
												<TableCell className="text-muted-foreground">
													{p.category}
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<span className="w-8 text-right font-semibold tabular-nums">
															{p.stock}
														</span>
														<div
															role="progressbar"
															aria-valuenow={p.stock}
															aria-valuemin={0}
															aria-valuemax={MAX_BAR}
															aria-label={`Stok ${p.name}`}
															className="h-1.5 w-28 overflow-hidden rounded-full bg-muted"
														>
															<div
																className={`h-full rounded-full ${stockBarTone(p.stock)}`}
																style={{
																	width: `${Math.min(100, (Math.max(0, p.stock) / MAX_BAR) * 100)}%`,
																}}
															/>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<StockStatusBadge stock={p.stock} />
												</TableCell>
												<TableCell className="text-right">
													<Button
														variant="outline"
														size="sm"
														onClick={() => openRestock(p.id)}
													>
														<Plus /> Restock
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="riwayat">
					<Card>
						<CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
							<div className="flex items-center gap-2">
								<History className="size-4 text-muted-foreground" />
								<div>
									<CardTitle>Riwayat</CardTitle>
								</div>
							</div>
							<div className="flex flex-wrap gap-2">
								<SearchSelect
									value={moveProductId || "all"}
									onChange={(v) => setMoveProductId(v === "all" ? "" : v)}
									options={[
										{ value: "all", label: "Semua produk" },
										...products.map((p) => ({
											value: String(p.id),
											label: p.name,
											hint: p.category,
										})),
									]}
									placeholder="Semua produk"
									searchPlaceholder="Cari produk…"
									emptyText="Tidak ada produk yang cocok."
									ariaLabel="Filter produk"
									className="w-[170px]"
								/>
								<SearchSelect
									value={moveType || "all"}
									onChange={(v) => setMoveType(v === "all" ? "" : v)}
									options={[
										{ value: "all", label: "Semua jenis" },
										{ value: "masuk", label: "Masuk" },
										{ value: "keluar", label: "Keluar" },
									]}
									placeholder="Semua jenis"
									searchPlaceholder="Cari jenis…"
									emptyText="Tidak ada jenis yang cocok."
									ariaLabel="Jenis pergerakan"
									className="w-[140px]"
								/>
								{dateRange ? (
									<PeriodePicker
										range={dateRange}
										onApply={(r) => {
											setStart(toISODate(r.from));
											setEnd(toISODate(r.to));
										}}
									/>
								) : (
									<button
										type="button"
										onClick={applyDefaultRange}
										className="flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-700"
									>
										<CalendarIcon className="size-4 shrink-0" />
										Pilih rentang
									</button>
								)}
								{hasMoveFilters ? (
									<Button variant="outline" onClick={resetMoveFilters}>
										Reset
									</Button>
								) : null}
							</div>
						</CardHeader>
						<CardContent className="px-0">
							{movesError ? (
								<Alert variant="destructive" className="mx-6 mb-2">
									<AlertDescription>{movesError}</AlertDescription>
								</Alert>
							) : null}
							{movesLoading ? (
								<div className="space-y-2 px-6 py-2">
									{["r1", "r2", "r3", "r4", "r5"].map((k) => (
										<Skeleton key={k} className="h-11 w-full" />
									))}
								</div>
							) : moves.length === 0 ? (
								<EmptyState
									variant="stock"
									title={
										hasMoveFilters
											? "Belum ada pergerakan sesuai filter"
											: "Belum ada pergerakan"
									}
									description={
										hasMoveFilters
											? "Coba kosongkan filter untuk melihat seluruh riwayat stok."
											: "Pergerakan stok masuk dan keluar akan muncul di sini setelah ada transaksi."
									}
									action={
										hasMoveFilters ? (
											<Button
												variant="outline"
												size="sm"
												onClick={resetMoveFilters}
											>
												Reset filter
											</Button>
										) : undefined
									}
									size="sm"
									surface="plain"
									className="py-8"
								/>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Tanggal</TableHead>
											<TableHead>Produk</TableHead>
											<TableHead>Jenis</TableHead>
											<TableHead className="text-right">Jumlah</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{moves.map((m) => (
											<TableRow key={m.id}>
												<TableCell className="whitespace-nowrap tabular-nums">
													{fmtDateTime(m.date)}
												</TableCell>
												<TableCell className="font-medium">
													{m.product}
												</TableCell>
												<TableCell>
													<Badge
														variant={
															m.type === "masuk" ? "secondary" : "destructive"
														}
														className="gap-1 font-semibold"
													>
														{m.type === "masuk" ? (
															<ArrowUpRight className="size-3 text-emerald-600" />
														) : (
															<ArrowDownRight className="size-3 text-destructive" />
														)}
														{m.type === "masuk" ? "Masuk" : "Keluar"}
													</Badge>
												</TableCell>
												<TableCell
													className={`text-right font-semibold tabular-nums ${m.type === "masuk" ? "text-emerald-700" : ""}`}
												>
													{m.type === "masuk" ? "+" : "-"}
													{m.quantity}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</main>
	);
}
