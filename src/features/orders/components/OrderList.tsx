import type { DragEndEvent } from "@dnd-kit/core";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { fmtDecimalMoney, fmtTanggalJam } from "@/features/shared/lib/format";
import { cn } from "@/lib/utils";
import type { AdminOrderRow } from "@/server/order-functions";
import {
	groupOrdersByBucket,
	type OrderBucket,
	type OrderTone,
	toneStyles,
} from "../lib/order-buckets";

type OrderListProps = {
	orders: readonly AdminOrderRow[];
	selectedId: string | null;
	onSelect: (id: string) => void;
	onMove: (id: string, status: "selesai" | "dibatalkan") => void;
};

const dropRing: Record<OrderTone, string> = {
	perlu: "ring-amber-400",
	siap: "ring-emerald-500",
	batal: "ring-neutral-300",
	tuntas: "ring-neutral-400",
};

function OrderCard({
	order,
	tone,
	selected,
	onSelect,
}: {
	order: AdminOrderRow;
	tone: OrderTone;
	selected: boolean;
	onSelect: (id: string) => void;
}) {
	const draggable = order.status === "diproses";
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: order.id,
		disabled: !draggable,
	});
	const mejaLine = [order.meja?.nama ?? "Tanpa meja"]
		.concat(order.tamu ? `${order.tamu} tamu` : [])
		.join(" · ");
	const visibleItems = order.items.slice(0, 3);
	const extraCount = order.items.length - visibleItems.length;
	return (
		<li>
			<button
				ref={setNodeRef}
				type="button"
				onClick={() => onSelect(order.id)}
				aria-current={selected ? "true" : undefined}
				{...attributes}
				{...listeners}
				style={
					transform
						? { transform: CSS.Translate.toString(transform) }
						: undefined
				}
				className={cn(
					"relative w-full overflow-hidden rounded-xl py-2.5 pl-4 pr-3 text-left transition",
					selected
						? "bg-orange-50 ring-1 ring-orange-200"
						: "bg-white ring-1 ring-transparent hover:bg-neutral-100",
					draggable ? "cursor-grab active:cursor-grabbing" : null,
				)}
			>
				<span
					aria-hidden="true"
					className={cn(
						"absolute inset-y-0 left-0 w-1",
						selected ? "bg-[var(--lagoon)]" : toneStyles[tone].bar,
					)}
				/>
				<span className="flex items-baseline justify-between gap-3">
					<span className="min-w-0 truncate text-sm font-bold text-neutral-900">
						#{order.id}
					</span>
					<span className="shrink-0 text-xs text-neutral-500">
						{fmtTanggalJam(order.tanggal)}
					</span>
				</span>
				<span className="mt-1 block truncate text-xs text-neutral-500">
					{mejaLine}
				</span>
				{visibleItems.map((item) => (
					<span
						key={`${item.name}×${item.qty}`}
						className="mt-0.5 block truncate text-xs text-neutral-700"
					>
						×{item.qty} {item.name}
					</span>
				))}
				{extraCount > 0 ? (
					<span className="mt-0.5 block text-xs font-medium text-neutral-500">
						+{extraCount} menu lainnya
					</span>
				) : null}
				<span className="mt-1 flex items-baseline justify-between gap-3">
					<span className="text-xs text-neutral-500">Total</span>
					<span className="shrink-0 text-sm font-bold tabular-nums text-neutral-900">
						{fmtDecimalMoney(order.total)}
					</span>
				</span>
			</button>
		</li>
	);
}

export function OrderList({
	orders,
	selectedId,
	onSelect,
	onMove,
}: OrderListProps) {
	function handleDragEnd(event: DragEndEvent) {
		const overId = event.over?.id;
		const target =
			overId === "selesai"
				? "selesai"
				: overId === "dibatalkan"
					? "dibatalkan"
					: null;
		if (!target) return;
		const id = String(event.active.id);
		const row = orders.find((order) => order.id === id);
		if (row?.status !== "diproses") return;
		onMove(id, target);
	}

	const groups = groupOrdersByBucket(orders);
	if (groups.length === 0) return null;
	return (
		<DndContext onDragEnd={handleDragEnd}>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
				{groups.map(({ bucket, rows }) => (
					<BucketColumn
						key={bucket.id}
						bucket={bucket}
						orders={orders}
						rows={rows}
						selectedId={selectedId}
						onSelect={onSelect}
					/>
				))}
			</div>
		</DndContext>
	);
}

function BucketColumn({
	bucket,
	orders,
	rows,
	selectedId,
	onSelect,
}: {
	bucket: OrderBucket;
	orders: readonly AdminOrderRow[];
	rows: AdminOrderRow[];
	selectedId: string | null;
	onSelect: (id: string) => void;
}) {
	const droppable = bucket.id === "selesai" || bucket.id === "dibatalkan";
	const { setNodeRef, isOver, active } = useDroppable({
		id: bucket.id,
		disabled: !droppable,
	});
	const dragged = active
		? orders.find((order) => order.id === String(active.id))
		: undefined;
	const tone = toneStyles[bucket.tone];
	const highlight =
		droppable && isOver && dragged?.status === "diproses"
			? cn("ring-2", dropRing[bucket.tone])
			: null;
	return (
		<section
			ref={setNodeRef}
			className={cn(
				"min-w-0 rounded-xl bg-neutral-50/70 p-2 ring-1 ring-neutral-100",
				highlight,
			)}
		>
			<div className="sticky top-0 z-10 flex items-center gap-2 bg-neutral-50/95 px-1 py-2 backdrop-blur-sm">
				<span
					aria-hidden="true"
					className={cn("size-2 shrink-0 rounded-full", tone.bar)}
				/>
				<h2 className={cn("shrink-0 text-xs font-bold", tone.label)}>
					{bucket.label}
				</h2>
				{bucket.hint ? (
					<span className="min-w-0 truncate text-xs font-medium text-neutral-500">
						{bucket.hint}
					</span>
				) : null}
				<span
					className={cn(
						"ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
						tone.count,
					)}
				>
					{rows.length}
				</span>
			</div>
			<ul className="space-y-2">
				{rows.map((order) => (
					<OrderCard
						key={order.id}
						order={order}
						tone={bucket.tone}
						selected={selectedId === order.id}
						onSelect={onSelect}
					/>
				))}
			</ul>
		</section>
	);
}
