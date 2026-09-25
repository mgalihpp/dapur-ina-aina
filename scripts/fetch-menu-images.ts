/**
 * Unduh foto menu Indonesia dari Wikimedia Commons ke public/menu/.
 * Dijalankan sekali: `bun scripts/fetch-menu-images.ts`
 * Sumber foto: Wikimedia Commons (lisensi bebas, atribusi di MENU_IMAGE_CREDITS).
 */
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "menu");

export const MENU_IMAGES: { slug: string; query: string }[] = [
	{ slug: "nasi-goreng-spesial", query: "Nasi goreng fried rice Indonesia" },
	{ slug: "rendang-sapi", query: "Rendang beef Indonesian food" },
	{
		slug: "ayam-goreng-lalapan",
		query: "Ayam goreng fried chicken Indonesian",
	},
	{ slug: "sate-ayam", query: "Sate ayam satay Indonesian food" },
	{ slug: "gulai-ayam", query: "Gulai ayam Indonesian curry" },
	{ slug: "sop-buntut", query: "Sop buntut oxtail soup Indonesian" },
	{ slug: "tempe-mendoan", query: "Tempe mendoan Indonesian food" },
	{ slug: "tahu-gejrot", query: "Tahu gejrot Indonesian food" },
	{ slug: "pisang-goreng", query: "Pisang goreng fried banana Indonesian" },
	{ slug: "lumpia-semarang", query: "Lumpia Semarang spring roll Indonesian" },
	{ slug: "es-teh-manis", query: "iced tea glass" },
	{ slug: "es-jeruk", query: "orange juice glass" },
	{ slug: "jus-alpukat", query: "avocado juice" },
	{ slug: "kopi-tubruk", query: "black coffee cup" },
	{ slug: "es-cendol", query: "cendol dawet" },
];

const UA = "dapur-ina-aina/1.0 (seed-script; contact: admin@dapurinaaina.id)";

type CommonsResponse = {
	query?: {
		pages?: Record<
			string,
			{
				title?: string;
				imageinfo?: { thumburl?: string; url?: string }[];
			}
		>;
	};
};

async function findImageUrl(query: string): Promise<string> {
	const params = new URLSearchParams({
		action: "query",
		format: "json",
		generator: "search",
		gsrsearch: `${query} filetype:bitmap`,
		gsrnamespace: "6",
		gsrlimit: "8",
		prop: "imageinfo",
		iiprop: "url|size",
		iiurlwidth: "800",
	});
	const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
		headers: { "User-Agent": UA },
	});
	if (!res.ok) throw new Error(`Commons API ${res.status} untuk "${query}"`);
	const json = (await res.json()) as CommonsResponse;
	const pages = Object.values(json.query?.pages ?? {});
	for (const page of pages) {
		const info = page.imageinfo?.[0];
		const raw = info?.thumburl ?? info?.url;
		if (raw) return raw.split("?")[0];
	}
	throw new Error(`Tidak ada foto untuk "${query}"`);
}

async function main(): Promise<void> {
	await mkdir(OUT_DIR, { recursive: true });
	const creditsFile = join(OUT_DIR, "credits.json");
	const credits: Record<string, string> = await Bun.file(creditsFile)
		.json()
		.catch(() => ({}));
	for (const { slug, query } of MENU_IMAGES) {
		const jpg = join(OUT_DIR, `${slug}.jpg`);
		const png = join(OUT_DIR, `${slug}.png`);
		if (
			await Bun.file(jpg)
				.exists()
				.catch(() => false)
		) {
			console.log(`SKIP public/menu/${slug}.jpg (sudah ada)`);
			continue;
		}
		if (
			await Bun.file(png)
				.exists()
				.catch(() => false)
		) {
			console.log(`SKIP public/menu/${slug}.png (sudah ada)`);
			continue;
		}
		const url = await findImageUrl(query);
		const res = await fetch(url, { headers: { "User-Agent": UA } });
		if (!res.ok) throw new Error(`Unduh gagal ${res.status}: ${url}`);
		const bytes = new Uint8Array(await res.arrayBuffer());
		const ext = url.endsWith(".png") ? "png" : "jpg";
		const file = `${slug}.${ext}`;
		await Bun.write(join(OUT_DIR, file), bytes);
		credits[`${slug}`] = url;
		console.log(
			`OK public/menu/${file} (${(bytes.length / 1024).toFixed(0)} KB)`,
		);
	}
	await Bun.write(
		join(OUT_DIR, "credits.json"),
		`${JSON.stringify(credits, null, 2)}\n`,
	);
	console.log("Atribusi tersimpan di public/menu/credits.json");
}

main().catch((error: unknown) => {
	console.error(error);
	process.exitCode = 1;
});
