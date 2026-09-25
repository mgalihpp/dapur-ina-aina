import { createFileRoute } from "@tanstack/react-router";
import { PublicMejaView } from "@/features/public/components/PublicMejaView";
import { PublicShell } from "@/features/public/components/PublicShell";

export const Route = createFileRoute("/meja")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<PublicShell active="beranda">
			<PublicMejaView />
		</PublicShell>
	);
}
