import { create } from "zustand";

type PaymentMethod = "tunai" | "non_tunai";

type PaymentDraft = {
	method: PaymentMethod;
	amount: string;
};

type OrdersStore = PaymentDraft & {
	invoiceOpen: boolean;
	setPaymentDraft: (draft: PaymentDraft) => void;
	setMethod: (method: PaymentMethod) => void;
	setAmount: (amount: string) => void;
	setInvoiceOpen: (invoiceOpen: boolean) => void;
	reset: () => void;
};

export const useOrdersStore = create<OrdersStore>()((set) => ({
	method: "tunai",
	amount: "",
	invoiceOpen: false,
	setPaymentDraft: (draft) => set(draft),
	setMethod: (method) => set({ method }),
	setAmount: (amount) => set({ amount }),
	setInvoiceOpen: (invoiceOpen) => set({ invoiceOpen }),
	reset: () => set({ method: "tunai", amount: "", invoiceOpen: false }),
}));
