import { Camera, ImagePlus } from "lucide-react";

type ImageSourceModalProps = {
	open: boolean;
	onClose: () => void;
	onCapture: () => void;
	onSelect: () => void;
};

export function ImageSourceModal({
	open,
	onClose,
	onCapture,
	onSelect,
}: ImageSourceModalProps) {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<button
				type="button"
				aria-label="Tutup pilihan gambar"
				onClick={onClose}
				className="absolute inset-0 cursor-default bg-black/50"
			/>
			<div
				role="dialog"
				aria-modal="true"
				aria-label="Pilih sumber gambar"
				className="relative w-full max-w-[360px] rounded-2xl bg-white p-6 shadow-xl"
			>
				<div className="flex items-start justify-center gap-6">
					<button
						type="button"
						onClick={onCapture}
						className="flex flex-col items-center gap-3"
					>
						<span className="flex h-[120px] w-[120px] items-center justify-center rounded-2xl bg-neutral-100">
							<Camera className="h-10 w-10 text-neutral-400" />
						</span>
						<span className="text-sm font-semibold text-neutral-900">
							Ambil Foto
						</span>
					</button>
					<button
						type="button"
						onClick={onSelect}
						className="flex flex-col items-center gap-3"
					>
						<span className="flex h-[120px] w-[120px] items-center justify-center rounded-2xl bg-neutral-100">
							<ImagePlus className="h-10 w-10 text-neutral-400" />
						</span>
						<span className="text-sm font-semibold text-neutral-900">
							Pilih Gambar
						</span>
					</button>
				</div>
			</div>
		</div>
	);
}
