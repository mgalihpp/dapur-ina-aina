import { createFileRoute, redirect } from "@tanstack/react-router";
import { KasirDashboardView } from "@/features/kasir/components/KasirDashboardView";
import { ensureSession } from "@/server/auth-functions";

export const Route = createFileRoute("/kasir/")({
	beforeLoad: async () => {
		const session = await ensureSession();
		if (session.user.role !== "kasir" && session.user.role !== "admin")
			throw redirect({ to: "/admin" });
	},
	component: KasirDashboardView,
});
