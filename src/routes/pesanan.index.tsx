import { createFileRoute } from "@tanstack/react-router";
import { PublicPesananView } from "@/features/public/components/PublicPesananView";
import { PublicShell } from "@/features/public/components/PublicShell";

export const Route = createFileRoute("/pesanan/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<PublicShell active="pesanan">
			<PublicPesananView />
		</PublicShell>
	);
}
