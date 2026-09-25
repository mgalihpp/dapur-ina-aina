import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminDashboard } from "@/features/admin";
import { userRoleOf } from "@/lib/roles";
import { ensureSession } from "@/server/auth-functions";

export const Route = createFileRoute("/admin/")({
	beforeLoad: async () => {
		const session = await ensureSession();
		if (userRoleOf(session.user) !== "admin") throw redirect({ to: "/kasir" });
	},
	component: AdminDashboard,
});
