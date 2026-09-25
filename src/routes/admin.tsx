import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { ensureSession } from "@/lib/auth-functions";
import { userRoleOf } from "@/lib/roles";

export const Route = createFileRoute("/admin")({
	beforeLoad: async () => {
		const session = await ensureSession();
		if (userRoleOf(session.user) !== "admin") throw redirect({ to: "/kasir" });
	},
	component: AdminShell,
});
