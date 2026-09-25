import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

const CATEGORIES = ["Makanan Utama", "Appetizer", "Minuman"];

const ADMIN_EMAIL = process.env["ADMIN_EMAIL"] ?? "admin@dapurinaaina.id";
const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] ?? "InaAina123!";

async function seedCategories(): Promise<void> {
	for (const namaKategori of CATEGORIES) {
		const existing = await prisma.kategori.findFirst({
			where: { namaKategori },
		});
		if (!existing) {
			await prisma.kategori.create({ data: { namaKategori } });
			console.log(`category created: ${namaKategori}`);
		}
	}
}

async function seedAdmin(): Promise<void> {
	const existing = await prisma.user.findUnique({
		where: { email: ADMIN_EMAIL },
	});
	if (!existing) {
		await auth.api.signUpEmail({
			body: {
				name: "Administrator",
				email: ADMIN_EMAIL,
				password: ADMIN_PASSWORD,
			},
		});
		console.log(`admin signed up: ${ADMIN_EMAIL}`);
	}
	await prisma.user.update({
		where: { email: ADMIN_EMAIL },
		data: { username: "admin", role: "admin" },
	});
	console.log(`admin promoted: ${ADMIN_EMAIL}`);
}

async function main(): Promise<void> {
	await seedCategories();
	await seedAdmin();
	if (!process.env["ADMIN_PASSWORD"]) {
		console.warn(
			"Seed used the default admin password. Change it right after deploy.",
		);
	}
}

main()
	.catch((error: unknown) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => {
		void prisma.$disconnect();
	});
