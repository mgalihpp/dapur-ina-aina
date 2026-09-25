import { create } from "zustand";

type PosQuantityInput = {
	productId: number;
	quantity: number;
	stock: number;
};

type PosStore = {
	cart: Map<number, number>;
	category: string;
	search: string;
	createdId: number | null;
	setCategory: (category: string) => void;
	setSearch: (search: string) => void;
	setQuantity: (input: PosQuantityInput) => void;
	setCreatedId: (createdId: number | null) => void;
	clearCart: () => void;
	reset: () => void;
};

export const usePosStore = create<PosStore>()((set) => ({
	cart: new Map(),
	category: "all",
	search: "",
	createdId: null,
	setCategory: (category) => set({ category }),
	setSearch: (search) => set({ search }),
	setQuantity: ({ productId, quantity, stock }) =>
		set((state) => {
			const cart = new Map(state.cart);
			if (quantity <= 0) cart.delete(productId);
			else cart.set(productId, Math.min(quantity, stock));
			return { cart, createdId: null };
		}),
	setCreatedId: (createdId) => set({ createdId }),
	clearCart: () => set({ cart: new Map() }),
	reset: () =>
		set({ cart: new Map(), category: "all", search: "", createdId: null }),
}));
