import { createFileRoute, redirect } from "@tanstack/react-router";
import { TablesView } from "@/features/admin/components/TablesView";
import { userRoleOf } from "@/lib/roles";
import { ensureSession } from "@/server/auth-functions";

export const Route = createFileRoute("/admin/tables")({
	beforeLoad: async () => {
		const session = await ensureSession();
		if (userRoleOf(session.user) !== "admin") throw redirect({ to: "/kasir" });
	},
	component: TablesView,
});
