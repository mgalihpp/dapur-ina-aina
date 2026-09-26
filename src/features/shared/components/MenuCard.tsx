import { Minus, Plus } from "lucide-react";
import { fmtDecimalMoney } from "../lib/format";

type MenuCardProps = {
	name: string;
	category: string;
	price: string;
	image: string;
	stock: number;
	stokMinimal?: number;
	soldOut: boolean;
	quantity: number;
	onAdd: () => void;
	onDecrease: () => void;
};

export function MenuCard({
	name,
	category,
	price,
	image,
	stock,
	stokMinimal = 5,
	soldOut,
	quantity,
	onAdd,
	onDecrease,
}: MenuCardProps) {
	const lowStock = !soldOut && stock <= stokMinimal;
	return (
		<article
			className={`flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
				soldOut
					? "border-neutral-100 opacity-80"
					: quantity > 0
						? "border-orange-300 ring-1 ring-orange-200"
						: "border-neutral-100 hover:border-orange-200"
			}`}
		>
			<div className="relative">
				<img
					src={image}
					alt=""
					loading="lazy"
					className={`aspect-[4/3] w-full object-cover ${soldOut ? "grayscale" : ""}`}
				/>
				{soldOut ? (
					<span className="absolute right-2 top-2 rounded-full bg-neutral-900 px-2.5 py-1 text-[11px] font-bold text-white">
						Habis
					</span>
				) : quantity > 0 ? (
					<span className="absolute right-2 top-2 rounded-full bg-[#F97316] px-2.5 py-1 text-[11px] font-bold text-white">
						×{quantity}
					</span>
				) : null}
			</div>
			<div className="flex flex-1 flex-col p-3">
				<p className="line-clamp-2 min-h-10 text-sm font-semibold leading-snug">
					{name}
				</p>
				<p className="mt-0.5 truncate text-xs text-neutral-500">{category}</p>
				<div className="mt-1 flex items-center justify-between gap-2">
					<p className="text-sm font-bold text-orange-700">
						{fmtDecimalMoney(price)}
					</p>
					<p
						className={`shrink-0 text-[11px] font-medium ${soldOut ? "text-neutral-400" : lowStock ? "text-red-600" : "text-neutral-500"}`}
					>
						{soldOut ? "Stok habis" : lowStock ? `Sisa ${stock}` : `Stok ${stock}`}
					</p>
				</div>
				<div className="mt-3">
					{quantity === 0 ? (
						<button
							type="button"
							aria-label={`Tambah ${name}`}
							disabled={soldOut}
							onClick={onAdd}
							className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#F97316] py-2.5 text-sm font-bold text-white transition hover:bg-[#ea6a0a] disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500"
						>
							<Plus className="size-4" aria-hidden="true" />
							Tambah
						</button>
					) : (
						<div className="flex items-center justify-between rounded-xl bg-orange-50 p-1">
							<button
								type="button"
								aria-label={`Kurangi ${name}`}
								onClick={onDecrease}
								className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-neutral-800 shadow-sm transition hover:bg-neutral-100"
							>
								<Minus className="size-4" aria-hidden="true" />
							</button>
							<span className="min-w-8 text-center text-sm font-bold tabular-nums">
								{quantity}
							</span>
							<button
								type="button"
								aria-label={`Tambah ${name}`}
								disabled={soldOut || quantity >= stock}
								onClick={onAdd}
								className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F97316] text-white shadow-sm transition hover:bg-[#ea6a0a] disabled:opacity-40"
							>
								<Plus className="size-4" aria-hidden="true" />
							</button>
						</div>
					)}
				</div>
			</div>
		</article>
	);
}
