export type OrderBucketId =
	| "belum_lunas"
	| "lunas_diproses"
	| "dibatalkan"
	| "selesai";

export type OrderTone = "perlu" | "siap" | "batal" | "tuntas";

export type OrderBucket = {
	id: OrderBucketId;
	label: string;
	hint: string | null;
	tone: OrderTone;
};

export type OrderListRow = {
	status: "diproses" | "selesai" | "dibatalkan";
	paymentStatus: "lunas" | "belum_lunas" | null;
};

export const ORDER_BUCKETS: readonly OrderBucket[] = [
	{
		id: "belum_lunas",
		label: "Belum lunas",
		hint: "Perlu pelunasan",
		tone: "perlu",
	},
	{
		id: "lunas_diproses",
		label: "Lunas, diproses",
		hint: "Tandai selesai",
		tone: "siap",
	},
	{ id: "dibatalkan", label: "Dibatalkan", hint: null, tone: "batal" },
	{ id: "selesai", label: "Selesai", hint: null, tone: "tuntas" },
];

export const toneStyles: Record<
	OrderTone,
	{ bar: string; label: string; count: string }
> = {
	perlu: {
		bar: "bg-amber-400",
		label: "text-amber-700",
		count: "bg-amber-100 text-amber-800",
	},
	siap: {
		bar: "bg-emerald-500",
		label: "text-emerald-700",
		count: "bg-emerald-100 text-emerald-700",
	},
	batal: {
		bar: "bg-neutral-300",
		label: "text-neutral-500",
		count: "bg-neutral-100 text-neutral-500",
	},
	tuntas: {
		bar: "bg-neutral-400",
		label: "text-neutral-600",
		count: "bg-neutral-200 text-neutral-600",
	},
};

export function orderBucketId(row: OrderListRow): OrderBucketId {
	if (row.status === "dibatalkan") return "dibatalkan";
	if (row.status === "selesai") return "selesai";
	return row.paymentStatus === "lunas" ? "lunas_diproses" : "belum_lunas";
}

export function groupOrdersByBucket<Row extends OrderListRow>(
	rows: readonly Row[],
): { bucket: OrderBucket; rows: Row[] }[] {
	const grouped = new Map<OrderBucketId, Row[]>();
	for (const row of rows) {
		const id = orderBucketId(row);
		const existing = grouped.get(id);
		if (existing) {
			existing.push(row);
		} else {
			grouped.set(id, [row]);
		}
	}
	return ORDER_BUCKETS.flatMap((bucket) => {
		const bucketRows = grouped.get(bucket.id);
		return bucketRows ? [{ bucket, rows: bucketRows }] : [];
	});
}
