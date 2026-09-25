import { beforeEach, describe, expect, test } from "bun:test";
import { usePosStore } from "./pos-store";

beforeEach(() => {
	usePosStore.setState({
		cart: new Map(),
		category: "all",
		search: "",
		createdId: null,
	});
});

describe("POS store", () => {
	test("clamps quantities to stock and clears the created order after a cart change", () => {
		const store = usePosStore.getState();
		store.setQuantity({ productId: 7, quantity: 9, stock: 4 });
		store.setCreatedId(12);
		store.setQuantity({ productId: 7, quantity: 5, stock: 4 });

		expect(usePosStore.getState().cart.get(7)).toBe(4);
		expect(usePosStore.getState().createdId).toBeNull();
	});

	test("removes non-positive quantities and clears the cart after submit", () => {
		const store = usePosStore.getState();
		store.setQuantity({ productId: 7, quantity: 3, stock: 4 });
		store.setQuantity({ productId: 7, quantity: 0, stock: 4 });

		expect(usePosStore.getState().cart.has(7)).toBe(false);

		store.setQuantity({ productId: 8, quantity: 2, stock: 4 });
		store.setCreatedId(21);
		store.clearCart();

		expect(usePosStore.getState().cart.size).toBe(0);
		expect(usePosStore.getState().createdId).toBe(21);
	});

	test("resets the entire POS session when the cashier logs out", () => {
		const store = usePosStore.getState();
		store.setQuantity({ productId: 7, quantity: 2, stock: 4 });
		store.setCategory("Minuman");
		store.setSearch("es");
		store.setCreatedId(21);

		store.reset();

		expect(usePosStore.getState()).toMatchObject({
			cart: new Map(),
			category: "all",
			search: "",
			createdId: null,
		});
	});
});
