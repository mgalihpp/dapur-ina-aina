import { Pencil, Plus, Search, Trash2 } from "lucide-react";
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
import { SimpleRowsSkeleton } from "@/components/ui/skeletons";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useAdminProducts } from "@/features/products/queries";
import { EmptyState } from "@/features/shared/components/EmptyState";
import { mutationErrorMessage, queryErrorMessage } from "@/lib/query-errors";
import {
	useCreateCategory,
	useDeleteCategory,
	useUpdateCategory,
} from "../mutations";
import { useCategories } from "../queries";

type Category = { id: number; namaKategori: string };

export function CategoriesView() {
	const categoriesQuery = useCategories();
	const productsQuery = useAdminProducts();
	const createCategory = useCreateCategory();
	const updateCategory = useUpdateCategory();
	const deleteCategory = useDeleteCategory();

	const [name, setName] = useState("");
	const [editing, setEditing] = useState<Category | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [query, setQuery] = useState("");

	const categories = categoriesQuery.data ?? [];
	const products = productsQuery.data ?? [];
	const loading = categoriesQuery.isPending || productsQuery.isPending;
	const busy = createCategory.isPending || updateCategory.isPending;
	const deleting = deleteCategory.isPending;
	const loadError = categoriesQuery.isError
		? queryErrorMessage(categoriesQuery.error, "Gagal memuat kategori.")
		: productsQuery.isError
			? queryErrorMessage(productsQuery.error, "Gagal memuat produk.")
			: null;
	const notice = error ?? loadError;

	const countByCategory = new Map<number, number>();
	for (const product of products) {
		countByCategory.set(
			product.kategoriId,
			(countByCategory.get(product.kategoriId) ?? 0) + 1,
		);
	}

	const filtered = categories.filter((category) =>
		category.namaKategori.toLowerCase().includes(query.toLowerCase()),
	);

	function openAdd() {
		setEditing(null);
		setName("");
		setError(null);
		setDialogOpen(true);
	}

	function beginEdit(category: Category) {
		setEditing(category);
		setName(category.namaKategori);
		setError(null);
		setDialogOpen(true);
	}

	function save(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (busy) return;
		setError(null);
		const onSuccess = () => setDialogOpen(false);
		const onError = (cause: unknown) =>
			setError(mutationErrorMessage(cause, "Gagal menyimpan kategori."));
		if (editing) {
			updateCategory.mutate(
				{ id: editing.id, namaKategori: name },
				{ onSuccess, onError },
			);
		} else {
			createCategory.mutate({ namaKategori: name }, { onSuccess, onError });
		}
	}

	function confirmDelete() {
		if (!deleteTarget || deleting) return;
		setError(null);
		deleteCategory.mutate(
			{ id: deleteTarget.id },
			{
				onSuccess: () => setDeleteTarget(null),
				onError: (cause) => {
					setDeleteTarget(null);
					setError(mutationErrorMessage(cause, "Gagal menghapus kategori."));
				},
			},
		);
	}

	return (
		<main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-8">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-2xl font-bold tracking-tight">Kategori</h1>
				<Button
					type="button"
					onClick={openAdd}
					className="bg-[#EF7D1A] text-white hover:bg-[#ea6a0a]"
				>
					<Plus /> Tambah kategori
				</Button>
			</div>

			{notice ? (
				<Alert variant="destructive" className="mt-4">
					<AlertTitle>Gagal memuat</AlertTitle>
					<AlertDescription>{notice}</AlertDescription>
				</Alert>
			) : null}

			<Card className="mt-5">
				<CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<CardTitle>Daftar kategori</CardTitle>
						<CardDescription>
							{filtered.length} dari {categories.length} kategori
						</CardDescription>
					</div>
					<div className="relative">
						<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							aria-label="Cari kategori"
							placeholder="Cari kategori…"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							className="w-[220px] pl-9"
						/>
					</div>
				</CardHeader>
				<CardContent className="px-0">
					{loading ? (
						<SimpleRowsSkeleton count={3} />
					) : filtered.length === 0 ? (
						<EmptyState
							variant="category"
							title={
								categories.length === 0
									? "Belum ada kategori"
									: "Tidak ada kategori yang cocok"
							}
							description={
								categories.length === 0
									? "Buat kategori seperti Makanan Utama, Appetizer, atau Minuman untuk mengelompokkan menu."
									: "Coba ubah kata kunci pencarian."
							}
							action={
								categories.length === 0 ? (
									<Button
										type="button"
										onClick={openAdd}
										className="bg-[#EF7D1A] text-white hover:bg-[#ea6a0a]"
									>
										<Plus /> Buat kategori pertama
									</Button>
								) : (
									<Button
										type="button"
										variant="outline"
										onClick={() => setQuery("")}
									>
										Reset pencarian
									</Button>
								)
							}
							size="sm"
							surface="plain"
							className="px-4 py-8"
						/>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Nama kategori</TableHead>
									<TableHead>Menu</TableHead>
									<TableHead className="text-right">Aksi</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filtered.map((category) => {
									const count = countByCategory.get(category.id) ?? 0;
									return (
										<TableRow key={category.id}>
											<TableCell className="font-medium">
												{category.namaKategori}
											</TableCell>
											<TableCell>
												<Badge variant="secondary">{count} menu</Badge>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-4">
													<button
														type="button"
														aria-label={`Ubah ${category.namaKategori}`}
														onClick={() => beginEdit(category)}
														className="flex items-center gap-1 text-[13px] font-semibold text-green-600 transition hover:opacity-80"
													>
														<Pencil className="h-3.5 w-3.5" />
														Ubah
													</button>
													<button
														type="button"
														aria-label={`Hapus ${category.namaKategori}`}
														onClick={() => setDeleteTarget(category)}
														className="flex items-center gap-1 text-[13px] font-semibold text-[#EF7D1A] transition hover:opacity-80"
													>
														<Trash2 className="h-3.5 w-3.5" />
														Hapus
													</button>
												</div>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>
							{editing ? "Ubah kategori" : "Tambah kategori"}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={save} className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="category-name">Nama kategori</Label>
							<Input
								id="category-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								maxLength={50}
								required
								placeholder="Contoh: Minuman"
							/>
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
										: "Tambah kategori"}
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
						<AlertDialogTitle>Hapus kategori ini?</AlertDialogTitle>
						<AlertDialogDescription>
							{deleteTarget
								? `Kategori ${deleteTarget.namaKategori} akan dihapus permanen. Kategori yang masih dipakai menu tidak bisa dihapus.`
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
							{deleting ? "Menghapus…" : "Hapus kategori"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</main>
	);
}
