import { createFileRoute, redirect } from "@tanstack/react-router";
import { PosView } from "@/features/kasir/components/PosView";
import { ensureSession } from "@/server/auth-functions";

export const Route = createFileRoute("/kasir/pos")({
	beforeLoad: async () => {
		const session = await ensureSession();
		if (session.user.role !== "kasir" && session.user.role !== "admin")
			throw redirect({ to: "/admin" });
	},
	component: PosView,
});
