import type { Prisma } from "@prisma/client";

export type MejaOccupancy = {
	id: number;
	nama: string;
	lantai: string;
	terisi: boolean;
	orderId: number | null;
};

type OccupancySource = {
	id: number;
	nama: string;
	lantai: string;
	terisi: boolean;
	pesanan: { id: number }[];
};

/**
 * Okupansi = flag eksplisit `terisi` di meja, BUKAN status pesanan.
 * Pesanan `selesai` tidak membebaskan meja; meja bebas hanya lewat aksi
 * eksplisit kasir/admin ("Bebaskan meja") saat tamu sudah pergi.
 */
export function toOccupancy(row: OccupancySource): MejaOccupancy {
	return {
		id: row.id,
		nama: row.nama,
		lantai: row.lantai,
		terisi: row.terisi,
		orderId: row.pesanan[0]?.id ?? null,
	};
}

export const mejaOccupancySelect = {
	id: true,
	nama: true,
	lantai: true,
	terisi: true,
	pesanan: {
		where: { status: "diproses" as const },
		select: { id: true },
		take: 1,
	},
} satisfies Prisma.MejaSelect;

/** Tandai meja terisi saat pesanan dibuat. Boleh banyak pesanan per meja. */
export async function markMejaTerisi(
	tx: Prisma.TransactionClient,
	mejaId: number,
): Promise<void> {
	const meja = await tx.meja.update({
		where: { id: mejaId },
		data: { terisi: true },
		select: { id: true },
	});
	if (!meja) throw new Error("Meja tidak ditemukan.");
}
