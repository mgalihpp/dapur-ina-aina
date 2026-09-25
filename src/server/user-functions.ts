import { Prisma } from "@prisma/client";
import { createServerFn } from "@tanstack/react-start";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureAdmin } from "./guards";
import {
	parseCreateUserInput,
	parseDeleteUserInput,
	parseUpdateUserInput,
} from "./validators";

function isUniqueConstraint(error: Error): boolean {
	return (
		error instanceof Prisma.PrismaClientKnownRequestError &&
		error.code === "P2002"
	);
}

export const listStaffUsers = createServerFn({ method: "GET" }).handler(
	async () => {
		await ensureAdmin();
		return prisma.user.findMany({
			select: {
				id: true,
				name: true,
				email: true,
				username: true,
				role: true,
				createdAt: true,
			},
			orderBy: [{ role: "asc" }, { name: "asc" }],
		});
	},
);

export const createStaffUser = createServerFn({ method: "POST" })
	.validator(parseCreateUserInput)
	.handler(async ({ data }) => {
		await ensureAdmin();
		const context = await auth.$context;
		const password = await context.password.hash(data.password);
		try {
			return await prisma.$transaction(async (tx) => {
				const user = await tx.user.create({
					data: {
						name: data.name,
						email: data.email,
						username: data.username,
						role: data.role,
						emailVerified: true,
					},
					select: {
						id: true,
						name: true,
						email: true,
						username: true,
						role: true,
						createdAt: true,
					},
				});
				await tx.account.create({
					data: {
						accountId: user.id,
						providerId: "credential",
						userId: user.id,
						password,
					},
				});
				return user;
			});
		} catch (error) {
			if (error instanceof Error && isUniqueConstraint(error))
				throw new Error("Email atau username sudah digunakan.");
			throw error;
		}
	});

export const updateStaffUser = createServerFn({ method: "POST" })
	.validator(parseUpdateUserInput)
	.handler(async ({ data }) => {
		const session = await ensureAdmin();
		const context = await auth.$context;
		const password = data.password
			? await context.password.hash(data.password)
			: null;
		try {
			return await prisma.$transaction(async (tx) => {
				await tx.$queryRaw`SELECT id FROM tb_user WHERE role = 'admin' FOR UPDATE`;
				const existing = await tx.user.findUnique({ where: { id: data.id } });
				if (!existing) throw new Error("Pengguna tidak ditemukan.");
				if (existing.id === session.user.id && data.role !== "admin")
					throw new Error("Anda tidak dapat mengubah peran akun sendiri.");
				if (existing.role === "admin" && data.role !== "admin") {
					const adminCount = await tx.user.count({ where: { role: "admin" } });
					if (adminCount <= 1)
						throw new Error("Admin terakhir tidak dapat diturunkan perannya.");
				}
				const updated = await tx.user.update({
					where: { id: data.id },
					data: {
						name: data.name,
						email: data.email,
						username: data.username,
						role: data.role,
					},
					select: {
						id: true,
						name: true,
						email: true,
						username: true,
						role: true,
						createdAt: true,
					},
				});
				if (existing.role !== data.role)
					await tx.session.deleteMany({ where: { userId: data.id } });
				if (password) {
					const account = await tx.account.findFirst({
						where: { userId: data.id, providerId: "credential" },
						select: { id: true },
					});
					if (account) {
						await tx.account.update({
							where: { id: account.id },
							data: { password },
						});
					} else {
						await tx.account.create({
							data: {
								accountId: data.id,
								providerId: "credential",
								userId: data.id,
								password,
							},
						});
					}
				}
				return updated;
			});
		} catch (error) {
			if (error instanceof Error && isUniqueConstraint(error))
				throw new Error("Email atau username sudah digunakan.");
			throw error;
		}
	});

export const deleteStaffUser = createServerFn({ method: "POST" })
	.validator(parseDeleteUserInput)
	.handler(async ({ data }) => {
		const session = await ensureAdmin();
		if (data.id === session.user.id)
			throw new Error("Anda tidak dapat menghapus akun sendiri.");
		try {
			await prisma.$transaction(async (tx) => {
				await tx.$queryRaw`SELECT id FROM tb_user WHERE role = 'admin' FOR UPDATE`;
				const user = await tx.user.findUnique({ where: { id: data.id } });
				if (!user) throw new Error("Pengguna tidak ditemukan.");
				if (user.role === "admin") {
					const adminCount = await tx.user.count({ where: { role: "admin" } });
					if (adminCount <= 1)
						throw new Error("Admin terakhir tidak dapat dihapus.");
				}
				const orderCount = await tx.pesanan.count({
					where: { userId: data.id },
				});
				if (orderCount > 0)
					throw new Error(
						"Pengguna memiliki riwayat pesanan dan tidak dapat dihapus.",
					);
				await tx.user.delete({ where: { id: data.id } });
			});
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === "P2003"
			)
				throw new Error(
					"Pengguna memiliki riwayat transaksi dan tidak dapat dihapus.",
				);
			throw error;
		}
		return { id: data.id };
	});
