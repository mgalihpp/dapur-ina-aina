import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ImagePlus } from "lucide-react";
import type { ChangeEvent, FormEvent, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import type {
	AdminProduct,
	ImageSource,
	ProductFormMode,
	ProductFormValues,
} from "../types";
import { ImageSourceModal } from "./ImageSourceModal";

type ImagePickerState =
	| { kind: "pickerClosed" }
	| { kind: "pickerOpen"; preview: string | null }
	| { kind: "previewSet"; preview: string };

type TextFields = Omit<ProductFormValues, "imagePreview">;

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

	const [fields, setFields] = useState<TextFields>(() => ({
		name: initial?.name ?? "",
		unit: "",
		category: "",
		price: initial ? String(initial.price) : "",
		status: initial?.status ?? "",
		productId: initial?.productId ?? "",
	}));
	const [picker, setPicker] = useState<ImagePickerState>(() =>
		initial
			? { kind: "previewSet", preview: initial.image }
			: { kind: "pickerClosed" },
	);
	const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

	useEffect(
		() => () => {
			if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
		},
		[],
	);

	const preview = picker.kind === "pickerClosed" ? null : picker.preview;
	const title = mode === "add" ? "Tambah Produk" : "Ubah Produk";

	function updateField<Key extends keyof TextFields>(
		key: Key,
		value: TextFields[Key],
	) {
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
		const next: { name?: string; price?: string } = {};
		if (!fields.name.trim()) next.name = "Nama produk wajib diisi.";
		const price = Number(fields.price);
		if (!fields.price.trim() || !Number.isFinite(price) || price <= 0) {
			next.price = "Harga harus berupa angka lebih dari 0.";
		}
		setErrors(next);
		if (Object.keys(next).length > 0) return;
		navigate({ to: "/admin/menu" });
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

				<form onSubmit={handleSubmit} className="mt-6" noValidate>
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
								placeholder="Grill Sandwich"
								className={fieldClass(Boolean(errors.name))}
							/>
							{errors.name && (
								<p className="mt-1 text-xs text-red-500">{errors.name}</p>
							)}
						</div>
						<div>
							<label
								htmlFor="product-unit"
								className="mb-1 block text-[13px] font-bold text-neutral-900"
							>
								Satuan Produk :
							</label>
							<input
								id="product-unit"
								type="text"
								value={fields.unit}
								onChange={(event) => updateField("unit", event.target.value)}
								placeholder="Pcs"
								className={fieldClass(false)}
							/>
						</div>
						<div>
							<label
								htmlFor="product-category"
								className="mb-1 block text-[13px] font-bold text-neutral-900"
							>
								Kategori :
							</label>
							<input
								id="product-category"
								type="text"
								value={fields.category}
								onChange={(event) =>
									updateField("category", event.target.value)
								}
								placeholder="Makanan Utama"
								className={fieldClass(false)}
							/>
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
								placeholder="20000"
								className={fieldClass(Boolean(errors.price))}
							/>
							{errors.price && (
								<p className="mt-1 text-xs text-red-500">{errors.price}</p>
							)}
						</div>
						<div>
							<label
								htmlFor="product-status"
								className="mb-1 block text-[13px] font-bold text-neutral-900"
							>
								Status :
							</label>
							<select
								id="product-status"
								value={fields.status}
								onChange={(event) =>
									updateField(
										"status",
										event.target.value as TextFields["status"],
									)
								}
								className={`${fieldClass(false)} bg-white`}
							>
								<option value="">Pilih Status</option>
								<option value="In Stock">Tersedia</option>
								<option value="Out of Stock">Stok Habis</option>
							</select>
						</div>
						<div>
							<label
								htmlFor="product-id"
								className="mb-1 block text-[13px] font-bold text-neutral-900"
							>
								ID Produk :
							</label>
							<input
								id="product-id"
								type="text"
								value={fields.productId}
								onChange={(event) =>
									updateField("productId", event.target.value)
								}
								placeholder="123456789"
								className={fieldClass(false)}
							/>
						</div>
					</div>
					<div className="mt-6 flex justify-center">
						<button
							type="submit"
							className="rounded-lg bg-[#F97316] px-8 py-2.5 text-sm font-bold text-white transition hover:bg-[#ea6a0a]"
						>
							Simpan Produk
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
