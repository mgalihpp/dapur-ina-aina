import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ProductFormView } from "@/features/products";
import { PRODUCTS_MOCK } from "@/features/products/data/products-mock";

export const Route = createFileRoute("/admin/menu/$productId/edit")({
	component: EditProductRoute,
});

function EditProductRoute() {
	const { productId } = Route.useParams();
	const navigate = useNavigate();
	const product = PRODUCTS_MOCK.find((row) => row.id === productId);

	if (!product) {
		return (
			<div className="mx-auto w-full max-w-[1440px] px-4 py-6">
				<h1 className="text-xl font-bold text-neutral-900">Ubah Produk</h1>
				<div className="mt-4 rounded-2xl border border-neutral-100 bg-white p-6 text-center shadow-sm">
					<p className="text-sm text-neutral-500">Produk tidak ditemukan.</p>
					<button
						type="button"
						onClick={() => navigate({ to: "/admin/menu" })}
						className="mt-4 rounded-lg bg-[#F97316] px-8 py-2.5 text-sm font-bold text-white transition hover:bg-[#ea6a0a]"
					>
						Kembali ke daftar
					</button>
				</div>
			</div>
		);
	}

	return <ProductFormView mode="edit" initial={product} />;
}
