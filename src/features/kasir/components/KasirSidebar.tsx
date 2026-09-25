import { useLocation, useNavigate } from "@tanstack/react-router";
import { Boxes, ClipboardList, LayoutGrid, ShoppingCart } from "lucide-react";
import {
	AppSidebar,
	type SidebarItem,
} from "@/features/shared/components/AppSidebar";
import { authClient } from "@/lib/auth-client";

export function KasirSidebar() {
	const navigate = useNavigate();
	const pathname = useLocation({ select: (state) => state.pathname });
	const items: SidebarItem[] = [
		{
			icon: LayoutGrid,
			label: "Dasbor",
			active: pathname === "/kasir",
			to: "/kasir",
		},
		{
			icon: ShoppingCart,
			label: "POS",
			active: pathname === "/kasir/pos",
			to: "/kasir/pos",
		},
		{
			icon: ClipboardList,
			label: "Pesanan",
			active: pathname.startsWith("/kasir/orders"),
			to: "/kasir/orders",
		},
		{
			icon: Boxes,
			label: "Stok",
			active: pathname === "/kasir/stock",
			to: "/kasir/stock",
		},
	];

	async function logout() {
		await authClient.signOut();
		await navigate({ to: "/login" });
	}

	return (
		<AppSidebar
			items={items}
			onNavigate={(to) => void navigate({ to })}
			onLogout={() => void logout()}
		/>
	);
}
