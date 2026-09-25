import { createFileRoute, redirect } from "@tanstack/react-router";
import { CategoriesView } from "@/features/admin/components/CategoriesView";
import { userRoleOf } from "@/lib/roles";
import { ensureSession } from "@/server/auth-functions";

export const Route = createFileRoute("/admin/categories")({
	beforeLoad: async () => {
		const session = await ensureSession();
		if (userRoleOf(session.user) !== "admin") throw redirect({ to: "/kasir" });
	},
	component: CategoriesView,
});
