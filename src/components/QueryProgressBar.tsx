import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

// Indeterminate sweep. Kept next to the component so the bar stays one import
// and needs no edit to the global stylesheet.
const SLIDE_KEYFRAMES = `@keyframes query-progress-slide {
	from { transform: translateX(-100%); }
	to { transform: translateX(400%); }
}`;

export function QueryProgressBar() {
	const isFetching = useIsFetching();
	const isMutating = useIsMutating();
	const isActive = isFetching + isMutating > 0;

	return (
		<div
			role="progressbar"
			aria-label="Status pemuatan data"
			aria-busy={isActive}
			aria-valuetext="Memuat data"
			aria-hidden={!isActive}
			data-state={isActive ? "loading" : "idle"}
			className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px]"
		>
			<style>{SLIDE_KEYFRAMES}</style>
			<div
				className={cn(
					"h-full w-full overflow-hidden bg-[linear-gradient(90deg,var(--lagoon),var(--lagoon-deep))] transition-opacity duration-200",
					isActive ? "opacity-100" : "opacity-0",
				)}
			>
				<div
					aria-hidden="true"
					className="h-full w-1/4 [animation:query-progress-slide_1.1s_ease-in-out_infinite] [will-change:transform]"
				/>
			</div>
		</div>
	);
}
