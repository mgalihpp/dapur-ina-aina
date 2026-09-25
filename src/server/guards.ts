import { getRequestHeaders } from "@tanstack/react-start/server";
import { type AuthSession, auth } from "@/lib/auth";
import { userRoleOf } from "@/lib/roles";

export async function ensureStaff(): Promise<AuthSession> {
	const session = await auth.api.getSession({ headers: getRequestHeaders() });
	if (!session) throw new Error("Unauthorized");
	const role = userRoleOf(session.user);
	if (role !== "admin" && role !== "kasir") throw new Error("Forbidden");
	return session;
}

export async function ensureAdmin(): Promise<AuthSession> {
	const session = await auth.api.getSession({ headers: getRequestHeaders() });
	if (!session) throw new Error("Unauthorized");
	if (userRoleOf(session.user) !== "admin") throw new Error("Forbidden");
	return session;
}
