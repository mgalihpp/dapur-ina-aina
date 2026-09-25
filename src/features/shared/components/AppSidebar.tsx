import { LogOut } from "lucide-react";
import type { ComponentType } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export type SidebarItem = {
	icon: ComponentType<{ className?: string }>;
	label: string;
	active?: boolean;
	to?: string;
};

type AppSidebarProps = {
	items: SidebarItem[];
	logoSrc?: string;
	logoAlt?: string;
	onNavigate?: (to: string) => void;
	onLogout?: () => void;
};

export function AppSidebar({
	items,
	logoSrc = "/logo.jfif",
	logoAlt = "Dapur Ina Aina",
	onNavigate,
	onLogout,
}: AppSidebarProps) {
	return (
		<aside className="sticky top-0 flex h-dvh w-[72px] shrink-0 flex-col items-center overflow-y-auto border-r border-neutral-200 bg-white py-4">
			<img
				src={logoSrc}
				alt={logoAlt}
				className="h-10 w-10 rounded-xl object-cover"
			/>
			<TooltipProvider>
				<nav className="mt-6 flex flex-1 flex-col items-center gap-1">
					{items.map((item) => (
						<Tooltip key={item.label}>
							<TooltipTrigger asChild>
								{item.to ? (
									<button
										type="button"
										onClick={() => onNavigate?.(item.to as string)}
										aria-label={item.label}
										className={`rounded-xl p-2.5 transition ${
											item.active
												? "text-[#EF7D1A]"
												: "text-neutral-300 hover:text-neutral-400"
										}`}
									>
										<item.icon className="h-5 w-5" />
									</button>
								) : (
									<button
										type="button"
										disabled
										title={`${item.label} (segera hadir)`}
										aria-label={item.label}
										className="rounded-xl p-2.5 text-neutral-300 transition hover:text-neutral-400"
									>
										<item.icon className="h-5 w-5" />
									</button>
								)}
							</TooltipTrigger>
							<TooltipContent side="right">
								{item.to ? item.label : `${item.label} (segera hadir)`}
							</TooltipContent>
						</Tooltip>
					))}
				</nav>
				{onLogout ? (
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								aria-label="Keluar"
								onClick={() => onLogout()}
								className="rounded-xl p-2.5 text-neutral-300 transition hover:text-neutral-400"
							>
								<LogOut className="h-5 w-5" />
							</button>
						</TooltipTrigger>
						<TooltipContent side="right">Keluar</TooltipContent>
					</Tooltip>
				) : null}
			</TooltipProvider>
		</aside>
	);
}
