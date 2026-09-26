import { useLocation, useNavigate } from "@tanstack/react-router";
import { Boxes, ClipboardList, LayoutGrid, ShoppingCart } from "lucide-react";
import { useSignOutMutation } from "@/features/auth/mutations";
import { usePosStore } from "@/features/kasir/lib/pos-store";
import { useOrdersStore } from "@/features/orders/lib/orders-store";
import {
	AppSidebar,
	type SidebarItem,
} from "@/features/shared/components/AppSidebar";
import { TableIcon } from "@/features/shared/components/table-icon";

export function KasirSidebar() {
	const navigate = useNavigate();
	const pathname = useLocation({ select: (state) => state.pathname });
	const signOutMutation = useSignOutMutation();
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
			icon: TableIcon,
			label: "Meja",
			active: pathname === "/kasir/meja",
			to: "/kasir/meja",
		},
		{
			icon: Boxes,
			label: "Stok",
			active: pathname === "/kasir/stock",
			to: "/kasir/stock",
		},
	];

	function logout() {
		usePosStore.getState().reset();
		useOrdersStore.getState().reset();
		signOutMutation.mutate(undefined, {
			onSuccess: () => void navigate({ to: "/login" }),
		});
	}

	return (
		<AppSidebar
			items={items}
			onNavigate={(to) => void navigate({ to })}
			onLogout={() => void logout()}
		/>
	);
}
