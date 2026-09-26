import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/features/shared/components/EmptyState";
import { MejaPlan } from "@/features/shared/components/MejaPlan";
import { PublicMejaSkeleton } from "@/components/ui/skeletons";
import { queryErrorMessage } from "@/lib/query-errors";
import type { PublicMeja } from "@/server/public-functions";
import {
	DEFAULT_GUEST_COUNT,
	rehydrateGuestStore,
	selectGuestCart,
	selectGuestHydrated,
	selectGuestTable,
	useGuestStore,
} from "../lib/guest-store";
import { publicMejaQueryOptions } from "../queries";
import { PublicOrderSummary, PublicPageLayout } from "./PublicLayout";

function isSameTable(table: { id: number } | null, row: PublicMeja): boolean {
	return table?.id === row.id;
}

export function PublicMejaView() {
	const navigate = useNavigate();
	const [lantaiTab, setLantaiTab] = useState("Lantai 1");
	const mejaQuery = useQuery(publicMejaQueryOptions());
	const mejaRows = mejaQuery.data ?? [];
	const loading = mejaQuery.isPending;
	const error = mejaQuery.isError
		? queryErrorMessage(mejaQuery.error, "Gagal memuat meja.")
		: null;
	const hydrated = useGuestStore(selectGuestHydrated);
	const table = useGuestStore(selectGuestTable);
	const cart = useGuestStore(selectGuestCart);
	const setTable = useGuestStore((state) => state.setTable);

	useEffect(() => {
		void rehydrateGuestStore();
	}, []);

	useEffect(() => {
		if (!hydrated || loading || mejaRows.length === 0) return;
		const options = [...new Set(mejaRows.map((row) => row.lantai))].sort();
		const firstLantai = options[0];
		const savedRow = table
			? mejaRows.find((row) => isSameTable(table, row))
			: undefined;
		if (savedRow) {
			setLantaiTab(savedRow.lantai);
		} else {
			if (table) setTable(null);
			if (firstLantai) setLantaiTab(firstLantai);
		}
	}, [hydrated, loading, mejaRows, setTable, table]);

	const lantaiOptions = useMemo(
		() => [...new Set(mejaRows.map((row) => row.lantai))].sort(),
		[mejaRows],
	);
	const visible = mejaRows.filter((row) => row.lantai === lantaiTab);
	const selectedRow = table
		? (mejaRows.find((row) => isSameTable(table, row)) ?? null)
		: null;

	function selectFloor(lantai: string) {
		setLantaiTab(lantai);
	}

	function selectTable(row: PublicMeja) {
		if (row.terisi && !isSameTable(table, row)) return;
		setTable({
			id: row.id,
			nama: row.nama,
			lantai: row.lantai,
			tamu: isSameTable(table, row)
				? (table?.tamu ?? DEFAULT_GUEST_COUNT)
				: DEFAULT_GUEST_COUNT,
		});
		setLantaiTab(row.lantai);
	}

	function adjustGuest(row: PublicMeja, delta: number) {
		if (row.terisi && !isSameTable(table, row)) return;
		const current = isSameTable(table, row)
			? (table?.tamu ?? DEFAULT_GUEST_COUNT)
			: DEFAULT_GUEST_COUNT;
		const next = Math.min(Math.max(current + delta, 1), 20);
		setTable({ id: row.id, nama: row.nama, lantai: row.lantai, tamu: next });
	}

	function lanjutkan() {
		if (!selectedRow) return;
		void navigate({ to: "/menu" });
	}

	return (
		<PublicPageLayout
			summary={
				<PublicOrderSummary
					table={table}
					cart={cart}
					hydrated={hydrated}
					action={
						<button
							type="button"
							disabled={!hydrated || !selectedRow}
							onClick={lanjutkan}
							className="w-full rounded-xl bg-[#F97316] px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
						>
							Lanjut ke menu
						</button>
					}
				/>
			}
		>
			<header>
				<h1 className="text-2xl font-bold">Daftar meja</h1>
				<fieldset className="mt-4">
					<legend className="sr-only">Pilih lantai</legend>
					<div className="flex gap-2 overflow-x-auto pb-1">
						{lantaiOptions.map((lantai) => (
							<button
								key={lantai}
								type="button"
								aria-pressed={lantaiTab === lantai}
								onClick={() => selectFloor(lantai)}
								className={`shrink-0 rounded-full px-5 py-2 text-sm font-medium ${
									lantaiTab === lantai
										? "bg-[#F97316]/15 text-[#F97316]"
										: "bg-neutral-200/70 text-neutral-500"
								}`}
							>
								{lantai}
							</button>
						))}
					</div>
				</fieldset>
			</header>
			{error ? (
				<p
					role="alert"
					className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
				>
					{error}
				</p>
			) : null}
			{!hydrated || loading ? (
				<PublicMejaSkeleton />
			) : visible.length === 0 ? (
				<EmptyState
					variant="table"
					title="Belum ada meja"
					description="Meja yang tersedia akan muncul di sini setelah resto menyiapkannya."
					size="lg"
					surface="solid"
					className="mt-8"
				/>
			) : (
				<div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3">
					{visible.map((meja) => {
						const selected = isSameTable(table, meja);
						return (
							<div key={meja.id} className="flex flex-col items-center">
								<MejaPlan
									nama={meja.nama}
									label={
										meja.terisi && !selected
											? `${meja.nama} terisi`
											: `Pilih ${meja.nama}`
									}
									disabled={meja.terisi && !selected}
									ring={selected ? "orange" : null}
									onSelect={() => selectTable(meja)}
								/>
								<p className="mt-2 text-sm font-semibold">{meja.nama}</p>
								<span
									className={`mt-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
										meja.terisi
											? "bg-red-100 text-red-700"
											: "bg-emerald-100 text-emerald-700"
									}`}
								>
									{meja.terisi ? "Terisi" : "Kosong"}
								</span>
								{meja.terisi && meja.orderId !== null ? (
									<p className="mt-1 text-xs text-neutral-500">
										Pesanan #{meja.orderId}
									</p>
								) : null}
								{meja.terisi && !isSameTable(table, meja) ? null : (
									<div className="mt-2 flex items-center gap-3">
										<button
											type="button"
											aria-label={`Kurangi tamu ${meja.nama}`}
											onClick={() => adjustGuest(meja, -1)}
											className="h-7 w-7 rounded-full border border-neutral-300 bg-white text-sm font-bold"
										>
											−
										</button>
										<span className="min-w-5 text-center text-sm font-semibold">
											{selected ? table?.tamu : DEFAULT_GUEST_COUNT}
										</span>
										<button
											type="button"
											aria-label={`Tambah tamu ${meja.nama}`}
											onClick={() => adjustGuest(meja, 1)}
											className="h-7 w-7 rounded-full border border-neutral-300 bg-white text-sm font-bold"
										>
											+
										</button>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</PublicPageLayout>
	);
}
