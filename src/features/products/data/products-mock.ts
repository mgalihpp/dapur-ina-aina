import type { AdminProduct } from "../types";

const IMAGE_BY_NAME: Record<string, string> = {
	"Grill Sandwich": "/menu/grill-sandwich.jpg",
	"Chicken Popeyes": "/menu/chicken-popeyes.jpg",
	"Bison Burgers": "/menu/bison-burgers.jpg",
};

function row(
	id: string,
	name: string,
	productId: string,
	quantity: number,
	price: number,
): AdminProduct {
	return {
		id,
		name,
		image: IMAGE_BY_NAME[name] ?? "/logo.jfif",
		status: quantity > 0 ? "In Stock" : "Out of Stock",
		productId,
		quantity,
		price,
	};
}

export const PRODUCTS_MOCK: AdminProduct[] = [
	row("row-1", "Grill Sandwich", "66758941", 50, 20),
	row("row-2", "Chicken Popeyes", "67869052", 40, 30),
	row("row-3", "Bison Burgers", "68970163", 40, 40),
	row("row-4", "Grill Sandwich", "66758941", 50, 20),
	row("row-5", "Chicken Popeyes", "67869052", 40, 30),
	row("row-6", "Bison Burgers", "68970163", 40, 40),
	row("row-7", "Grill Sandwich", "66758941", 50, 20),
];
