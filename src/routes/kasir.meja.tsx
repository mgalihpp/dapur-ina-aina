import { createFileRoute, redirect } from "@tanstack/react-router";
import { MejaKasirView } from "@/features/kasir/components/MejaKasirView";
import { ensureSession } from "@/server/auth-functions";

export const Route = createFileRoute("/kasir/meja")({
	beforeLoad: async () => {
		const session = await ensureSession();
		if (session.user.role !== "kasir" && session.user.role !== "admin")
			throw redirect({ to: "/admin" });
	},
	component: MejaKasirView,
});
