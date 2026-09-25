import { createFileRoute, redirect } from "@tanstack/react-router";
import { KasirStockView } from "@/features/kasir/components/KasirStockView";
import { ensureSession } from "@/server/auth-functions";

export const Route = createFileRoute("/kasir/stock")({
	beforeLoad: async () => {
		const session = await ensureSession();
		if (session.user.role !== "kasir" && session.user.role !== "admin")
			throw redirect({ to: "/admin" });
	},
	component: KasirStockView,
});
