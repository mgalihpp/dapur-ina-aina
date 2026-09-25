import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ImagePlus } from "lucide-react";
import type { ChangeEvent, FormEvent, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/features/admin/queries";
import { mutationErrorMessage } from "@/lib/query-errors";
import { useCreateProduct, useUpdateProduct } from "../mutations";
import type { AdminProduct, ImageSource, ProductFormMode } from "../types";
import { ImageSourceModal } from "./ImageSourceModal";

type ImagePickerState =
	| { kind: "pickerClosed" }
	| { kind: "pickerOpen"; preview: string | null }
	| { kind: "previewSet"; preview: string };

type Fields = {
	name: string;
	kategoriId: string;
	price: string;
	stok: string;
	gambar: string;
};

type Kategori = { id: number; namaKategori: string };

type ProductFormViewProps = {
	mode: ProductFormMode;
	initial?: AdminProduct;
};

function fieldClass(invalid: boolean) {
	return `w-full rounded-lg border px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#F97316] ${
		invalid ? "border-red-500 ring-1 ring-red-500" : "border-neutral-200"
	}`;
}

export function ProductFormView({ mode, initial }: ProductFormViewProps) {
	const navigate = useNavigate();
	const captureRef = useRef<HTMLInputElement>(null);
	const libraryRef = useRef<HTMLInputElement>(null);
	const objectUrlRef = useRef<string | null>(null);

	const categoriesQuery = useCategories();
	const createProduct = useCreateProduct();
	const updateProduct = useUpdateProduct();

	const [fields, setFields] = useState<Fields>(() => ({
		name: initial?.name ?? "",
		kategoriId: initial ? String(initial.kategoriId) : "",
		price: initial ? String(initial.price) : "",
		stok: initial ? String(initial.quantity) : "",
		gambar: initial?.image ?? "",
	}));
	const [picker, setPicker] = useState<ImagePickerState>(() =>
		initial
			? { kind: "previewSet", preview: initial.image }
			: { kind: "pickerClosed" },
	);
	const [errors, setErrors] = useState<{
		name?: string;
		price?: string;
		stok?: string;
		kategori?: string;
		submit?: string;
	}>({});

	const kategoris: Kategori[] = categoriesQuery.data ?? [];
	const saving = createProduct.isPending || updateProduct.isPending;
	const kategoriError =
		errors.kategori ??
		(categoriesQuery.isError ? "Gagal memuat kategori." : undefined);

	useEffect(
		() => () => {
			if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
		},
		[],
	);

	const preview = picker.kind === "pickerClosed" ? null : picker.preview;
	const title = mode === "add" ? "Tambah Produk" : "Ubah Produk";

	function updateField<Key extends keyof Fields>(key: Key, value: Fields[Key]) {
		setFields((prev) => ({ ...prev, [key]: value }));
	}

	function openPicker() {
		setPicker((prev) =>
			prev.kind === "previewSet"
				? { kind: "pickerOpen", preview: prev.preview }
				: prev.kind === "pickerOpen"
					? prev
					: { kind: "pickerOpen", preview: null },
		);
	}

	function closePicker() {
		setPicker((prev) =>
			prev.kind === "pickerOpen"
				? prev.preview
					? { kind: "previewSet", preview: prev.preview }
					: { kind: "pickerClosed" }
				: prev,
		);
	}

	const fileInputs: Record<ImageSource, RefObject<HTMLInputElement | null>> = {
		capture: captureRef,
		library: libraryRef,
	};

	function openFileDialog(source: ImageSource) {
		closePicker();
		fileInputs[source].current?.click();
	}

	function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;
		if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
		const url = URL.createObjectURL(file);
		objectUrlRef.current = url;
		setPicker({ kind: "previewSet", preview: url });
	}

	function handleSubmit(event: FormEvent) {
		event.preventDefault();
		const next: typeof errors = {};
		if (!fields.name.trim()) next.name = "Nama produk wajib diisi.";
		const price = fields.price.trim();
		if (!/^\d{1,8}(\.\d{1,2})?$/.test(price) || Number(price) <= 0) {
			next.price = "Harga harus maksimal 2 angka desimal dan lebih dari 0.";
		}
		const stok = Number(fields.stok);
		if (!fields.stok.trim() || !Number.isInteger(stok) || stok < 0) {
			next.stok = "Stok harus bilangan bulat >= 0.";
		}
		if (!fields.kategoriId) next.kategori = "Kategori wajib dipilih.";
		setErrors(next);
		if (Object.keys(next).length > 0) return;

		const details = {
			namaProduk: fields.name.trim(),
			harga: price,
			kategoriId: Number(fields.kategoriId),
			gambar:
				fields.gambar.trim() ||
				(preview && !preview.startsWith("blob:") ? preview : null),
		};
		const onSuccess = () => navigate({ to: "/admin/menu" });
		const onError = (cause: unknown) =>
			setErrors((p) => ({
				...p,
				submit: mutationErrorMessage(cause, "Gagal menyimpan produk"),
			}));

		if (mode === "add") {
			createProduct.mutate({ ...details, stok }, { onSuccess, onError });
			return;
		}
		if (!initial) {
			setErrors((p) => ({ ...p, submit: "Produk tidak ditemukan" }));
			return;
		}
		updateProduct.mutate(
			{ id: initial.id, ...details },
			{ onSuccess, onError },
		);
	}

	return (
		<div className="mx-auto w-full max-w-[1440px] px-4 py-6">
			<h1 className="text-xl font-bold text-neutral-900">{title}</h1>
			<div className="mt-4 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
				<button
					type="button"
					aria-label="Kembali ke daftar produk"
					onClick={() => navigate({ to: "/admin/menu" })}
					className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F97316] text-white transition hover:bg-[#ea6a0a]"
				>
					<ChevronLeft className="h-5 w-5" />
				</button>

				<div className="mt-4 flex justify-center">
					<button
						type="button"
						onClick={openPicker}
						className="flex flex-col items-center gap-3"
					>
						<span className="flex h-[140px] w-[140px] items-center justify-center overflow-hidden rounded-2xl bg-neutral-100">
							{preview ? (
								<img
									src={preview}
									alt={fields.name || title}
									className="h-full w-full object-cover"
								/>
							) : (
								<ImagePlus className="h-12 w-12 text-neutral-400" />
							)}
						</span>
						<span className="text-sm font-bold text-neutral-900">
							Unggah Gambar
						</span>
					</button>
				</div>

				<form onSubmit={(e) => handleSubmit(e)} className="mt-6" noValidate>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<div>
							<label
								htmlFor="product-name"
								className="mb-1 block text-[13px] font-bold text-neutral-900"
							>
								Nama Produk :
							</label>
							<input
								id="product-name"
								type="text"
								value={fields.name}
								onChange={(event) => updateField("name", event.target.value)}
								placeholder="Nasi Goreng Spesial"
								className={fieldClass(Boolean(errors.name))}
							/>
							{errors.name && (
								<p className="mt-1 text-xs text-red-500">{errors.name}</p>
							)}
						</div>
						<div>
							<span
								id="product-category-label"
								className="mb-1 block text-[13px] font-bold text-neutral-900"
							>
								Kategori :
							</span>
							<Select
								value={fields.kategoriId || undefined}
								onValueChange={(value) => updateField("kategoriId", value)}
							>
								<SelectTrigger
									id="product-category"
									aria-labelledby="product-category-label"
									aria-invalid={Boolean(kategoriError)}
									className={`w-full rounded-lg bg-white px-3 py-2.5 text-sm text-neutral-900 ${
										kategoriError
											? "border-red-500 ring-1 ring-red-500"
											: "border-neutral-200"
									}`}
								>
									<SelectValue placeholder="Pilih Kategori" />
								</SelectTrigger>
								<SelectContent>
									{kategoris.map((k) => (
										<SelectItem key={k.id} value={String(k.id)}>
											{k.namaKategori}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{kategoriError && (
								<p className="mt-1 text-xs text-red-500">{kategoriError}</p>
							)}
						</div>
						<div>
							<label
								htmlFor="product-price"
								className="mb-1 block text-[13px] font-bold text-neutral-900"
							>
								Harga :
							</label>
							<input
								id="product-price"
								type="text"
								inputMode="decimal"
								value={fields.price}
								onChange={(event) => updateField("price", event.target.value)}
								placeholder="25000"
								className={fieldClass(Boolean(errors.price))}
							/>
							{errors.price && (
								<p className="mt-1 text-xs text-red-500">{errors.price}</p>
							)}
						</div>
						{mode === "add" ? (
							<div>
								<label
									htmlFor="product-stok"
									className="mb-1 block text-[13px] font-bold text-neutral-900"
								>
									Stok :
								</label>
								<input
									id="product-stok"
									type="text"
									inputMode="numeric"
									value={fields.stok}
									onChange={(event) => updateField("stok", event.target.value)}
									placeholder="40"
									className={fieldClass(Boolean(errors.stok))}
								/>
								{errors.stok && (
									<p className="mt-1 text-xs text-red-500">{errors.stok}</p>
								)}
							</div>
						) : null}
						<div className="md:col-span-2">
							<label
								htmlFor="product-gambar"
								className="mb-1 block text-[13px] font-bold text-neutral-900"
							>
								Gambar (path) :
							</label>
							<input
								id="product-gambar"
								type="text"
								value={fields.gambar}
								onChange={(event) => {
									updateField("gambar", event.target.value);
									if (event.target.value.trim())
										setPicker({
											kind: "previewSet",
											preview: event.target.value.trim(),
										});
								}}
								placeholder="/menu/nasi-goreng-spesial.jpg"
								className={fieldClass(false)}
							/>
						</div>
					</div>
					{errors.submit && (
						<p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
							{errors.submit}
						</p>
					)}
					<div className="mt-6 flex justify-center">
						<button
							type="submit"
							disabled={saving}
							className="rounded-lg bg-[#F97316] px-8 py-2.5 text-sm font-bold text-white transition hover:bg-[#ea6a0a] disabled:opacity-50"
						>
							{saving ? "Menyimpan…" : "Simpan Produk"}
						</button>
					</div>
				</form>

				<input
					ref={captureRef}
					type="file"
					accept="image/*"
					capture="environment"
					className="hidden"
					aria-hidden="true"
					tabIndex={-1}
					onChange={handleFileChange}
				/>
				<input
					ref={libraryRef}
					type="file"
					accept="image/*"
					className="hidden"
					aria-hidden="true"
					tabIndex={-1}
					onChange={handleFileChange}
				/>
				<ImageSourceModal
					open={picker.kind === "pickerOpen"}
					onClose={closePicker}
					onCapture={() => openFileDialog("capture")}
					onSelect={() => openFileDialog("library")}
				/>
			</div>
		</div>
	);
}
