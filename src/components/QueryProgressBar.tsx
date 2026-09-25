import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Indeterminate sweep. Kept next to the component so the bar stays one import
// and needs no edit to the global stylesheet.
const SLIDE_KEYFRAMES = `@keyframes query-progress-slide {
	from { transform: translateX(-100%); }
	to { transform: translateX(400%); }
}`;

export function QueryProgressBar({
	hideDelayMs = 250,
}: {
	hideDelayMs?: number;
}) {
	const routerLoading = useRouterState({
		select: (state) => state.isLoading,
	});
	const isFetching = useIsFetching();
	const isMutating = useIsMutating();
	const isActive = routerLoading || isFetching + isMutating > 0;

	// Muncul seketika saat load/fetch mulai, baru hilang (dengan fade) setelah
	// fetch selesai. Delay cegah kedip pada fetch kilat.
	const [visible, setVisible] = useState(false);
	useEffect(() => {
		if (isActive) {
			setVisible(true);
			return;
		}
		const timer = setTimeout(() => setVisible(false), hideDelayMs);
		return () => clearTimeout(timer);
	}, [isActive, hideDelayMs]);

	return (
		<div
			role="progressbar"
			aria-label="Status pemuatan data"
			aria-busy={visible}
			aria-valuetext="Memuat data"
			aria-hidden={!visible}
			data-state={visible ? "loading" : "idle"}
			className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px]"
		>
			<style>{SLIDE_KEYFRAMES}</style>
			<div
				className={cn(
					"h-full w-full overflow-hidden bg-[linear-gradient(90deg,var(--lagoon),var(--lagoon-deep))] transition-opacity duration-200",
					visible ? "opacity-100" : "opacity-0",
				)}
			>
				<div
					aria-hidden="true"
					className="h-full w-1/4 bg-white/70 blur-[1px] [animation:query-progress-slide_1.1s_ease-in-out_infinite] [will-change:transform]"
				/>
			</div>
		</div>
	);
}
