import { EmptyState } from "@/features/shared/components/EmptyState";

export function DashboardEmpty() {
	return (
		<EmptyState
			variant="sales"
			title="Belum ada penjualan pada periode ini"
			description="Penjualan yang selesai dan lunas akan muncul di sini setelah periode dipilih."
			size="lg"
			surface="solid"
			className="mt-6"
		/>
	);
}
