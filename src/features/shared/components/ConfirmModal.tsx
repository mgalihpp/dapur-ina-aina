import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";

type ConfirmModalProps = {
	open: boolean;
	title: string;
	message: string;
	confirmLabel?: string;
	busy?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
};

export function ConfirmModal({
	open,
	title,
	message,
	confirmLabel = "Ya",
	busy = false,
	onConfirm,
	onCancel,
}: ConfirmModalProps) {
	useEffect(() => {
		if (!open) return;
		function onKey(event: KeyboardEvent) {
			if (event.key === "Escape") onCancel();
		}
		document.addEventListener("keydown", onKey);
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = prevOverflow;
		};
	}, [open, onCancel]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			<button
				type="button"
				aria-label="Tutup konfirmasi"
				onClick={onCancel}
				className="fixed inset-0 cursor-default bg-black/50"
			/>
			<div className="pointer-events-none relative flex min-h-full items-center justify-center p-4">
			<div
				role="dialog"
				aria-modal="true"
				aria-label={title}
				className="pointer-events-auto relative w-full max-w-[360px] rounded-2xl bg-white p-8 text-center shadow-xl"
			>
				<TriangleAlert className="mx-auto h-12 w-12 text-red-500" />
				<h2 className="mt-4 text-lg font-bold text-neutral-900">{title}</h2>
				<p className="mt-2 text-sm text-neutral-400">{message}</p>
				<div className="mt-6 flex items-center justify-center gap-4">
					<button
						type="button"
						disabled={busy}
						onClick={onConfirm}
						className="rounded-lg bg-[#F97316] px-10 py-2.5 text-sm font-bold text-white transition hover:bg-[#ea6a0a] disabled:opacity-50"
					>
						{confirmLabel}
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
		</div>
	);
}
