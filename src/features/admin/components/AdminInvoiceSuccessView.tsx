import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { InvoicePrintedIllustration } from "@/features/orders";

export function AdminInvoiceSuccessView() {
	const navigate = useNavigate();

	return (
		<main className="flex min-h-dvh flex-col bg-white px-6 py-6 text-neutral-900">
			<button
				type="button"
				onClick={() => void navigate({ to: "/admin/orders" })}
				title="Kembali"
				aria-label="Kembali ke pesanan"
				className="w-fit rounded-lg bg-[#EF7D1A] p-1.5 text-white transition hover:bg-[#d96f15]"
			>
				<ChevronLeft className="h-5 w-5" />
			</button>
			<div className="flex flex-1 flex-col items-center justify-center pb-16 text-center">
				<InvoicePrintedIllustration />
				<h1 className="mt-6 text-xl font-bold">Struk Berhasil Dicetak!</h1>
				<p className="mt-2 text-sm text-neutral-400">
					Mohon tunggu beberapa menit hingga struk tercetak
				</p>
			</div>
		</main>
	);
}
