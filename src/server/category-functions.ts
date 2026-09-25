import { Prisma } from "@prisma/client";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import { ensureAdmin } from "./guards";
import {
	parseCategoryInput,
	parseIdInput,
	parseUpdateCategoryInput,
} from "./validators";

function isUniqueConstraint(error: Error): boolean {
	return (
		error instanceof Prisma.PrismaClientKnownRequestError &&
		error.code === "P2002"
	);
}

export const listCategories = createServerFn({ method: "GET" }).handler(
	async () => {
		await ensureAdmin();
		return prisma.kategori.findMany({ orderBy: { namaKategori: "asc" } });
	},
);

export const createCategory = createServerFn({ method: "POST" })
	.validator(parseCategoryInput)
	.handler(async ({ data }) => {
		await ensureAdmin();
		try {
			return await prisma.kategori.create({ data });
		} catch (error) {
			if (error instanceof Error && isUniqueConstraint(error))
				throw new Error("Nama kategori sudah digunakan.");
			throw error;
		}
	});

export const updateCategory = createServerFn({ method: "POST" })
	.validator(parseUpdateCategoryInput)
	.handler(async ({ data }) => {
		await ensureAdmin();
		try {
			return await prisma.kategori.update({
				where: { id: data.id },
				data: { namaKategori: data.namaKategori },
			});
		} catch (error) {
			if (error instanceof Error && isUniqueConstraint(error))
				throw new Error("Nama kategori sudah digunakan.");
			throw error;
		}
	});

export const deleteCategory = createServerFn({ method: "POST" })
	.validator(parseIdInput)
	.handler(async ({ data }) => {
		await ensureAdmin();
		try {
			await prisma.kategori.delete({ where: { id: data.id } });
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === "P2003"
			)
				throw new Error(
					"Kategori tidak dapat dihapus karena masih dipakai produk.",
				);
			throw error;
		}
		return { id: data.id };
	});
