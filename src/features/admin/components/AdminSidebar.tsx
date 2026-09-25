import { useNavigate } from "@tanstack/react-router";
import {
	BarChart3,
	Bell,
	ClipboardList,
	Home,
	LayoutGrid,
	Sandwich,
	Send,
	Settings,
	Users,
} from "lucide-react";
import {
	AppSidebar,
	type SidebarItem,
} from "@/features/shared/components/AppSidebar";
import { authClient } from "@/lib/auth-client";

type AdminSidebarProps = {
	active?: "dashboard" | "orders" | "menu" | "reports";
};

export function AdminSidebar({ active = "dashboard" }: AdminSidebarProps) {
	const navigate = useNavigate();

	const NAV: SidebarItem[] = [
		{ icon: Home, label: "Beranda", to: "/admin" },
		{
			icon: LayoutGrid,
			label: "Dasbor",
			active: active === "dashboard",
			to: "/admin",
		},
		{
			icon: ClipboardList,
			label: "Pesanan",
			active: active === "orders",
			to: "/admin/orders",
		},
		{
			icon: Sandwich,
			label: "Menu",
			to: "/admin/menu",
			active: active === "menu",
		},
		{
			icon: BarChart3,
			label: "Laporan",
			to: "/admin/reports",
			active: active === "reports",
		},
		{ icon: Bell, label: "Notifikasi" },
		{ icon: Users, label: "Pelanggan" },
		{ icon: Send, label: "Pesan" },
		{ icon: Settings, label: "Pengaturan" },
	];

	async function logout() {
		await authClient.signOut();
		await navigate({ to: "/login" });
	}

	return (
		<AppSidebar
			items={NAV}
			onNavigate={(to) => void navigate({ to })}
			onLogout={() => void logout()}
		/>
	);
}
