import { useNavigate } from "@tanstack/react-router";
import {
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

const KASIR_NAV: SidebarItem[] = [
	{ icon: Home, label: "Beranda", active: true, to: "/kasir" },
	{ icon: LayoutGrid, label: "Dasbor" },
	{ icon: ClipboardList, label: "Pesanan" },
	{ icon: Sandwich, label: "Menu" },
	{ icon: Bell, label: "Notifikasi" },
	{ icon: Users, label: "Pelanggan" },
	{ icon: Send, label: "Pesan" },
	{ icon: Settings, label: "Pengaturan" },
];

export function KasirSidebar() {
	const navigate = useNavigate();

	async function logout() {
		await authClient.signOut();
		await navigate({ to: "/login" });
	}

	return (
		<AppSidebar
			items={KASIR_NAV}
			onNavigate={(to) => void navigate({ to })}
			onLogout={() => void logout()}
		/>
	);
}
