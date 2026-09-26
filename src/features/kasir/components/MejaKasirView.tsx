import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSetOrderStatus } from "@/features/orders/mutations";
import { useBebaskanMeja } from "../mutations";
import { ConfirmModal } from "@/features/shared/components/ConfirmModal";
import { EmptyState } from "@/features/shared/components/EmptyState";
import { mutationErrorMessage, queryErrorMessage } from "@/lib/query-errors";
import { kasirMejaOccupancyOptions } from "../queries";

function shortLabel(nama: string): string {
	const match = nama.match(/(\d+)\s*$/);
	return match?.[1] ?? nama.slice(0, 4);
}

type PendingMejaAction =
	| { kind: "selesai" | "batal"; orderId: number }
	| { kind: "bebas"; mejaId: number; mejaNama: string }
	| null;

export function MejaKasirView() {
	const occupancyQuery = useQuery(kasirMejaOccupancyOptions);
	const rows = occupancyQuery.data ?? [];
	const setStatusMutation = useSetOrderStatus();
	const bebaskanMutation = useBebaskanMeja();
	const [actingId, setActingId] = useState<number | null>(null);
	const [freeingId, setFreeingId] = useState<number | null>(null);
	const [pending, setPending] = useState<PendingMejaAction>(null);
	const [lantaiTab, setLantaiTab] = useState<string | null>(null);
	const loadError = occupancyQuery.isError
		? queryErrorMessage(occupancyQuery.error, "Gagal memuat denah meja.")
		: null;
	const actionError =
		setStatusMutation.isError || bebaskanMutation.isError
			? mutationErrorMessage(
					setStatusMutation.error ?? bebaskanMutation.error,
					"Aksi tidak berhasil.",
				)
			: null;

	const lantaiOptions = useMemo(
		() => [...new Set(rows.map((row) => row.lantai))].sort(),
		[rows],
	);
	const activeLantai = lantaiTab ?? lantaiOptions[0] ?? "Lantai 1";
	const visible = rows.filter((row) => row.lantai === activeLantai);

	function confirmPending() {
		if (!pending) return;
		if (pending.kind === "bebas") {
			const mejaId = pending.mejaId;
			setFreeingId(mejaId);
			bebaskanMutation.mutate(
				{ id: mejaId },
				{
					onSettled: () => {
						setFreeingId(null);
						setPending(null);
					},
				},
			);
			return;
		}
		const orderId = pending.orderId;
		setActingId(orderId);
		setStatusMutation.mutate(
			{ id: orderId, status: pending.kind === "selesai" ? "selesai" : "dibatalkan" },
			{
				onSettled: () => {
					setActingId(null);
					setPending(null);
				},
			},
		);
	}

	function pendingTitle(): string {
		if (pending?.kind === "bebas") return "Bebaskan Meja Ini ?";
		if (pending?.kind === "batal") return "Batalkan Pesanan Ini ?";
		return "Selesaikan Pesanan Ini ?";
	}

	function pendingMessage(): string {
		if (pending?.kind === "bebas") return "Meja bisa dipakai tamu lain.";
		if (pending?.kind === "batal") return "Stok item akan dikembalikan.";
		return "Pesanan selesai dan tidak bisa diubah.";
	}

	if (occupancyQuery.isPending) {
		return (
			<main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-8">
				<p className="text-sm text-neutral-500">Memuat denah meja…</p>
			</main>
		);
	}

	return (
		<main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-8">
			<h1 className="text-2xl font-bold">Denah meja</h1>
			<fieldset className="mt-4">
				<legend className="sr-only">Pilih lantai</legend>
				<div className="flex gap-2 overflow-x-auto pb-1">
					{lantaiOptions.map((lantai) => (
						<button
							key={lantai}
							type="button"
							aria-pressed={activeLantai === lantai}
							onClick={() => setLantaiTab(lantai)}
							className={`shrink-0 rounded-full px-5 py-2 text-sm font-medium ${
								activeLantai === lantai
									? "bg-[#F97316]/15 text-[#F97316]"
									: "bg-neutral-200/70 text-neutral-500"
							}`}
						>
							{lantai}
						</button>
					))}
				</div>
			</fieldset>
			{loadError || actionError ? (
				<p
					role="alert"
					className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
				>
					{actionError ?? loadError}
				</p>
			) : null}
			{rows.length === 0 ? (
				<EmptyState
					variant="table"
					title="Belum ada meja"
					description="Tambahkan meja dari halaman admin sebelum memantau occupancy."
					size="lg"
					surface="solid"
					className="mt-6"
				/>
			) : visible.length === 0 ? (
				<p className="mt-8 text-sm text-neutral-500">
					Tidak ada meja di {activeLantai}.
				</p>
			) : (
				<div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
					{visible.map((row) => {
						const busy =
							setStatusMutation.isPending && actingId === row.orderId;
						const freeing =
							bebaskanMutation.isPending && freeingId === row.id;
						return (
							<div
								key={row.id}
								className={`flex flex-col items-center rounded-2xl border bg-white p-5 shadow-sm ${
									row.terisi ? "border-red-200" : "border-neutral-100"
								}`}
							>
								<span
									aria-hidden
									className={`mt-2 flex size-16 items-center justify-center rounded-full border-2 text-xl font-bold ${
										row.terisi
											? "border-red-400 bg-red-50 text-red-600"
											: "border-neutral-300 text-neutral-700"
									}`}
								>
									{shortLabel(row.nama)}
								</span>
								<p className="mt-2 text-sm font-semibold">{row.nama}</p>
								<span
									className={`mt-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
										row.terisi
											? "bg-red-100 text-red-700"
											: "bg-emerald-100 text-emerald-700"
									}`}
								>
									{row.terisi ? "Terisi" : "Kosong"}
								</span>
								{row.terisi ? (
									<div className="mt-2 flex flex-col items-center">
										{row.orderId !== null ? (
											<>
												<p className="text-xs text-neutral-500">
													Pesanan{" "}
													<Link
														to="/kasir/orders"
														search={{ orderId: String(row.orderId) }}
														className="font-bold text-[#EF7D1A] underline"
													>
														#{row.orderId}
													</Link>
												</p>
												<div className="mt-2 flex flex-wrap justify-center gap-2">
													<button
														type="button"
														disabled={busy}
														onClick={() =>
															setPending({
																kind: "selesai",
																orderId: row.orderId ?? 0,
															})
														}
														className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
													>
														Selesaikan
													</button>
													<button
														type="button"
														disabled={busy}
														onClick={() =>
															setPending({
																kind: "batal",
																orderId: row.orderId ?? 0,
															})
														}
														className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-50"
													>
														Batalkan
													</button>
												</div>
											</>
										) : (
											<p className="text-xs text-neutral-500">
												Tidak ada pesanan aktif
											</p>
										)}
										<button
											type="button"
											disabled={freeing}
											onClick={() =>
												setPending({
													kind: "bebas",
													mejaId: row.id,
													mejaNama: row.nama,
												})
											}
											title="Tamu sudah pergi, meja siap dipakai lagi"
											className="mt-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 disabled:opacity-50"
										>
											Bebaskan meja
										</button>
									</div>
								) : (
									<p className="mt-1 text-xs text-neutral-500">
										Siap terima pesanan
									</p>
								)}
							</div>
						);
					})}
				</div>
			)}
			<ConfirmModal
				open={pending !== null}
				title={pendingTitle()}
				message={pendingMessage()}
				busy={setStatusMutation.isPending || bebaskanMutation.isPending}
				onConfirm={confirmPending}
				onCancel={() => setPending(null)}
			/>
		</main>
	);
}
