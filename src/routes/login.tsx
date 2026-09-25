import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginPage } from "@/features/auth";
import { getSession } from "@/lib/auth-functions";
import { userRoleOf } from "@/lib/roles";

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
