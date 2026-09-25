import { Outlet, useLocation } from "@tanstack/react-router";
import { AdminSidebar } from "./AdminSidebar";

export function AdminShell() {
	const pathname = useLocation({ select: (s) => s.pathname });
	const active = pathname.startsWith("/admin/menu")
		? "menu"
		: pathname.startsWith("/admin/orders")
			? "orders"
			: pathname.startsWith("/admin/reports")
				? "reports"
				: pathname.startsWith("/admin/categories")
					? "categories"
					: pathname.startsWith("/admin/stock")
						? "stock"
						: pathname.startsWith("/admin/users")
							? "users"
							: "dashboard";

	return (
		<div className="flex h-dvh overflow-hidden bg-[#F5F6F8] text-neutral-900">
			<AdminSidebar active={active} />
			<div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
				<Outlet />
			</div>
		</div>
	);
}
