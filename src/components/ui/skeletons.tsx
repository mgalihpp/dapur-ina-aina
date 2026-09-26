import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function Shimmer({ className }: { className?: string }) {
	return <Skeleton className={cn("rounded-xl", className)} />;
}

/** Mirip MenuCard: gambar 4/3 + nama + kategori + harga + tombol. */
export function MenuCardSkeleton() {
	return (
		<div className="flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
			<Shimmer className="aspect-[4/3] w-full rounded-none" />
			<div className="flex flex-1 flex-col p-3">
				<Shimmer className="h-4 w-3/4" />
				<Shimmer className="mt-1.5 h-3 w-1/3" />
				<div className="mt-2 flex items-center justify-between gap-2">
					<Shimmer className="h-4 w-20" />
					<Shimmer className="h-3 w-12" />
				</div>
				<Shimmer className="mt-3 h-10 w-full !rounded-xl" />
			</div>
		</div>
	);
}

/** Mirip PublicMenuView: header + search + pills + grid 2/3/4 kolom. */
export function PublicMenuSkeleton({ count = 8 }: { count?: number }) {
	return (
		<div aria-busy="true" aria-label="Memuat menu">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<Shimmer className="h-7 w-36" />
				<Shimmer className="h-10 w-full max-w-xs !rounded-lg" />
			</div>
			<div className="mt-4 flex gap-2 overflow-hidden pb-1">
				{["w-20", "w-24", "w-20", "w-28", "w-24"].map((w) => (
					<Shimmer key={w + Math.random()} className={`h-9 shrink-0 ${w} !rounded-full`} />
				))}
			</div>
			<div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
				{Array.from({ length: count }).map((_, i) => (
					<MenuCardSkeleton key={i} />
				))}
			</div>
		</div>
	);
}

/** Mirip PublicOrderSummary aside. */
export function OrderSummarySkeleton() {
	return (
		<aside className="h-fit rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-sm">
			<div className="flex items-start justify-between gap-4">
				<div className="w-full">
					<Shimmer className="h-3 w-10" />
					<Shimmer className="mt-2 h-5 w-24" />
				</div>
				<div className="w-full text-right">
					<Shimmer className="ml-auto h-3 w-10" />
					<Shimmer className="ml-auto mt-2 h-5 w-12" />
				</div>
			</div>
			<div className="mt-5 border-t border-[var(--line)] pt-4">
				<div className="flex items-center justify-between">
					<Shimmer className="h-5 w-32" />
					<Shimmer className="h-4 w-14" />
				</div>
				<div className="mt-4 space-y-3">
					{[0, 1, 2].map((i) => (
						<div key={i} className="flex items-center justify-between gap-3">
							<div className="flex min-w-0 items-center gap-2">
								<Shimmer className="h-9 w-9 shrink-0 !rounded-lg" />
								<Shimmer className="h-4 w-28" />
							</div>
							<Shimmer className="h-4 w-14" />
						</div>
					))}
				</div>
				<div className="mt-4 flex justify-between border-t border-[var(--line)] pt-4">
					<Shimmer className="h-5 w-12" />
					<Shimmer className="h-5 w-24" />
				</div>
			</div>
			<Shimmer className="mt-5 h-12 w-full !rounded-xl" />
		</aside>
	);
}

/** Mirip KasirDashboardView: 2 kartu stat + section stok + tombol. */
export function KasirDashboardSkeleton() {
	return (
		<div aria-busy="true" aria-label="Memuat dasbor kasir">
			<Shimmer className="h-7 w-40" />
			<div className="mt-5 grid gap-4 sm:grid-cols-2">
				{[0, 1].map((i) => (
					<div key={i} className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
						<Shimmer className="h-4 w-40" />
						<Shimmer className="mt-3 h-9 w-16" />
					</div>
				))}
			</div>
			<div className="mt-6 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
				<div className="flex items-center justify-between gap-3">
					<Shimmer className="h-5 w-36" />
					<Shimmer className="h-5 w-24" />
				</div>
				<div className="mt-3 divide-y divide-neutral-100">
					{[0, 1, 2].map((i) => (
						<div key={i} className="flex justify-between gap-3 py-3">
							<Shimmer className="h-4 w-40" />
							<Shimmer className="h-4 w-20" />
						</div>
					))}
				</div>
			</div>
			<Shimmer className="mt-6 h-11 w-36 !rounded-xl" />
		</div>
	);
}

/** Mirip satu baris daftar pesanan (kartu abu + badge + total). */
export function OrderListSkeleton({ count = 5 }: { count?: number }) {
	return (
		<div aria-busy="true" aria-label="Memuat transaksi" className="space-y-2">
			{Array.from({ length: count }).map((_, i) => (
				<div key={i} className="rounded-xl bg-neutral-50 p-3">
					<div className="flex items-center justify-between gap-2">
						<Shimmer className="h-4 w-32" />
						<Shimmer className="h-5 w-20 !rounded-full" />
					</div>
					<div className="mt-2 flex items-center gap-1.5">
						<Shimmer className="h-4 w-28" />
						<Shimmer className="h-5 w-20 !rounded-full" />
						<Shimmer className="h-5 w-16 !rounded-full" />
					</div>
					<div className="mt-2 flex items-center justify-between gap-2">
						<Shimmer className="h-3 w-24" />
						<Shimmer className="h-4 w-20" />
					</div>
				</div>
			))}
		</div>
	);
}

/** Mirip panel detail pesanan kanan: header + dl 4 kolom + tabel item + pembayaran. */
export function OrderDetailSkeleton() {
	return (
		<div aria-busy="true" aria-label="Memuat detail pesanan">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="w-full">
					<div className="flex flex-wrap items-center gap-2">
						<Shimmer className="h-6 w-44" />
						<Shimmer className="h-5 w-16 !rounded-full" />
						<Shimmer className="h-5 w-20 !rounded-full" />
					</div>
					<Shimmer className="mt-2 h-4 w-56" />
				</div>
			</div>
			<div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-neutral-50 p-4 sm:grid-cols-4">
				{[0, 1, 2, 3].map((i) => (
					<div key={i}>
						<Shimmer className="h-3 w-12" />
						<Shimmer className="mt-2 h-4 w-20" />
					</div>
				))}
			</div>
			<Shimmer className="mt-5 h-5 w-28" />
			<div className="mt-2 space-y-2">
				{[0, 1, 2].map((i) => (
					<div key={i} className="flex justify-between gap-2 py-2">
						<Shimmer className="h-4 w-32" />
						<Shimmer className="h-4 w-40" />
					</div>
				))}
			</div>
			<div className="mt-3 rounded-xl border border-neutral-200 p-4">
				<div className="flex items-center justify-between">
					<Shimmer className="h-5 w-28" />
					<Shimmer className="h-5 w-20 !rounded-full" />
				</div>
				<div className="mt-3 space-y-2">
					<Shimmer className="h-4 w-full" />
					<Shimmer className="h-4 w-full" />
					<Shimmer className="h-4 w-2/3" />
				</div>
				<Shimmer className="mt-4 h-11 w-full !rounded-xl" />
			</div>
		</div>
	);
}

/** Mirip ReportsView: 3 kartu stat + list tersimpan + tabel detail. */
export function ReportsSkeleton() {
	return (
		<div aria-busy="true" aria-label="Memuat laporan">
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				{[0, 1, 2].map((i) => (
					<div key={i} className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
						<Shimmer className="size-11 shrink-0 !rounded-xl" />
						<div className="w-full">
							<Shimmer className="h-3 w-24" />
							<Shimmer className="mt-2 h-5 w-32" />
						</div>
					</div>
				))}
			</div>
			<div className="mt-5 grid grid-cols-1 items-start gap-5 xl:grid-cols-[380px_1fr]">
				<div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
					<Shimmer className="h-12 w-full rounded-none border-b border-neutral-100" />
					<div className="space-y-2 p-3">
						{[0, 1, 2, 3].map((i) => (
							<Shimmer key={i} className="h-14 w-full" />
						))}
					</div>
				</div>
				<div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
					<div className="flex items-center gap-3 border-b border-neutral-100 px-5 py-4">
						<Shimmer className="size-10 shrink-0 !rounded-xl" />
						<div className="w-full">
							<Shimmer className="h-5 w-48" />
							<Shimmer className="mt-1.5 h-3 w-28" />
						</div>
					</div>
					<div className="space-y-2 p-5">
						{[0, 1, 2, 3, 4].map((i) => (
							<Shimmer key={i} className="h-10 w-full" />
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

/** Mirip AdminDashboard: 2 kartu income/balance + chart + best dishes. */
export function AdminDashboardSkeleton() {
	return (
		<div aria-busy="true" aria-label="Memuat dasbor" className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
			{[0, 1, 2, 3].map((i) => (
				<div key={i} className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
					<div className="flex items-center justify-between">
						<Shimmer className="h-4 w-32" />
						<Shimmer className="h-4 w-4 !rounded-full" />
					</div>
					<Shimmer className="mt-3 h-8 w-40" />
					<Shimmer className="mt-3 h-32 w-full" />
					<div className="mt-3 space-y-2">
						<Shimmer className="h-3 w-full" />
						<Shimmer className="h-3 w-5/6" />
					</div>
				</div>
			))}
		</div>
	);
}

/** Mirip ProductTable: baris foto + nama + kategori + harga + stok + aksi. */
export function ProductTableSkeleton({ count = 6 }: { count?: number }) {
	return (
		<div aria-busy="true" aria-label="Memuat menu" className="divide-y divide-neutral-100">
			{Array.from({ length: count }).map((_, i) => (
				<div key={i} className="flex items-center gap-4 px-4 py-3">
					<Shimmer className="size-11 shrink-0 !rounded-xl" />
					<div className="min-w-0 flex-1">
						<Shimmer className="h-4 w-40" />
						<Shimmer className="mt-1.5 h-3 w-24" />
					</div>
					<Shimmer className="hidden h-4 w-20 sm:block" />
					<Shimmer className="hidden h-4 w-16 md:block" />
					<div className="flex shrink-0 gap-2">
						<Shimmer className="h-8 w-16 !rounded-lg" />
						<Shimmer className="h-8 w-16 !rounded-lg" />
					</div>
				</div>
			))}
		</div>
	);
}

/** Mirip grid meja (kartu meja + badge lantai). */
export function MejaGridSkeleton({ count = 8 }: { count?: number }) {
	return (
		<div aria-busy="true" aria-label="Memuat meja" className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
			{Array.from({ length: count }).map((_, i) => (
				<div key={i} className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<Shimmer className="h-5 w-20" />
						<Shimmer className="h-5 w-16 !rounded-full" />
					</div>
					<Shimmer className="mt-3 h-3 w-24" />
					<Shimmer className="mt-4 h-10 w-full !rounded-xl" />
				</div>
			))}
		</div>
	);
}

/** Mirip keranjang / pembayaran: baris item + total + tombol bayar. */
export function CartSkeleton({ count = 3 }: { count?: number }) {
	return (
		<div aria-busy="true" aria-label="Memuat keranjang" className="space-y-3">
			{Array.from({ length: count }).map((_, i) => (
				<div key={i} className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm">
					<Shimmer className="size-14 shrink-0 !rounded-xl" />
					<div className="min-w-0 flex-1">
						<Shimmer className="h-4 w-3/4" />
						<Shimmer className="mt-1.5 h-3 w-1/3" />
					</div>
					<Shimmer className="h-9 w-24 !rounded-xl" />
				</div>
			))}
			<div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
				<div className="flex justify-between">
					<Shimmer className="h-5 w-16" />
					<Shimmer className="h-5 w-28" />
				</div>
				<Shimmer className="mt-4 h-12 w-full !rounded-xl" />
			</div>
		</div>
	);
}

/** Mirip isi daftar meja publik: pill lantai + grid ilustrasi MejaPlan. */
export function PublicMejaSkeleton({ count = 6 }: { count?: number }) {
	return (
		<div aria-busy="true" aria-label="Memuat meja">
			<div className="flex gap-2 overflow-hidden pb-1">
				<Shimmer className="h-9 w-24 shrink-0 !rounded-full" />
				<Shimmer className="h-9 w-24 shrink-0 !rounded-full" />
			</div>
			<div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3">
				{Array.from({ length: count }).map((_, i) => (
					<div key={i} className="flex flex-col items-center">
						<div className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-2xl bg-neutral-50">
							<Shimmer className="absolute top-1 left-1/2 h-7 w-10 -translate-x-1/2 !rounded-md" />
							<Shimmer className="absolute bottom-1 left-1/2 h-7 w-10 -translate-x-1/2 !rounded-md" />
							<Shimmer className="absolute top-1/2 left-1 h-10 w-7 -translate-y-1/2 !rounded-md" />
							<Shimmer className="absolute top-1/2 right-1 h-10 w-7 -translate-y-1/2 !rounded-md" />
							<Shimmer className="h-20 w-20 !rounded-full" />
						</div>
						<Shimmer className="mt-2 h-4 w-16" />
						<Shimmer className="mt-1.5 h-5 w-16 !rounded-full" />
						<div className="mt-2 flex items-center gap-3">
							<Shimmer className="size-7 !rounded-full" />
							<Shimmer className="h-4 w-5" />
							<Shimmer className="size-7 !rounded-full" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

/** Mirip kartu pesanan tamu: ikon + badge + tanggal + total. */
export function GuestOrdersSkeleton({ count = 6 }: { count?: number }) {
	return (
		<div aria-busy="true" aria-label="Memuat pesanan">
			<Shimmer className="h-9 w-40" />
			<ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{Array.from({ length: count }).map((_, i) => (
					<li key={i} className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
						<div className="flex items-start justify-between gap-4 border-b border-neutral-100 p-5">
							<div className="flex items-start gap-3">
								<Shimmer className="h-11 w-11 shrink-0 !rounded-xl" />
								<Shimmer className="mt-2 h-5 w-28" />
							</div>
							<Shimmer className="h-6 w-24 !rounded-full" />
						</div>
						<div className="p-5">
							<div className="space-y-3">
								<Shimmer className="h-4 w-40" />
								<Shimmer className="h-4 w-28" />
							</div>
							<div className="mt-5 flex items-end justify-between gap-4 border-t border-neutral-100 pt-5">
								<div>
									<Shimmer className="h-3 w-10" />
									<Shimmer className="mt-2 h-6 w-28" />
								</div>
								<Shimmer className="size-9 !rounded-full" />
							</div>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}

/** Mirip detail pesanan tamu: header + grid info + tabel item + total. */
export function OrderReceiptSkeleton() {
	return (
		<div aria-busy="true" aria-label="Memuat pesanan" className="mx-auto w-full max-w-3xl">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<Shimmer className="h-7 w-44" />
					<div className="mt-3 flex gap-5">
						<Shimmer className="h-4 w-40" />
						<Shimmer className="h-4 w-40" />
					</div>
				</div>
				<Shimmer className="h-9 w-32 !rounded-lg" />
			</div>
			<div className="mt-5 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
				<div className="grid grid-cols-2 gap-4 border-b border-neutral-100 pb-4">
					{[0, 1, 2, 3].map((i) => (
						<div key={i}>
							<Shimmer className="h-3 w-14" />
							<Shimmer className="mt-2 h-4 w-24" />
						</div>
					))}
				</div>
				<div className="mt-2 space-y-2">
					{[0, 1, 2].map((i) => (
						<div key={i} className="flex justify-between gap-2 py-2">
							<Shimmer className="h-4 w-32" />
							<Shimmer className="h-4 w-44" />
						</div>
					))}
				</div>
				<div className="mt-3 flex justify-between border-t border-neutral-100 pt-4">
					<Shimmer className="h-5 w-12" />
					<Shimmer className="h-5 w-28" />
				</div>
			</div>
			<div className="mt-4 flex gap-4">
				<Shimmer className="h-11 w-36 !rounded-xl" />
				<Shimmer className="h-11 w-24" />
			</div>
		</div>
	);
}

/** Mirip halaman pembayaran: 2 kartu metode + daftar item. */
export function PaymentSkeleton({ count = 3 }: { count?: number }) {
	return (
		<div aria-busy="true" aria-label="Memuat pembayaran">
			<div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm sm:p-5">
				<Shimmer className="h-4 w-36" />
				<div className="mt-3 grid gap-3 sm:grid-cols-2">
					{[0, 1].map((i) => (
						<div key={i} className="rounded-xl border border-neutral-200 p-4">
							<Shimmer className="h-5 w-20" />
							<Shimmer className="mt-2 h-3 w-full" />
							<Shimmer className="mt-1.5 h-3 w-2/3" />
						</div>
					))}
				</div>
			</div>
			<div className="mt-6 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm sm:p-5">
				<Shimmer className="h-5 w-28" />
				<div className="mt-3 divide-y divide-neutral-100">
					{Array.from({ length: count }).map((_, i) => (
						<div key={i} className="flex items-center justify-between gap-4 py-3">
							<div className="flex min-w-0 items-center gap-3">
								<Shimmer className="h-12 w-12 shrink-0 !rounded-lg" />
								<Shimmer className="h-4 w-32" />
							</div>
							<div className="shrink-0 text-right">
								<Shimmer className="ml-auto h-3 w-20" />
								<Shimmer className="ml-auto mt-1.5 h-4 w-24" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

/** Baris kecil untuk aside ringkasan saat store belum hydrate. */
export function OrderSummaryLinesSkeleton({ count = 3 }: { count?: number }) {
	return (
		<div aria-busy="true" aria-label="Memuat pesanan" className="mt-4 space-y-3">
			{Array.from({ length: count }).map((_, i) => (
				<div key={i} className="flex items-center justify-between gap-3">
					<div className="flex min-w-0 items-center gap-2">
						<Shimmer className="h-9 w-9 shrink-0 !rounded-lg" />
						<Shimmer className="h-4 w-28" />
					</div>
					<Shimmer className="h-4 w-14" />
				</div>
			))}
		</div>
	);
}

/** Mirip denah meja kasir: pill lantai + grid kartu lingkaran. */
export function KasirMejaSkeleton({ count = 8 }: { count?: number }) {
	return (
		<main aria-busy="true" aria-label="Memuat denah meja" className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-8">
			<Shimmer className="h-7 w-36" />
			<div className="mt-4 flex gap-2 overflow-hidden pb-1">
				<Shimmer className="h-9 w-24 shrink-0 !rounded-full" />
				<Shimmer className="h-9 w-24 shrink-0 !rounded-full" />
				<Shimmer className="h-9 w-24 shrink-0 !rounded-full" />
			</div>
			<div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
				{Array.from({ length: count }).map((_, i) => (
					<div key={i} className="flex flex-col items-center rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
						<Shimmer className="size-16 !rounded-full" />
						<Shimmer className="mt-2 h-4 w-16" />
						<Shimmer className="mt-1.5 h-5 w-16 !rounded-full" />
						<Shimmer className="mt-3 h-8 w-28 !rounded-lg" />
					</div>
				))}
			</div>
		</main>
	);
}

/** Mirip form tambah/ubah menu: gambar + field + tombol. */
export function ProductFormSkeleton() {
	return (
		<div aria-busy="true" aria-label="Memuat form menu" className="mx-auto w-full max-w-[1440px] px-4 py-6">
			<Shimmer className="h-9 w-9 !rounded-lg" />
			<Shimmer className="mt-4 h-7 w-44" />
			<div className="mt-4 grid gap-5 lg:grid-cols-[360px_1fr]">
				<div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
					<Shimmer className="aspect-[4/3] w-full !rounded-xl" />
					<Shimmer className="mt-3 h-10 w-full !rounded-xl" />
				</div>
				<div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
					<div className="grid gap-4 sm:grid-cols-2">
						{[0, 1, 2, 3, 4, 5].map((i) => (
							<div key={i} className={i < 2 ? "sm:col-span-2" : ""}>
								<Shimmer className="h-3 w-20" />
								<Shimmer className="mt-2 h-10 w-full !rounded-lg" />
							</div>
						))}
					</div>
					<div className="mt-5 flex justify-end gap-2">
						<Shimmer className="h-10 w-24 !rounded-lg" />
						<Shimmer className="h-10 w-32 !rounded-lg" />
					</div>
				</div>
			</div>
		</div>
	);
}

/** Mirip tabel detail laporan: header gradient + baris pesanan. */
export function ReportDetailSkeleton({ count = 5 }: { count?: number }) {
	return (
		<div aria-busy="true" aria-label="Memuat detail laporan">
			<div className="flex items-center gap-3 border-b border-neutral-100 px-5 py-4">
				<Shimmer className="size-10 shrink-0 !rounded-xl" />
				<div className="w-full">
					<Shimmer className="h-5 w-48" />
					<Shimmer className="mt-1.5 h-3 w-28" />
				</div>
				<Shimmer className="h-9 w-32 !rounded-xl" />
			</div>
			<div className="space-y-2 p-5">
				{Array.from({ length: count }).map((_, i) => (
					<Shimmer key={i} className="h-10 w-full" />
				))}
			</div>
		</div>
	);
}

/** Mirip 3 kartu stat laporan. */
export function ReportStatsSkeleton() {
	return (
		<div aria-busy="true" aria-label="Memuat ringkasan" className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
			{[0, 1, 2].map((i) => (
				<div key={i} className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
					<Shimmer className="size-11 shrink-0 !rounded-xl" />
					<div className="w-full">
						<Shimmer className="h-3 w-24" />
						<Shimmer className="mt-2 h-5 w-32" />
					</div>
				</div>
			))}
		</div>
	);
}

/** Mirip baris tabel user: avatar + nama + badge peran + aksi. */
export function UserRowsSkeleton({ count = 4 }: { count?: number }) {
	return (
		<div aria-busy="true" aria-label="Memuat pengguna" className="space-y-2 px-6 py-2">
			{Array.from({ length: count }).map((_, i) => (
				<div key={i} className="flex items-center gap-3 rounded-xl border border-neutral-100 px-3 py-2.5">
					<Shimmer className="size-10 shrink-0 !rounded-full" />
					<div className="min-w-0 flex-1">
						<Shimmer className="h-4 w-40" />
						<Shimmer className="mt-1.5 h-3 w-52" />
					</div>
					<Shimmer className="hidden h-6 w-16 !rounded-full sm:block" />
					<Shimmer className="h-8 w-8 !rounded-lg" />
					<Shimmer className="h-8 w-8 !rounded-lg" />
				</div>
			))}
		</div>
	);
}

/** Mirip baris tabel meja/kategori: nama + badge + aksi. */
export function SimpleRowsSkeleton({ count = 4 }: { count?: number }) {
	return (
		<div aria-busy="true" aria-label="Memuat data" className="space-y-2 px-6 py-2">
			{Array.from({ length: count }).map((_, i) => (
				<div key={i} className="flex items-center gap-3 rounded-xl border border-neutral-100 px-3 py-2.5">
					<div className="min-w-0 flex-1">
						<Shimmer className="h-4 w-36" />
						<Shimmer className="mt-1.5 h-3 w-24" />
					</div>
					<Shimmer className="hidden h-6 w-20 !rounded-full sm:block" />
					<Shimmer className="h-8 w-8 !rounded-lg" />
					<Shimmer className="h-8 w-8 !rounded-lg" />
				</div>
			))}
		</div>
	);
}
