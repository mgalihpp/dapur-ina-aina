import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import type { AdminProduct } from "../types";

type DeleteProductModalProps = {
	product: AdminProduct | null;
	onConfirm: () => void;
	onCancel: () => void;
};

export function DeleteProductModal({
	product,
	onConfirm,
	onCancel,
}: DeleteProductModalProps) {
	useEffect(() => {
		if (!product) return;
		function onKey(event: KeyboardEvent) {
			if (event.key === "Escape") onCancel();
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [product, onCancel]);

	if (!product) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<button
				type="button"
				aria-label="Batalkan hapus produk"
				onClick={onCancel}
				className="absolute inset-0 cursor-default bg-black/50"
			/>
			<div
				role="dialog"
				aria-modal="true"
				aria-label={`Hapus ${product.name}`}
				className="relative w-full max-w-[360px] rounded-2xl bg-white p-8 text-center shadow-xl"
			>
				<TriangleAlert className="mx-auto h-12 w-12 text-red-500" />
				<h2 className="mt-4 text-lg font-bold text-neutral-900">
					Hapus Produk Ini ?
				</h2>
				<p className="mt-2 text-sm text-neutral-400">
					Apakah Anda yakin ingin menghapus produk ini?
				</p>
				<div className="mt-6 flex items-center justify-center gap-4">
					<button
						type="button"
						onClick={onConfirm}
						className="rounded-lg bg-[#F97316] px-10 py-2.5 text-sm font-bold text-white transition hover:bg-[#ea6a0a]"
					>
						Ya
					</button>
					<button
						type="button"
						onClick={onCancel}
						className="rounded-lg bg-black px-10 py-2.5 text-sm font-bold text-white transition hover:bg-neutral-800"
					>
						Tidak
					</button>
				</div>
			</div>
		</div>
	);
}
