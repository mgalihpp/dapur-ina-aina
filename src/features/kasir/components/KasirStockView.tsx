import {
	ArrowDownRight,
	ArrowUpRight,
	CircleAlert,
	CircleCheck,
	CircleX,
	History,
	Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { EmptyState } from "@/features/shared/components/EmptyState";
import { SearchSelect } from "@/features/shared/components/search-select";
import {
	StockStatusBadge,
	stockBarTone,
	stockConditionOf,
} from "@/features/shared/components/stock-status";
import { fmtDateTime } from "@/features/shared/lib/format";
import { queryErrorMessage } from "@/lib/query-errors";
import { useCashierStockMoves, useCashierStockOverview } from "../queries";

type ConditionFilter = "all" | "aman" | "menipis" | "habis";

const MAX_BAR = 20;

export function KasirStockView() {
	const [query, setQuery] = useState("");
	const [condition, setCondition] = useState<ConditionFilter>("all");

	const overviewQuery = useCashierStockOverview();
	const movesQuery = useCashierStockMoves();

	const products = useMemo(
		() => overviewQuery.data ?? [],
		[overviewQuery.data],
	);
	const moves = useMemo(() => movesQuery.data ?? [], [movesQuery.data]);

	const siap = products.filter((p) => p.stock > 5).length;
	const menipis = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
	const habis = products.filter((p) => p.stock <= 0).length;

	const filtered = products.filter((p) => {
		if (
			query &&
			!`${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase())
		)
			return false;
		if (condition !== "all" && stockConditionOf(p.stock) !== condition)
			return false;
		return true;
	});

	const loading = overviewQuery.isPending;
	const movesLoading = movesQuery.isPending;
	const error =
		overviewQuery.isError || movesQuery.isError
			? queryErrorMessage(
					overviewQuery.error ?? movesQuery.error,
					"Gagal memuat stok.",
				)
			: null;

	const stats = [
		{ label: "Siap jual", value: siap, icon: CircleCheck },
		{ label: "Menipis", value: menipis, icon: CircleAlert },
		{ label: "Habis", value: habis, icon: CircleX },
	];

	return (
		<main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-8">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Stok</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Acuan ketersediaan menu hari ini. Restock hanya bisa dilakukan admin.
				</p>
			</div>

			{error ? (
				<Alert variant="destructive" className="mt-4">
					<AlertTitle>Gagal memuat stok</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			) : null}

			{habis > 0 && !loading ? (
				<Alert className="mt-4 border-amber-200 bg-amber-50/70">
					<CircleAlert className="size-4 text-amber-700" />
					<AlertTitle className="text-amber-950">
						{habis} produk habis
					</AlertTitle>
					<AlertDescription className="text-amber-900">
						Jangan tawarkan ke pelanggan sebelum admin melakukan restock.
					</AlertDescription>
				</Alert>
			) : null}

			<div className="mt-5 grid grid-cols-3 gap-3">
				{loading
					? ["s1", "s2", "s3"].map((k) => (
							<Card key={k}>
								<CardContent className="pt-6">
									<Skeleton className="h-8 w-14" />
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
								<CardTitle>Ketersediaan menu</CardTitle>
								<CardDescription>
									{filtered.length} dari {products.length} produk
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
									value={condition}
									onChange={(v) => setCondition(v as ConditionFilter)}
									options={[
										{ value: "all", label: "Semua kondisi" },
										{ value: "aman", label: "Siap jual" },
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
											? "Belum ada produk"
											: "Tidak ada produk yang cocok"
									}
									description={
										products.length === 0
											? "Produk yang tersedia akan muncul setelah admin menambahkannya."
											: "Coba ubah kata kunci atau filter kondisi."
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
											<TableHead className="w-[200px]">Stok</TableHead>
											<TableHead>Kondisi</TableHead>
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
															className="h-1.5 w-24 overflow-hidden rounded-full bg-muted"
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
						<CardHeader>
							<div className="flex items-center gap-2">
								<History className="size-4 text-muted-foreground" />
								<div>
									<CardTitle>Pergerakan terakhir</CardTitle>
								</div>
							</div>
						</CardHeader>
						<CardContent className="px-0">
							{movesLoading ? (
								<div className="space-y-2 px-6 py-2">
									{["r1", "r2", "r3", "r4", "r5"].map((k) => (
										<Skeleton key={k} className="h-11 w-full" />
									))}
								</div>
							) : moves.length === 0 ? (
								<EmptyState
									variant="stock"
									title="Belum ada riwayat pergerakan"
									description="Riwayat stok masuk dan keluar akan tampil di sini."
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
