import { Outlet } from "@tanstack/react-router";
import { KasirSidebar } from "./KasirSidebar";

export function KasirShell() {
	return (
		<div className="flex min-h-dvh bg-[#F5F6F8] text-neutral-900">
			<KasirSidebar />
			<div className="min-w-0 flex-1">
				<Outlet />
			</div>
		</div>
	);
}
