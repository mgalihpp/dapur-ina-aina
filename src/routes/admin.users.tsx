import { createFileRoute, redirect } from "@tanstack/react-router";
import { UsersView } from "@/features/admin/components/UsersView";
import { userRoleOf } from "@/lib/roles";
import { ensureSession } from "@/server/auth-functions";

export const Route = createFileRoute("/admin/users")({
	beforeLoad: async () => {
		const session = await ensureSession();
		if (userRoleOf(session.user) !== "admin") throw redirect({ to: "/kasir" });
	},
	component: UsersView,
});
