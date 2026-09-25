import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/features/admin/components/AdminLayout";
import { userRoleOf } from "@/lib/roles";
import { ensureSession } from "@/server/auth-functions";

export const Route = createFileRoute("/admin/orders")({
	beforeLoad: async () => {
		const session = await ensureSession();
		if (userRoleOf(session.user) !== "admin") throw redirect({ to: "/kasir" });
	},
	component: AdminLayout,
});
