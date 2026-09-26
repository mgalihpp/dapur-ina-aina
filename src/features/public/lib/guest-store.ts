import { create } from "zustand";
import {
	createJSONStorage,
	persist,
	type StateStorage,
} from "zustand/middleware";

export const DEFAULT_GUEST_COUNT = 1;

export type GuestTable = {
	id: number;
	nama: string;
	lantai: string;
	tamu: number;
};

export type GuestCartItem = {
	productId: number;
	quantity: number;
	name: string;
	price: string;
	image: string;
	stock: number;
	category?: string;
};

export type GuestOrder = {
	id: number;
	tanggal: string;
	meja: string | null;
};

type PersistedGuestState = {
	table: GuestTable | null;
	cart: GuestCartItem[];
	orders: GuestOrder[];
};

export type GuestStore = PersistedGuestState & {
	hydrated: boolean;
	setHydrated: (hydrated: boolean) => void;
	setTable: (table: GuestTable | null) => void;
	replaceCart: (items: GuestCartItem[]) => void;
	addToCart: (item: GuestCartItem) => void;
	updateCartItem: (productId: number, quantity: number) => void;
	removeFromCart: (productId: number) => void;
	clearCart: () => void;
	addOrder: (order: GuestOrder) => void;
};

const noopStorage: StateStorage = {
	getItem: () => null,
	setItem: () => undefined,
	removeItem: () => undefined,
};

function browserStorage(): StateStorage {
	try {
		if (typeof localStorage === "undefined") return noopStorage;
		return {
			getItem: (name) => {
				try {
					return localStorage.getItem(name);
				} catch {
					return null;
				}
			},
			setItem: (name, value) => {
				try {
					localStorage.setItem(name, value);
				} catch {
					return undefined;
				}
			},
			removeItem: (name) => {
				try {
					localStorage.removeItem(name);
				} catch {
					return undefined;
				}
			},
		};
	} catch {
		return noopStorage;
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function normalizeTable(value: unknown): GuestTable | null {
	if (!isRecord(value)) return null;
	const id = Number(value.id);
	if (!Number.isInteger(id) || id <= 0) return null;
	if (typeof value.nama !== "string" || !value.nama.trim()) return null;
	const lantai =
		typeof value.lantai === "string" && value.lantai.trim()
			? value.lantai.trim()
			: "Lantai 1";
	const tamu =
		typeof value.tamu === "number" && Number.isInteger(value.tamu)
			? Math.min(Math.max(value.tamu, 1), 20)
			: DEFAULT_GUEST_COUNT;
	return { id, nama: value.nama.trim(), lantai, tamu };
}

function normalizeCartItem(value: unknown): GuestCartItem | null {
	if (!isRecord(value)) return null;
	const productId = value.productId;
	const quantity = value.quantity;
	const name = value.name;
	const price = value.price;
	const image = value.image;
	const stock = value.stock;
	if (
		typeof productId !== "number" ||
		!Number.isInteger(productId) ||
		productId <= 0 ||
		typeof quantity !== "number" ||
		!Number.isInteger(quantity) ||
		quantity <= 0 ||
		typeof name !== "string" ||
		!name.trim() ||
		typeof price !== "string" ||
		!/^\d+(\.\d{1,2})?$/.test(price) ||
		Number(price) <= 0 ||
		typeof image !== "string" ||
		typeof stock !== "number" ||
		!Number.isInteger(stock) ||
		stock <= 0
	) {
		return null;
	}
	const item: GuestCartItem = {
		productId,
		quantity: Math.min(quantity, stock),
		name: name.trim(),
		price,
		image,
		stock,
	};
	if (typeof value.category === "string" && value.category.trim()) {
		item.category = value.category.trim();
	}
	return item;
}

function normalizeCart(value: unknown): GuestCartItem[] {
	if (!Array.isArray(value)) return [];
	const byId = new Map<number, GuestCartItem>();
	for (const row of value) {
		const item = normalizeCartItem(row);
		if (!item) continue;
		const existing = byId.get(item.productId);
		if (!existing) {
			byId.set(item.productId, item);
			continue;
		}
		byId.set(item.productId, {
			...existing,
			...item,
			quantity: Math.min(item.stock, existing.quantity + item.quantity),
		});
	}
	return [...byId.values()];
}

function normalizeOrders(value: unknown): GuestOrder[] {
	if (!Array.isArray(value)) return [];
	return value
		.filter((value): value is GuestOrder => {
			if (!isRecord(value)) return false;
			return (
				typeof value.id === "number" &&
				Number.isInteger(value.id) &&
				value.id > 0 &&
				typeof value.tanggal === "string" &&
				(value.meja === null || typeof value.meja === "string")
			);
		})
		.slice(0, 50);
}

function addCartItem(
	cart: GuestCartItem[],
	input: GuestCartItem,
): GuestCartItem[] {
	const item = normalizeCartItem(input);
	if (!item) return cart;
	const existing = cart.find(
		(candidate) => candidate.productId === item.productId,
	);
	if (!existing) return [...cart, item];
	return cart.map((candidate) =>
		candidate.productId === item.productId
			? {
					...candidate,
					...item,
					quantity: Math.min(item.stock, candidate.quantity + item.quantity),
				}
			: candidate,
	);
}

export const useGuestStore = create<GuestStore>()(
	persist<GuestStore, PersistedGuestState>(
		(set) => ({
			table: null,
			cart: [],
			orders: [],
			hydrated: false,
			setHydrated: (hydrated) => set({ hydrated }),
			setTable: (table) =>
				set((state) => {
					const nextTable = normalizeTable(table);
					const tableChanged =
						nextTable === null || state.table?.id !== nextTable.id;
					return {
						table: nextTable,
						...(tableChanged ? { cart: [] } : {}),
					};
				}),
			replaceCart: (items) => set({ cart: normalizeCart(items) }),
			addToCart: (item) =>
				set((state) => ({ cart: addCartItem(state.cart, item) })),
			updateCartItem: (productId, quantity) =>
				set((state) => ({
					cart:
						!Number.isInteger(quantity) || quantity <= 0
							? state.cart.filter((item) => item.productId !== productId)
							: state.cart.map((item) =>
									item.productId === productId
										? { ...item, quantity: Math.min(quantity, item.stock) }
										: item,
								),
				})),
			removeFromCart: (productId) =>
				set((state) => ({
					cart: state.cart.filter((item) => item.productId !== productId),
				})),
			clearCart: () => set({ cart: [] }),
			addOrder: (order) =>
				set((state) => {
					if (state.orders.some((row) => row.id === order.id)) return state;
					return { orders: [order, ...state.orders].slice(0, 50) };
				}),
		}),
		{
			name: "dia-guest-store",
			storage: createJSONStorage(browserStorage),
			skipHydration: true,
			partialize: (state) => ({
				table: state.table,
				cart: state.cart,
				orders: state.orders,
			}),
			merge: (persisted, current) => {
				const value = isRecord(persisted) ? persisted : {};
				return {
					...current,
					table: normalizeTable(value.table),
					cart: normalizeCart(value.cart),
					orders: normalizeOrders(value.orders),
				};
			},
			onRehydrateStorage: () => (state) => {
				state?.setHydrated(true);
			},
		},
	),
);

export async function rehydrateGuestStore(): Promise<void> {
	if (useGuestStore.getState().hydrated) return;
	try {
		await useGuestStore.persist.rehydrate();
	} finally {
		if (!useGuestStore.getState().hydrated) {
			useGuestStore.setState({ hydrated: true });
		}
	}
}

export const selectGuestTable = (state: GuestStore) => state.table;
export const selectGuestCart = (state: GuestStore) => state.cart;
export const selectGuestOrders = (state: GuestStore) => state.orders;
export const selectGuestHydrated = (state: GuestStore) => state.hydrated;
export const selectGuestCartCount = (state: GuestStore) =>
	state.cart.reduce((count, item) => count + item.quantity, 0);
