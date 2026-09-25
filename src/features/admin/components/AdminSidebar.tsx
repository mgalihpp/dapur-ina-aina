import { useNavigate } from "@tanstack/react-router";
import {
	BarChart3,
	Boxes,
	ClipboardList,
	LayoutGrid,
	Sandwich,
	Tags,
	Users,
} from "lucide-react";
import {
	AppSidebar,
	type SidebarItem,
} from "@/features/shared/components/AppSidebar";
import { authClient } from "@/lib/auth-client";

type AdminSidebarProps = {
	active?:
		| "dashboard"
		| "orders"
		| "menu"
		| "categories"
		| "stock"
		| "reports"
		| "users";
};

export function AdminSidebar({ active = "dashboard" }: AdminSidebarProps) {
	const navigate = useNavigate();
	const items: SidebarItem[] = [
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
			label: "Produk",
			active: active === "menu",
			to: "/admin/menu",
		},
		{
			icon: Tags,
			label: "Kategori",
			active: active === "categories",
			to: "/admin/categories",
		},
		{
			icon: Boxes,
			label: "Stok",
			active: active === "stock",
			to: "/admin/stock",
		},
		{
			icon: BarChart3,
			label: "Laporan",
			active: active === "reports",
			to: "/admin/reports",
		},
		{
			icon: Users,
			label: "Pengguna",
			active: active === "users",
			to: "/admin/users",
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
