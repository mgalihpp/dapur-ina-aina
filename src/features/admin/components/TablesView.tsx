import { useState } from "react";
import { EmptyState } from "@/features/shared/components/EmptyState";
import { mutationErrorMessage, queryErrorMessage } from "@/lib/query-errors";
import { useCreateMeja, useDeleteMeja, useRenameMeja } from "../mutations";
import { useTables } from "../queries";

type Meja = { id: number; nama: string; lantai: string };

export function TablesView() {
	const tablesQuery = useTables();
	const createMeja = useCreateMeja();
	const renameMeja = useRenameMeja();
	const deleteMeja = useDeleteMeja();

	const [name, setName] = useState("");
	const [lantai, setLantai] = useState("Lantai 1");
	const [editing, setEditing] = useState<Meja | null>(null);
	const [error, setError] = useState<string | null>(null);

	const tables = tablesQuery.data ?? [];
	const loading = tablesQuery.isPending;
	const busy = createMeja.isPending || renameMeja.isPending;
	const loadError = tablesQuery.isError
		? queryErrorMessage(tablesQuery.error, "Gagal memuat meja.")
		: null;
	const notice = error ?? loadError;

	function save(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (busy) return;
		setError(null);
		const onSuccess = () => {
			setName("");
			setLantai("Lantai 1");
			setEditing(null);
		};
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

	function remove(meja: Meja) {
		if (!window.confirm(`Hapus ${meja.nama}?`)) return;
		setError(null);
		deleteMeja.mutate(
			{ id: meja.id },
			{
				onError: (cause) =>
					setError(mutationErrorMessage(cause, "Gagal menghapus meja.")),
			},
		);
	}

	return (
		<main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-6 sm:px-8">
			<h1 className="text-2xl font-bold">Meja</h1>
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
				className="mt-5 flex flex-wrap gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm"
			>
				<label className="min-w-0 flex-1">
					<span className="sr-only">Nama meja</span>
					<input
						value={name}
						onChange={(event) => setName(event.target.value)}
						maxLength={20}
						required
						placeholder="Contoh: Meja 9"
						className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500"
					/>
				</label>
				<label className="min-w-0">
					<span className="sr-only">Lantai</span>
					<input
						value={lantai}
						onChange={(event) => setLantai(event.target.value)}
						maxLength={20}
						required
						placeholder="Lantai 1"
						className="w-36 rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500"
					/>
				</label>
				<button
					type="submit"
					disabled={busy}
					className="rounded-lg bg-[#F97316] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
				>
					{busy ? "Menyimpan…" : editing ? "Simpan perubahan" : "Tambah meja"}
				</button>
				{editing ? (
					<button
						type="button"
						onClick={() => {
							setEditing(null);
							setName("");
							setLantai("Lantai 1");
						}}
						className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm"
					>
						Batal
					</button>
				) : null}
			</form>
			<ul className="mt-4 divide-y divide-neutral-100 rounded-2xl border border-neutral-100 bg-white shadow-sm">
				{tables.map((meja) => (
					<li
						key={meja.id}
						className="flex items-center justify-between gap-4 px-4 py-3"
					>
						<span className="font-medium">
							{meja.nama}{" "}
							<span className="text-sm font-normal text-neutral-500">
								· {meja.lantai}
							</span>
						</span>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => {
									setEditing(meja);
									setName(meja.nama);
									setLantai(meja.lantai);
								}}
								className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm"
							>
								Ubah
							</button>
							<button
								type="button"
								onClick={() => remove(meja)}
								className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-700"
							>
								Hapus
							</button>
						</div>
					</li>
				))}
				{loading ? (
					<li className="px-4 py-8 text-center text-sm text-neutral-500">
						Memuat meja…
					</li>
				) : tables.length === 0 ? (
					<li>
						<EmptyState
							variant="table"
							title="Belum ada meja"
							description="Tambahkan meja pertama supaya pelanggan bisa memilih tempat sebelum memesan."
							size="sm"
							surface="plain"
							className="px-4 py-8"
						/>
					</li>
				) : null}
			</ul>
		</main>
	);
}
