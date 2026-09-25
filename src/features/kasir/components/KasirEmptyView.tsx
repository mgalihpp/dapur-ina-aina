import { KasirSidebar } from "./KasirSidebar";

export function KasirEmptyView() {
	return (
		<div className="flex min-h-dvh bg-[#F5F6F8] text-neutral-900">
			<KasirSidebar />

			<div className="min-w-0 flex-1 px-4 py-6 sm:px-8">
				<div className="mx-auto flex min-h-[600px] w-full max-w-[1440px] items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white shadow-sm">
					<p className="text-sm text-neutral-400">Kasir — segera hadir</p>
				</div>
			</div>
		</div>
	);
}
