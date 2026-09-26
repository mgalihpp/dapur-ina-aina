import { beforeEach, describe, expect, test } from "bun:test";
import {
	rehydrateGuestStore,
	selectGuestCart,
	selectGuestCartCount,
	selectGuestOrders,
	selectGuestTable,
	useGuestStore,
} from "./guest-store";

const item = {
	productId: 7,
	quantity: 2,
	name: "Nasi Goreng",
	price: "25000.00",
	image: "/nasi.jpg",
	stock: 5,
	category: "Makanan Utama",
};

beforeEach(() => {
	useGuestStore.setState({
		table: null,
		cart: [],
		orders: [],
		hydrated: true,
	});
});

describe("guest Zustand store", () => {
	test("owns table, cart, and order history through typed actions", () => {
		const table = { id: 1, nama: "Meja 1", lantai: "Lantai 1", tamu: 2 };
		const order = { id: 12, tanggal: "2026-09-25", meja: table.nama };

		useGuestStore.getState().setTable(table);
		useGuestStore.getState().addToCart(item);
		useGuestStore.getState().addToCart({ ...item, quantity: 4 });
		useGuestStore.getState().addOrder(order);

		expect(selectGuestTable(useGuestStore.getState())).toEqual(table);
		expect(selectGuestCart(useGuestStore.getState())).toEqual([
			{ ...item, quantity: 5 },
		]);
		expect(selectGuestCartCount(useGuestStore.getState())).toBe(5);
		expect(selectGuestOrders(useGuestStore.getState())).toEqual([order]);
	});

	test("defaults an invalid guest count to one", () => {
		useGuestStore.getState().setTable({
			id: 1,
			nama: "Meja 1",
			lantai: "Lantai 1",
			tamu: Number.NaN,
		});

		expect(selectGuestTable(useGuestStore.getState())?.tamu).toBe(1);
	});

	test("clears the cart when the selected table changes", () => {
		useGuestStore.getState().setTable({
			id: 1,
			nama: "Meja 1",
			lantai: "Lantai 1",
			tamu: 1,
		});
		useGuestStore.getState().addToCart(item);
		useGuestStore.getState().setTable({
			id: 2,
			nama: "Meja 2",
			lantai: "Lantai 1",
			tamu: 1,
		});

		expect(selectGuestCart(useGuestStore.getState())).toEqual([]);
	});

	test("updates, removes, and clears cart items", () => {
		const add = useGuestStore.getState().addToCart;
		add(item);
		useGuestStore.getState().updateCartItem(item.productId, 1);
		expect(selectGuestCart(useGuestStore.getState())[0]?.quantity).toBe(1);

		useGuestStore.getState().removeFromCart(item.productId);
		expect(selectGuestCart(useGuestStore.getState())).toEqual([]);

		add(item);
		useGuestStore.getState().clearCart();
		expect(selectGuestCart(useGuestStore.getState())).toEqual([]);
	});

	test("marks the store hydrated when browser storage is unavailable", async () => {
		useGuestStore.setState({ hydrated: false });
		await rehydrateGuestStore();
		expect(useGuestStore.getState().hydrated).toBe(true);
	});

	test("partializes only persisted data fields", () => {
		const state = useGuestStore.getState();
		const partialize = useGuestStore.persist.getOptions().partialize;
		expect(partialize?.(state)).toEqual({
			table: null,
			cart: [],
			orders: [],
		});
	});
});
