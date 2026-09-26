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
	pesanan: { id: number }[];
};

export function toOccupancy(row: OccupancySource): MejaOccupancy {
	const orderId = row.pesanan[0]?.id ?? null;
	return {
		id: row.id,
		nama: row.nama,
		lantai: row.lantai,
		terisi: orderId !== null,
		orderId,
	};
}

export const occupancyInclude = {
	pesanan: {
		where: { status: "diproses" as const },
		select: { id: true },
		take: 1,
	},
} satisfies Prisma.MejaInclude;

export async function assertMejaFree(
	tx: Prisma.TransactionClient,
	mejaId: number,
): Promise<void> {
	const meja = await tx.meja.findUnique({
		where: { id: mejaId },
		select: { id: true },
	});
	if (!meja) throw new Error("Meja tidak ditemukan.");
	const clash = await tx.$queryRaw<{ id: number }[]>`
		SELECT id FROM tb_pesanan
		WHERE mejaId = ${mejaId} AND status = 'diproses'
		LIMIT 1
		FOR UPDATE
	`;
	if (clash.length > 0) throw new Error("Meja sudah terisi.");
}
