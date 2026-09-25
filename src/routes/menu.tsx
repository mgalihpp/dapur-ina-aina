import { createFileRoute } from "@tanstack/react-router";
import { PublicMenuView } from "@/features/public/components/PublicMenuView";
import { PublicShell } from "@/features/public/components/PublicShell";

export const Route = createFileRoute("/menu")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<PublicShell active="menu">
			<PublicMenuView />
		</PublicShell>
	);
}
