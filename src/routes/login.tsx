import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginPage } from "@/features/auth";
import { userRoleOf } from "@/lib/roles";
import { getSession } from "@/server/auth-functions";

export const Route = createFileRoute("/login")({
	beforeLoad: async () => {
		const session = await getSession();
		if (session?.user) {
			throw redirect({
				to: userRoleOf(session.user) === "admin" ? "/admin" : "/kasir",
			});
		}
	},
	component: LoginPage,
});
