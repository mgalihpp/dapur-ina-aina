import { createFileRoute } from "@tanstack/react-router";
import { PublicOrderView } from "@/features/public/components/PublicOrderView";
import { PublicShell } from "@/features/public/components/PublicShell";

export const Route = createFileRoute("/pesanan/$orderId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { orderId } = Route.useParams();
	return (
		<PublicShell active="pesanan">
			<PublicOrderView orderId={orderId} />
		</PublicShell>
	);
}
