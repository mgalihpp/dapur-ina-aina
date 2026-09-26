import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSetOrderStatus } from "@/features/orders/mutations";
import { EmptyState } from "@/features/shared/components/EmptyState";
import { mutationErrorMessage, queryErrorMessage } from "@/lib/query-errors";
import { kasirMejaOccupancyOptions } from "../queries";

export function MejaKasirView() {
	const occupancyQuery = useQuery(kasirMejaOccupancyOptions);
	const rows = occupancyQuery.data ?? [];
	const setStatusMutation = useSetOrderStatus();
	const [actingId, setActingId] = useState<number | null>(null);
	const loadError = occupancyQuery.isError
		? queryErrorMessage(occupancyQuery.error, "Gagal memuat denah meja.")
		: null;
	const actionError = setStatusMutation.isError
		? mutationErrorMessage(setStatusMutation.error, "Aksi tidak berhasil.")
		: null;

	function changeStatus(orderId: number, status: "selesai" | "dibatalkan") {
		setActingId(orderId);
		setStatusMutation.mutate(
			{ id: orderId, status },
			{ onSettled: () => setActingId(null) },
		);
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
			) : (
				<ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{rows.map((row) => {
						const busy =
							setStatusMutation.isPending && actingId === row.orderId;
						return (
							<li
								key={row.id}
								className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm"
							>
								<div className="flex items-center justify-between gap-3">
									<div>
										<p className="font-bold">{row.nama}</p>
										<p className="mt-0.5 text-xs text-neutral-500">
											{row.lantai}
										</p>
									</div>
									<span
										className={`rounded-full px-2.5 py-1 text-xs font-bold ${
											row.terisi
												? "bg-red-100 text-red-700"
												: "bg-emerald-100 text-emerald-700"
										}`}
									>
										{row.terisi ? "Terisi" : "Kosong"}
									</span>
								</div>
								{row.terisi && row.orderId !== null ? (
									<div className="mt-4">
										<p className="text-sm text-neutral-600">
											Pesanan{" "}
											<Link
												to="/kasir/orders"
												search={{ orderId: String(row.orderId) }}
												className="font-bold text-[#EF7D1A] underline"
											>
												#{row.orderId}
											</Link>
										</p>
										<div className="mt-3 flex flex-wrap gap-2">
											<button
												type="button"
												disabled={busy}
												onClick={() =>
													changeStatus(row.orderId ?? 0, "selesai")
												}
												className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
											>
												Selesaikan
											</button>
											<button
												type="button"
												disabled={busy}
												onClick={() =>
													changeStatus(row.orderId ?? 0, "dibatalkan")
												}
												className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
											>
												Batalkan
											</button>
										</div>
									</div>
								) : (
									<p className="mt-4 text-sm text-neutral-500">
										Siap menerima pesanan baru.
									</p>
								)}
							</li>
						);
					})}
				</ul>
			)}
		</main>
	);
}
