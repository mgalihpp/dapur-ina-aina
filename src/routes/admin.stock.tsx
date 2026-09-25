import { createFileRoute, redirect } from "@tanstack/react-router";
import { StockView } from "@/features/admin/components/StockView";
import { userRoleOf } from "@/lib/roles";
import { ensureSession } from "@/server/auth-functions";

export const Route = createFileRoute("/admin/stock")({
	beforeLoad: async () => {
		const session = await ensureSession();
		if (userRoleOf(session.user) !== "admin") throw redirect({ to: "/kasir" });
	},
	component: StockView,
});
