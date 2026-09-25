import { createFileRoute } from "@tanstack/react-router";
import { PublicPembayaranView } from "@/features/public/components/PublicPembayaranView";
import { PublicShell } from "@/features/public/components/PublicShell";

export const Route = createFileRoute("/pembayaran")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<PublicShell active="keranjang">
			<PublicPembayaranView />
		</PublicShell>
	);
}
