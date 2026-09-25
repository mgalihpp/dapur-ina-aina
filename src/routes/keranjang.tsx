import { createFileRoute } from "@tanstack/react-router";
import { PublicKeranjangView } from "@/features/public/components/PublicKeranjangView";
import { PublicShell } from "@/features/public/components/PublicShell";

export const Route = createFileRoute("/keranjang")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<PublicShell active="keranjang">
			<PublicKeranjangView />
		</PublicShell>
	);
}
