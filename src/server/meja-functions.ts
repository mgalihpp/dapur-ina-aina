import { Prisma } from "@prisma/client";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import { ensureAdmin, ensureStaff } from "./guards";
import { occupancyInclude, toOccupancy } from "./meja-occupancy";
import {
	parseIdInput,
	parseMejaInput,
	parseUpdateMejaInput,
} from "./validators";

function isUniqueConstraint(error: Error): boolean {
	return (
		error instanceof Prisma.PrismaClientKnownRequestError &&
		error.code === "P2002"
	);
}

export const listMeja = createServerFn({ method: "GET" }).handler(async () => {
	await ensureAdmin();
	return prisma.meja.findMany({
		orderBy: [{ lantai: "asc" }, { nama: "asc" }],
	});
});

export const listMejaOccupancy = createServerFn({ method: "GET" }).handler(
	async () => {
		await ensureStaff();
		const rows = await prisma.meja.findMany({
			orderBy: [{ lantai: "asc" }, { nama: "asc" }],
			select: {
				id: true,
				nama: true,
				lantai: true,
				pesanan: occupancyInclude.pesanan,
			},
		});
		return rows.map(toOccupancy);
	},
);

export const createMeja = createServerFn({ method: "POST" })
	.validator(parseMejaInput)
	.handler(async ({ data }) => {
		await ensureAdmin();
		try {
			return await prisma.meja.create({ data });
		} catch (error) {
			if (error instanceof Error && isUniqueConstraint(error))
				throw new Error("Nama meja sudah digunakan.");
			throw error;
		}
	});

export const renameMeja = createServerFn({ method: "POST" })
	.validator(parseUpdateMejaInput)
	.handler(async ({ data }) => {
		await ensureAdmin();
		try {
			return await prisma.meja.update({
				where: { id: data.id },
				data: { nama: data.nama, lantai: data.lantai },
			});
		} catch (error) {
			if (error instanceof Error && isUniqueConstraint(error))
				throw new Error("Nama meja sudah digunakan.");
			throw error;
		}
	});

export const deleteMeja = createServerFn({ method: "POST" })
	.validator(parseIdInput)
	.handler(async ({ data }) => {
		await ensureAdmin();
		await prisma.meja.delete({ where: { id: data.id } });
		return { id: data.id };
	});
