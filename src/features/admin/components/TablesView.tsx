import { Building2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { EmptyState } from "@/features/shared/components/EmptyState";
import { SearchSelect } from "@/features/shared/components/search-select";
import { TableIcon } from "@/features/shared/components/table-icon";
import { mutationErrorMessage, queryErrorMessage } from "@/lib/query-errors";
import { useCreateMeja, useDeleteMeja, useRenameMeja } from "../mutations";
import { useTables } from "../queries";

type Meja = { id: number; nama: string; lantai: string };

function shortLabel(nama: string): string {
	const match = nama.match(/(\d+)\s*$/);
	return match?.[1] ?? nama.slice(0, 4);
}

const LANTAI_BARU = "__baru__";

export function TablesView() {
	const tablesQuery = useTables();
	const createMeja = useCreateMeja();
	const renameMeja = useRenameMeja();
	const deleteMeja = useDeleteMeja();

	const [name, setName] = useState("");
	const [lantai, setLantai] = useState("Lantai 1");
	const [editing, setEditing] = useState<Meja | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<Meja | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [query, setQuery] = useState("");
	const [lantaiFilter, setLantaiFilter] = useState("all");

	const tables = tablesQuery.data ?? [];
	const loading = tablesQuery.isPending;
	const busy = createMeja.isPending || renameMeja.isPending;
	const deleting = deleteMeja.isPending;
	const loadError = tablesQuery.isError
		? queryErrorMessage(tablesQuery.error, "Gagal memuat meja.")
		: null;
	const notice = error ?? loadError;

	const lantaiOptions = [...new Set(tables.map((t) => t.lantai))].sort();
	const countByLantai = new Map<string, number>();
	for (const table of tables) {
		countByLantai.set(table.lantai, (countByLantai.get(table.lantai) ?? 0) + 1);
	}

	const filtered = tables.filter((meja) => {
		if (lantaiFilter !== "all" && meja.lantai !== lantaiFilter) return false;
		if (
			query &&
			!`${meja.nama} ${meja.lantai}`.toLowerCase().includes(query.toLowerCase())
		)
			return false;
		return true;
	});
	const hasFilters = query !== "" || lantaiFilter !== "all";

	function openAdd() {
		setEditing(null);
		setName("");
		setLantai(lantaiOptions[0] ?? "Lantai 1");
		setError(null);
		setDialogOpen(true);
	}

	function beginEdit(meja: Meja) {
		setEditing(meja);
		setName(meja.nama);
		setLantai(meja.lantai);
		setError(null);
		setDialogOpen(true);
	}

	function save(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (busy || !lantai.trim()) return;
		setError(null);
		const onSuccess = () => setDialogOpen(false);
		const onError = (cause: unknown) =>
			setError(mutationErrorMessage(cause, "Gagal menyimpan meja."));
		if (editing) {
			renameMeja.mutate(
				{ id: editing.id, nama: name, lantai },
				{ onSuccess, onError },
			);
		} else {
			createMeja.mutate({ nama: name, lantai }, { onSuccess, onError });
		}
	}

	function confirmDelete() {
		if (!deleteTarget || deleting) return;
		setError(null);
		deleteMeja.mutate(
			{ id: deleteTarget.id },
			{
				onSuccess: () => setDeleteTarget(null),
				onError: (cause) => {
					setDeleteTarget(null);
					setError(mutationErrorMessage(cause, "Gagal menghapus meja."));
				},
			},
		);
	}

	return (
		<main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-8">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-2xl font-bold tracking-tight">Meja</h1>
				<Button
					type="button"
					onClick={openAdd}
					className="bg-[#EF7D1A] text-white hover:bg-[#ea6a0a]"
				>
					<Plus /> Tambah meja
				</Button>
			</div>

			{notice ? (
				<Alert variant="destructive" className="mt-4">
					<AlertTitle>Gagal memuat</AlertTitle>
					<AlertDescription>{notice}</AlertDescription>
				</Alert>
			) : null}

			<div className="mt-5 grid gap-3 sm:grid-cols-2">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total meja
						</CardTitle>
						<TableIcon className="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold tabular-nums">{tables.length}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Lantai
						</CardTitle>
						<Building2 className="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold tabular-nums">
							{lantaiOptions.length}
						</p>
					</CardContent>
				</Card>
			</div>

			<Card className="mt-4">
				<CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<CardTitle>Daftar meja</CardTitle>
						<CardDescription>
							{filtered.length} dari {tables.length} meja
						</CardDescription>
					</div>
					<div className="flex flex-wrap gap-2">
						<div className="relative">
							<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								aria-label="Cari meja"
								placeholder="Cari meja atau lantai…"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								className="w-[220px] pl-9"
							/>
						</div>
						<SearchSelect
							value={lantaiFilter}
							onChange={setLantaiFilter}
							options={[
								{ value: "all", label: "Semua lantai" },
								...lantaiOptions.map((l) => ({ value: l, label: l })),
							]}
							placeholder="Semua lantai"
							searchPlaceholder="Cari lantai…"
							emptyText="Tidak ada lantai yang cocok."
							ariaLabel="Filter lantai"
							className="w-[160px]"
						/>
					</div>
				</CardHeader>
				<CardContent className="px-0">
					{loading ? (
						<div className="space-y-2 px-6 py-2">
							{["r1", "r2", "r3", "r4"].map((k) => (
								<Skeleton key={k} className="h-14 w-full" />
							))}
						</div>
					) : filtered.length === 0 ? (
						<EmptyState
							variant="table"
							title={
								tables.length === 0
									? "Belum ada meja"
									: "Tidak ada meja yang cocok"
							}
							description={
								tables.length === 0
									? "Tambahkan meja pertama supaya pelanggan bisa memilih tempat sebelum memesan."
									: "Coba ubah kata kunci atau kosongkan filter lantai."
							}
							action={
								tables.length === 0 ? (
									<Button
										type="button"
										onClick={openAdd}
										className="bg-[#EF7D1A] text-white hover:bg-[#ea6a0a]"
									>
										<Plus /> Tambah meja pertama
									</Button>
								) : hasFilters ? (
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											setQuery("");
											setLantaiFilter("all");
										}}
									>
										Reset filter
									</Button>
								) : undefined
							}
						/>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Meja</TableHead>
									<TableHead>Lantai</TableHead>
									<TableHead className="text-right">Aksi</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filtered.map((meja) => (
									<TableRow key={meja.id}>
										<TableCell>
											<div className="flex items-center gap-3">
												<span
													aria-hidden
													className="flex size-9 items-center justify-center rounded-full border text-sm font-bold text-muted-foreground"
												>
													{shortLabel(meja.nama)}
												</span>
												<span className="font-medium">{meja.nama}</span>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant="secondary">{meja.lantai}</Badge>
										</TableCell>
										<TableCell className="text-right">
											<div className="flex items-center justify-end gap-4">
												<button
													type="button"
													aria-label={`Ubah ${meja.nama}`}
													onClick={() => beginEdit(meja)}
													className="flex items-center gap-1 text-[13px] font-semibold text-green-600 transition hover:opacity-80"
												>
													<Pencil className="h-3.5 w-3.5" />
													Ubah
												</button>
												<button
													type="button"
													aria-label={`Hapus ${meja.nama}`}
													onClick={() => setDeleteTarget(meja)}
													className="flex items-center gap-1 text-[13px] font-semibold text-[#EF7D1A] transition hover:opacity-80"
												>
													<Trash2 className="h-3.5 w-3.5" />
													Hapus
												</button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{editing ? "Ubah meja" : "Tambah meja"}</DialogTitle>
					</DialogHeader>
					<form onSubmit={save} className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="meja-name">Nama meja</Label>
							<Input
								id="meja-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								maxLength={20}
								required
								placeholder="Contoh: Meja 9"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="meja-lantai">Lantai</Label>
							<SearchSelect
								id="meja-lantai"
								value={lantaiOptions.includes(lantai) ? lantai : LANTAI_BARU}
								onChange={(value) =>
									setLantai(value === LANTAI_BARU ? "" : value)
								}
								options={[
									...lantaiOptions.map((l) => ({
										value: l,
										label: l,
										hint: `${countByLantai.get(l) ?? 0} meja`,
									})),
									{ value: LANTAI_BARU, label: "+ Lantai baru…" },
								]}
								placeholder="Pilih lantai"
								searchPlaceholder="Cari lantai…"
								emptyText="Tidak ada lantai yang cocok."
								ariaLabel="Pilih lantai"
								className="w-full"
							/>
							{lantaiOptions.includes(lantai) ? null : (
								<Input
									aria-label="Nama lantai baru"
									value={lantai}
									onChange={(e) => setLantai(e.target.value)}
									maxLength={20}
									required
									placeholder="Contoh: Lantai 3"
								/>
							)}
						</div>
						{error ? (
							<Alert variant="destructive">
								<AlertTitle>Gagal menyimpan</AlertTitle>
								<AlertDescription>{error}</AlertDescription>
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
							<Button
								type="submit"
								disabled={busy}
								className="bg-[#EF7D1A] text-white hover:bg-[#ea6a0a]"
							>
								{busy
									? "Menyimpan…"
									: editing
										? "Simpan perubahan"
										: "Tambah meja"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={deleteTarget !== null}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Hapus meja ini?</AlertDialogTitle>
						<AlertDialogDescription>
							{deleteTarget
								? `${deleteTarget.nama} (${deleteTarget.lantai}) tidak tampil lagi di halaman pelanggan. Tindakan ini tidak bisa dibatalkan.`
								: ""}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							disabled={deleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleting ? "Menghapus…" : "Hapus meja"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</main>
	);
}
