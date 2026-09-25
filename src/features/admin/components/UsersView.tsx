import { useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/features/shared/components/EmptyState";
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

export function UsersView() {
	const usersQuery = useStaffUsers();
	const createUser = useCreateStaffUser();
	const updateUser = useUpdateStaffUser();
	const deleteUser = useDeleteStaffUser();

	const [fields, setFields] = useState<Fields>(EMPTY);
	const [editing, setEditing] = useState<StaffUser | null>(null);
	const [error, setError] = useState<string | null>(null);

	const users = usersQuery.data ?? [];
	const loading = usersQuery.isPending;
	const busy = createUser.isPending || updateUser.isPending;
	const loadError = usersQuery.isError
		? queryErrorMessage(usersQuery.error, "Gagal memuat pengguna.")
		: null;
	const notice = error ?? loadError;

	function update<Key extends keyof Fields>(key: Key, value: Fields[Key]) {
		setFields((current) => ({ ...current, [key]: value }));
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
	}

	function resetForm() {
		setEditing(null);
		setFields(EMPTY);
	}

	function save(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (busy) return;
		setError(null);
		const onSuccess = () => resetForm();
		const onError = (cause: unknown) =>
			setError(mutationErrorMessage(cause, "Gagal menyimpan pengguna."));
		if (editing) {
			updateUser.mutate({ id: editing.id, ...fields }, { onSuccess, onError });
		} else {
			createUser.mutate(fields, { onSuccess, onError });
		}
	}

	function remove(user: StaffUser) {
		if (!window.confirm(`Hapus akun ${user.name}?`)) return;
		setError(null);
		deleteUser.mutate(
			{ id: user.id },
			{
				onError: (cause) =>
					setError(mutationErrorMessage(cause, "Gagal menghapus pengguna.")),
			},
		);
	}

	return (
		<main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 sm:px-8">
			<h1 className="text-2xl font-bold">Pengguna</h1>
			{notice ? (
				<p
					role="alert"
					className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
				>
					{notice}
				</p>
			) : null}
			<form
				onSubmit={(event) => save(event)}
				className="mt-5 grid grid-cols-1 gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3"
			>
				<label className="text-sm font-medium">
					Nama
					<input
						value={fields.name}
						onChange={(event) => update("name", event.target.value)}
						required
						maxLength={100}
						className="mt-1 block w-full rounded-lg border border-neutral-200 px-3 py-2.5"
					/>
				</label>
				<label className="text-sm font-medium">
					Email
					<input
						type="email"
						value={fields.email}
						onChange={(event) => update("email", event.target.value)}
						required
						className="mt-1 block w-full rounded-lg border border-neutral-200 px-3 py-2.5"
					/>
				</label>
				<label className="text-sm font-medium">
					Username
					<input
						value={fields.username}
						onChange={(event) => update("username", event.target.value)}
						required
						minLength={3}
						maxLength={50}
						className="mt-1 block w-full rounded-lg border border-neutral-200 px-3 py-2.5"
					/>
				</label>
				<label className="text-sm font-medium">
					Kata sandi{editing ? " (opsional saat ubah)" : ""}
					<input
						type="password"
						value={fields.password}
						onChange={(event) => update("password", event.target.value)}
						required={!editing}
						minLength={8}
						autoComplete="new-password"
						className="mt-1 block w-full rounded-lg border border-neutral-200 px-3 py-2.5"
					/>
				</label>
				<div className="text-sm font-medium">
					Peran
					<Select
						value={fields.role}
						onValueChange={(value) =>
							update("role", value === "admin" ? "admin" : "kasir")
						}
					>
						<SelectTrigger
							aria-label="Pilih peran"
							className="mt-1 w-full rounded-lg border-neutral-200 bg-white px-3 py-2.5"
						>
							<SelectValue placeholder="Pilih peran" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="kasir">Kasir</SelectItem>
							<SelectItem value="admin">Admin</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="flex items-end gap-2">
					<button
						type="submit"
						disabled={busy}
						className="rounded-lg bg-[#F97316] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
					>
						{busy
							? "Menyimpan…"
							: editing
								? "Simpan perubahan"
								: "Tambah pengguna"}
					</button>
					{editing ? (
						<button
							type="button"
							onClick={resetForm}
							className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm"
						>
							Batal
						</button>
					) : null}
				</div>
			</form>
			<div className="mt-5 overflow-x-auto rounded-2xl border border-neutral-100 bg-white shadow-sm">
				<table className="w-full min-w-[700px] text-left text-sm">
					<thead className="bg-neutral-50 text-xs text-neutral-500">
						<tr>
							<th className="px-4 py-3">Nama</th>
							<th className="px-4 py-3">Username</th>
							<th className="px-4 py-3">Email</th>
							<th className="px-4 py-3">Peran</th>
							<th className="px-4 py-3">Aksi</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-neutral-100">
						{users.map((user) => (
							<tr key={user.id}>
								<td className="px-4 py-3 font-medium">{user.name}</td>
								<td className="px-4 py-3">{user.username ?? "—"}</td>
								<td className="px-4 py-3">{user.email}</td>
								<td className="px-4 py-3">
									{user.role === "admin" ? "Admin" : "Kasir"}
								</td>
								<td className="px-4 py-3">
									<div className="flex gap-2">
										<button
											type="button"
											onClick={() => beginEdit(user)}
											className="rounded-md border border-neutral-200 px-3 py-1.5"
										>
											Ubah
										</button>
										<button
											type="button"
											onClick={() => remove(user)}
											className="rounded-md border border-red-200 px-3 py-1.5 text-red-700"
										>
											Hapus
										</button>
									</div>
								</td>
							</tr>
						))}
						{loading ? (
							<tr>
								<td
									colSpan={5}
									className="px-4 py-8 text-center text-sm text-neutral-500"
								>
									Memuat pengguna…
								</td>
							</tr>
						) : users.length === 0 ? (
							<tr>
								<td colSpan={5} className="p-2">
									<EmptyState
										variant="users"
										title="Belum ada pengguna"
										description="Tambahkan akun admin atau kasir untuk mulai mengelola restoran."
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
