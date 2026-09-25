import { useCallback, useEffect, useState } from "react";
import {
	createCategory,
	deleteCategory,
	listCategories,
	updateCategory,
} from "@/server/category-functions";

type Category = { id: number; namaKategori: string };

export function CategoriesView() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [name, setName] = useState("");
	const [editing, setEditing] = useState<Category | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	const refresh = useCallback(async () => {
		setCategories(await listCategories());
	}, []);

	useEffect(() => {
		void refresh().catch((cause: unknown) =>
			setError(
				cause instanceof Error ? cause.message : "Gagal memuat kategori.",
			),
		);
	}, [refresh]);

	async function save(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (busy) return;
		setBusy(true);
		setError(null);
		try {
			if (editing) {
				await updateCategory({ data: { id: editing.id, namaKategori: name } });
			} else {
				await createCategory({ data: { namaKategori: name } });
			}
			setName("");
			setEditing(null);
			await refresh();
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : "Gagal menyimpan kategori.",
			);
		} finally {
			setBusy(false);
		}
	}

	async function remove(category: Category) {
		if (!window.confirm(`Hapus kategori ${category.namaKategori}?`)) return;
		setError(null);
		try {
			await deleteCategory({ data: { id: category.id } });
			await refresh();
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : "Gagal menghapus kategori.",
			);
		}
	}

	return (
		<main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-6 sm:px-8">
			<h1 className="text-2xl font-bold">Kategori</h1>
			{error ? (
				<p
					role="alert"
					className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
				>
					{error}
				</p>
			) : null}
			<form
				onSubmit={(event) => void save(event)}
				className="mt-5 flex flex-wrap gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm"
			>
				<label className="min-w-0 flex-1">
					<span className="sr-only">Nama kategori</span>
					<input
						value={name}
						onChange={(event) => setName(event.target.value)}
						maxLength={50}
						required
						placeholder="Contoh: Minuman"
						className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500"
					/>
				</label>
				<button
					type="submit"
					disabled={busy}
					className="rounded-lg bg-[#F97316] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
				>
					{busy
						? "Menyimpan…"
						: editing
							? "Simpan perubahan"
							: "Tambah kategori"}
				</button>
				{editing ? (
					<button
						type="button"
						onClick={() => {
							setEditing(null);
							setName("");
						}}
						className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm"
					>
						Batal
					</button>
				) : null}
			</form>
			<ul className="mt-4 divide-y divide-neutral-100 rounded-2xl border border-neutral-100 bg-white shadow-sm">
				{categories.map((category) => (
					<li
						key={category.id}
						className="flex items-center justify-between gap-4 px-4 py-3"
					>
						<span className="font-medium">{category.namaKategori}</span>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => {
									setEditing(category);
									setName(category.namaKategori);
								}}
								className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm"
							>
								Ubah
							</button>
							<button
								type="button"
								onClick={() => void remove(category)}
								className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-700"
							>
								Hapus
							</button>
						</div>
					</li>
				))}
				{categories.length === 0 ? (
					<li className="px-4 py-8 text-center text-sm text-neutral-500">
						Belum ada kategori.
					</li>
				) : null}
			</ul>
		</main>
	);
}
