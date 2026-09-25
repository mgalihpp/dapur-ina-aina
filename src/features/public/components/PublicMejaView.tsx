import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/features/shared/components/EmptyState";
import type { PublicMeja } from "@/server/public-functions";
import { listPublicMeja } from "@/server/public-functions";
import {
	DEFAULT_GUEST_COUNT,
	rehydrateGuestStore,
	selectGuestCart,
	selectGuestHydrated,
	selectGuestTable,
	useGuestStore,
} from "../lib/guest-store";
import { PublicOrderSummary, PublicPageLayout } from "./PublicLayout";

function shortLabel(nama: string): string {
	const match = nama.match(/(\d+)\s*$/);
	return match?.[1] ?? nama.slice(0, 4);
}

function isSameTable(
	table: { nama: string; lantai: string } | null,
	row: PublicMeja,
): boolean {
	return table?.nama === row.nama;
}

function MejaPlan({
	meja,
	selected,
	onSelect,
}: {
	meja: PublicMeja;
	selected: boolean;
	onSelect: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onSelect}
			aria-pressed={selected}
			aria-label={`Pilih ${meja.nama}`}
			className={`relative mx-auto flex h-36 w-36 items-center justify-center rounded-2xl transition outline-none ${
				selected
					? "ring-2 ring-[#F97316] ring-offset-2 ring-offset-white"
					: "hover:ring-2 hover:ring-neutral-200 hover:ring-offset-2 hover:ring-offset-white"
			}`}
		>
			<span
				aria-hidden
				className="absolute top-1 left-1/2 h-7 w-10 -translate-x-1/2 rounded-md border border-neutral-300 bg-white"
			/>
			<span
				aria-hidden
				className="absolute bottom-1 left-1/2 h-7 w-10 -translate-x-1/2 rounded-md border border-neutral-300 bg-white"
			/>
			<span
				aria-hidden
				className="absolute top-1/2 left-1 h-10 w-7 -translate-y-1/2 rounded-md border border-neutral-300 bg-white"
			/>
			<span
				aria-hidden
				className="absolute top-1/2 right-1 h-10 w-7 -translate-y-1/2 rounded-md border border-neutral-300 bg-white"
			/>
			<span
				aria-hidden
				className={`flex h-20 w-20 items-center justify-center rounded-full border-2 text-lg font-bold ${
					selected
						? "border-[#F97316] bg-[#F97316]/10 text-[#F97316]"
						: "border-neutral-300 bg-white text-neutral-700"
				}`}
			>
				{shortLabel(meja.nama)}
			</span>
		</button>
	);
}

export function PublicMejaView() {
	const navigate = useNavigate();
	const [mejaRows, setMejaRows] = useState<PublicMeja[]>([]);
	const [lantaiTab, setLantaiTab] = useState("Lantai 1");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const hydrated = useGuestStore(selectGuestHydrated);
	const table = useGuestStore(selectGuestTable);
	const cart = useGuestStore(selectGuestCart);
	const setTable = useGuestStore((state) => state.setTable);

	useEffect(() => {
		void rehydrateGuestStore();
	}, []);

	useEffect(() => {
		let active = true;
		listPublicMeja()
			.then((rows) => {
				if (active) setMejaRows(rows);
			})
			.catch((cause: unknown) => {
				if (active) {
					setError(
						cause instanceof Error ? cause.message : "Gagal memuat meja.",
					);
				}
			})
			.finally(() => {
				if (active) setLoading(false);
			});
		return () => {
			active = false;
		};
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
		setTable({
			nama: row.nama,
			lantai: row.lantai,
			tamu: isSameTable(table, row)
				? (table?.tamu ?? DEFAULT_GUEST_COUNT)
				: DEFAULT_GUEST_COUNT,
		});
		setLantaiTab(row.lantai);
	}

	function adjustGuest(row: PublicMeja, delta: number) {
		const current = isSameTable(table, row)
			? (table?.tamu ?? DEFAULT_GUEST_COUNT)
			: DEFAULT_GUEST_COUNT;
		const next = Math.min(Math.max(current + delta, 1), 20);
		setTable({ nama: row.nama, lantai: row.lantai, tamu: next });
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
				<p className="mt-8 text-sm text-neutral-500">Memuat meja…</p>
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
									meja={meja}
									selected={selected}
									onSelect={() => selectTable(meja)}
								/>
								<p className="mt-2 text-sm font-semibold">{meja.nama}</p>
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
							</div>
						);
					})}
				</div>
			)}
		</PublicPageLayout>
	);
}
