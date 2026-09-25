import { createFileRoute, redirect } from "@tanstack/react-router";
import { KasirEmptyView } from "@/features/kasir";
import { ensureSession } from "@/lib/auth-functions";
import { userRoleOf } from "@/lib/roles";

export const Route = createFileRoute("/kasir")({
	beforeLoad: async () => {
		const session = await ensureSession();
		if (userRoleOf(session.user) !== "kasir") throw redirect({ to: "/admin" });
	},
	component: KasirEmptyView,
});
