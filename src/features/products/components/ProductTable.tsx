import { Pencil, Trash2 } from "lucide-react";
import { fmtMoney } from "@/features/shared/lib/format";
import type { AdminProduct } from "../types";

type ProductTableProps = {
	products: AdminProduct[];
	onEdit: (product: AdminProduct) => void;
	onDelete: (product: AdminProduct) => void;
};

export function ProductTable({
	products,
	onEdit,
	onDelete,
}: ProductTableProps) {
	return (
		<table className="w-full min-w-[760px] border-collapse text-left text-sm">
			<thead>
				<tr className="text-neutral-400">
					<th className="px-4 py-3 text-left font-medium">Produk</th>
					<th className="px-4 py-3 text-center font-medium">Status</th>
					<th className="px-4 py-3 text-center font-medium">ID Produk</th>
					<th className="px-4 py-3 text-center font-medium">Stok</th>
					<th className="px-4 py-3 text-center font-medium">Harga</th>
					<th className="px-4 py-3 text-center font-medium">Aksi</th>
				</tr>
			</thead>
			<tbody>
				{products.map((product) => (
					<tr
						key={product.id}
						className="border-b border-neutral-100 last:border-b-0"
					>
						<td className="px-4 py-3">
							<div className="flex items-center gap-3">
								<img
									src={product.image}
									alt={product.name}
									className="h-10 w-10 rounded-lg object-cover"
								/>
								<span className="font-semibold text-neutral-900">
									{product.name}
								</span>
							</div>
						</td>
						<td className="px-4 py-3 text-center font-semibold text-green-600">
							{product.status}
						</td>
						<td className="px-4 py-3 text-center text-neutral-900">
							{product.productId}
						</td>
						<td className="px-4 py-3 text-center text-neutral-900">
							{product.quantity}
						</td>
						<td className="px-4 py-3 text-center font-semibold text-neutral-900">
							{fmtMoney(product.price)}
						</td>
						<td className="px-4 py-3">
							<div className="flex items-center justify-center gap-4">
								<button
									type="button"
									aria-label={`Ubah ${product.name}`}
									onClick={() => onEdit(product)}
									className="flex items-center gap-1 text-[13px] font-semibold text-green-600 transition hover:opacity-80"
								>
									<Pencil className="h-3.5 w-3.5" />
									Ubah
								</button>
								<button
									type="button"
									aria-label={`Hapus ${product.name}`}
									onClick={() => onDelete(product)}
									className="flex items-center gap-1 text-[13px] font-semibold text-[#EF7D1A] transition hover:opacity-80"
								>
									<Trash2 className="h-3.5 w-3.5" />
									Hapus
								</button>
							</div>
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
