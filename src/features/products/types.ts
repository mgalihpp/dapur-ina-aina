export type ProductStatus = "In Stock" | "Out of Stock";

export type AdminProduct = {
	id: string;
	name: string;
	image: string;
	status: ProductStatus;
	productId: string;
	quantity: number;
	price: number;
};

export type DeleteTarget = AdminProduct | null;

export type ProductFormMode = "add" | "edit";

export type ProductFormValues = {
	name: string;
	unit: string;
	category: string;
	price: string;
	status: "" | ProductStatus;
	productId: string;
	imagePreview: string | null;
};

export type ImageSource = "capture" | "library";
