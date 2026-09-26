import { Pencil, Plus, Search, ShieldCheck, Trash2, Users } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
	DialogDescription,
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
import { mutationErrorMessage, queryErrorMessage } from "@/lib/query-errors";
import {
	useCreateStaffUser,
	useDeleteStaffUser,
	useUpdateStaffUser,
} from "../mutations";
import { useStaffUsers } from "../queries";

type StaffUser = {
	id: string;
	name: string;
	email: string;
	username: string | null;
	role: "admin" | "kasir";
};
type Fields = {
	name: string;
	email: string;
	username: string;
	password: string;
	role: "admin" | "kasir";
};
const EMPTY: Fields = {
	name: "",
	email: "",
	username: "",
	password: "",
	role: "kasir",
};

function initialsOf(name: string) {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function UsersView() {
	const usersQuery = useStaffUsers();
	const createUser = useCreateStaffUser();
	const updateUser = useUpdateStaffUser();
	const deleteUser = useDeleteStaffUser();

	const [fields, setFields] = useState<Fields>(EMPTY);
	const [editing, setEditing] = useState<StaffUser | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<StaffUser | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [query, setQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");

	const users = usersQuery.data ?? [];
	const loading = usersQuery.isPending;
	const busy = createUser.isPending || updateUser.isPending;
	const deleting = deleteUser.isPending;
	const loadError = usersQuery.isError
		? queryErrorMessage(usersQuery.error, "Gagal memuat pengguna.")
		: null;
	const notice = error ?? loadError;

	const adminCount = users.filter((u) => u.role === "admin").length;
	const kasirCount = users.filter((u) => u.role === "kasir").length;

	const filtered = users.filter((user) => {
		if (roleFilter !== "all" && user.role !== roleFilter) return false;
		if (
			query &&
			!`${user.name} ${user.username ?? ""} ${user.email}`
				.toLowerCase()
				.includes(query.toLowerCase())
		)
			return false;
		return true;
	});
	const hasFilters = query !== "" || roleFilter !== "all";

	function update<Key extends keyof Fields>(key: Key, value: Fields[Key]) {
		setFields((current) => ({ ...current, [key]: value }));
	}

	function openAdd() {
		setEditing(null);
		setFields(EMPTY);
		setError(null);
		setDialogOpen(true);
	}

	function beginEdit(user: StaffUser) {
		setEditing(user);
		setFields({
			name: user.name,
			email: user.email,
			username: user.username ?? "",
			password: "",
			role: user.role,
		});
		setError(null);
		setDialogOpen(true);
	}

	function save(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (busy) return;
		setError(null);
		const onSuccess = () => setDialogOpen(false);
		const onError = (cause: unknown) =>
			setError(mutationErrorMessage(cause, "Gagal menyimpan pengguna."));
		if (editing) {
			updateUser.mutate({ id: editing.id, ...fields }, { onSuccess, onError });
		} else {
			createUser.mutate(fields, { onSuccess, onError });
		}
	}

	function confirmDelete() {
		if (!deleteTarget || deleting) return;
		setError(null);
		deleteUser.mutate(
			{ id: deleteTarget.id },
			{
				onSuccess: () => setDeleteTarget(null),
				onError: (cause) => {
					setDeleteTarget(null);
					setError(mutationErrorMessage(cause, "Gagal menghapus pengguna."));
				},
			},
		);
	}

	return (
		<main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 sm:px-8">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Pengguna</h1>
				</div>
				<Button
					type="button"
					onClick={openAdd}
					className="bg-[#EF7D1A] text-white hover:bg-[#ea6a0a]"
				>
					<Plus /> Tambah pengguna
				</Button>
			</div>

			{notice ? (
				<Alert variant="destructive" className="mt-4">
					<AlertTitle>Gagal memuat</AlertTitle>
					<AlertDescription>{notice}</AlertDescription>
				</Alert>
			) : null}

			<div className="mt-5 grid gap-3 sm:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total pengguna
						</CardTitle>
						<Users className="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold tabular-nums">{users.length}</p>
						<p className="text-xs text-muted-foreground">akun staf terdaftar</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Admin
						</CardTitle>
						<ShieldCheck className="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold tabular-nums">{adminCount}</p>
						<p className="text-xs text-muted-foreground">
							akses penuh ke semua halaman
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Kasir
						</CardTitle>
						<Users className="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold tabular-nums">{kasirCount}</p>
						<p className="text-xs text-muted-foreground">
							akses kasir dan stok
						</p>
					</CardContent>
				</Card>
			</div>

			<Card className="mt-4">
				<CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<CardTitle>Daftar akun</CardTitle>
						<CardDescription>
							{filtered.length} dari {users.length} pengguna
						</CardDescription>
					</div>
					<div className="flex flex-wrap gap-2">
						<div className="relative">
							<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								aria-label="Cari pengguna"
								placeholder="Cari nama, username, email…"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								className="w-[240px] pl-9"
							/>
						</div>
						<SearchSelect
							value={roleFilter}
							onChange={setRoleFilter}
							options={[
								{ value: "all", label: "Semua peran" },
								{ value: "kasir", label: "Kasir" },
								{ value: "admin", label: "Admin" },
							]}
							placeholder="Semua peran"
							searchPlaceholder="Cari peran…"
							emptyText="Tidak ada peran yang cocok."
							ariaLabel="Filter peran"
							className="w-[150px]"
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
							variant={users.length === 0 ? "users" : "search"}
							title={
								users.length === 0
									? "Belum ada pengguna"
									: "Tidak ada pengguna yang cocok"
							}
							description={
								users.length === 0
									? "Tambahkan akun admin atau kasir untuk mulai mengelola restoran."
									: "Coba ubah kata kunci atau kosongkan filter peran."
							}
							action={
								users.length === 0 ? (
									<Button
										type="button"
										onClick={openAdd}
										className="bg-[#EF7D1A] text-white hover:bg-[#ea6a0a]"
									>
										<Plus /> Tambah pengguna pertama
									</Button>
								) : hasFilters ? (
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											setQuery("");
											setRoleFilter("all");
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
									<TableHead>Pengguna</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Peran</TableHead>
									<TableHead className="text-right">Aksi</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filtered.map((user) => (
									<TableRow key={user.id}>
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar className="size-9">
													<AvatarFallback>
														{initialsOf(user.name)}
													</AvatarFallback>
												</Avatar>
												<div className="min-w-0">
													<p className="truncate font-medium">{user.name}</p>
													<p className="truncate text-xs text-muted-foreground">
														@{user.username ?? "—"}
													</p>
												</div>
											</div>
										</TableCell>
										<TableCell className="max-w-[240px] truncate">
											{user.email}
										</TableCell>
										<TableCell>
											<Badge
												variant={
													user.role === "admin" ? "default" : "secondary"
												}
											>
												{user.role === "admin" ? "Admin" : "Kasir"}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<div className="flex items-center justify-end gap-4">
												<button
													type="button"
													aria-label={`Ubah ${user.name}`}
													onClick={() => beginEdit(user)}
													className="flex items-center gap-1 text-[13px] font-semibold text-green-600 transition hover:opacity-80"
												>
													<Pencil className="h-3.5 w-3.5" />
													Ubah
												</button>
												<button
													type="button"
													aria-label={`Hapus ${user.name}`}
													onClick={() => setDeleteTarget(user)}
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
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>
							{editing ? "Ubah pengguna" : "Tambah pengguna"}
						</DialogTitle>
						<DialogDescription>
							{editing
								? `Perbarui data akun ${editing.name}. Kosongkan kata sandi bila tidak diganti.`
								: "Akun baru langsung bisa dipakai masuk sesuai perannya."}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={save} className="grid gap-4">
						<div className="grid gap-2 sm:grid-cols-2">
							<div className="grid gap-2">
								<Label htmlFor="user-name">Nama</Label>
								<Input
									id="user-name"
									value={fields.name}
									onChange={(e) => update("name", e.target.value)}
									required
									maxLength={100}
									placeholder="cth. Sari Dewi"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="user-username">Username</Label>
								<Input
									id="user-username"
									value={fields.username}
									onChange={(e) => update("username", e.target.value)}
									required
									minLength={3}
									maxLength={50}
									placeholder="cth. sari.kasir"
								/>
							</div>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="user-email">Email</Label>
							<Input
								id="user-email"
								type="email"
								value={fields.email}
								onChange={(e) => update("email", e.target.value)}
								required
								placeholder="cth. sari@resto.id"
							/>
						</div>
						<div className="grid gap-2 sm:grid-cols-2">
							<div className="grid gap-2">
								<Label htmlFor="user-password">
									Kata sandi{editing ? " (opsional)" : ""}
								</Label>
								<Input
									id="user-password"
									type="password"
									value={fields.password}
									onChange={(e) => update("password", e.target.value)}
									required={!editing}
									minLength={8}
									autoComplete="new-password"
									placeholder={
										editing ? "Kosongkan bila tidak diganti" : "Min. 8 karakter"
									}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="user-role">Peran</Label>
								<SearchSelect
									id="user-role"
									value={fields.role}
									onChange={(value) =>
										update("role", value === "admin" ? "admin" : "kasir")
									}
									options={[
										{ value: "kasir", label: "Kasir", hint: "kasir & stok" },
										{ value: "admin", label: "Admin", hint: "akses penuh" },
									]}
									placeholder="Pilih peran"
									searchPlaceholder="Cari peran…"
									emptyText="Tidak ada peran yang cocok."
									ariaLabel="Pilih peran"
									className="w-full"
								/>
							</div>
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
										: "Tambah pengguna"}
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
						<AlertDialogTitle>Hapus akun ini?</AlertDialogTitle>
						<AlertDialogDescription>
							{deleteTarget
								? `Akun ${deleteTarget.name} (@${deleteTarget.username ?? "—"}) tidak bisa dipakai masuk lagi. Tindakan ini tidak bisa dibatalkan.`
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
							{deleting ? "Menghapus…" : "Hapus akun"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</main>
	);
}
