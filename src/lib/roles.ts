export type UserRole = "admin" | "kasir";

export function userRoleOf(
	user: { role?: string | null } | null | undefined,
): UserRole {
	return user?.role === "admin" ? "admin" : "kasir";
}
