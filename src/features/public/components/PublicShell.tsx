import { useNavigate } from "@tanstack/react-router";
import {
	ClipboardList,
	Home,
	ShoppingCart,
	UtensilsCrossed,
} from "lucide-react";
import type { ReactNode } from "react";
import {
	AppSidebar,
	type SidebarItem,
} from "@/features/shared/components/AppSidebar";

export type PublicNavKey = "beranda" | "menu" | "keranjang" | "pesanan";

export function PublicShell({
	active,
	children,
}: {
	active: PublicNavKey;
	children: ReactNode;
}) {
	const navigate = useNavigate();
	const items: SidebarItem[] = [
		{
			icon: Home,
			label: "Beranda",
			active: active === "beranda",
			to: "/meja",
		},
		{
			icon: UtensilsCrossed,
			label: "Menu",
			active: active === "menu",
			to: "/menu",
		},
		{
			icon: ShoppingCart,
			label: "Keranjang",
			active: active === "keranjang",
			to: "/keranjang",
		},
		{
			icon: ClipboardList,
			label: "Pesanan",
			active: active === "pesanan",
			to: "/pesanan",
		},
	];

	return (
		<div className="flex h-dvh overflow-hidden bg-[#F5F6F8] text-neutral-900">
			<AppSidebar items={items} onNavigate={(to) => void navigate({ to })} />
			<div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
				{children}
			</div>
		</div>
	);
}
