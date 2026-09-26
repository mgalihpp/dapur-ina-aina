export type ProductStatus = "In Stock" | "Out of Stock";

export type AdminProduct = {
	id: number;
	name: string;
	image: string;
	status: ProductStatus;
	productId: string;
	quantity: number;
	stokMinimal: number;
	price: number;
	kategoriId: number;
	kategori: string;
};

export type DeleteTarget = AdminProduct | null;

export type ProductFormMode = "add" | "edit";

export type ProductFormValues = {
	name: string;
	kategoriId: string;
	price: string;
	stok: string;
	stokMinimal: string;
	gambar: string;
};

export type ImageSource = "capture" | "library";
