import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StockCondition = "habis" | "menipis" | "aman";

export function stockConditionOf(stock: number): StockCondition {
	if (stock <= 0) return "habis";
	if (stock <= 5) return "menipis";
	return "aman";
}

const conditionStyles: Record<StockCondition, string> = {
	habis: "bg-red-50 text-red-700 ring-1 ring-red-200",
	menipis: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
	aman: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
};

const conditionLabels: Record<StockCondition, string> = {
	habis: "Habis",
	menipis: "Menipis",
	aman: "Aman",
};

export function StockStatusBadge({
	stock,
	className,
}: {
	stock: number;
	className?: string;
}) {
	const condition = stockConditionOf(stock);
	return (
		<Badge
			variant="outline"
			className={cn("font-semibold", conditionStyles[condition], className)}
		>
			<span
				aria-hidden="true"
				className={cn(
					"size-1.5 rounded-full",
					condition === "habis"
						? "bg-red-500"
						: condition === "menipis"
							? "bg-amber-500"
							: "bg-emerald-500",
				)}
			/>
			{conditionLabels[condition]}
		</Badge>
	);
}

export function stockBarTone(stock: number): string {
	if (stock <= 0) return "bg-red-500";
	if (stock <= 5) return "bg-amber-500";
	return "bg-emerald-500";
}
