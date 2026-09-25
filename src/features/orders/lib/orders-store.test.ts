import { beforeEach, describe, expect, test } from "bun:test";
import { useOrdersStore } from "./orders-store";

beforeEach(() => {
	useOrdersStore.setState({
		method: "tunai",
		amount: "",
		invoiceOpen: false,
	});
});

describe("orders store", () => {
	test("replaces the full payment draft when the selected order changes", () => {
		const store = useOrdersStore.getState();
		store.setPaymentDraft({ method: "non_tunai", amount: "50000" });
		store.setPaymentDraft({ method: "tunai", amount: "" });

		expect(useOrdersStore.getState()).toMatchObject({
			method: "tunai",
			amount: "",
		});
	});

	test("resets payment and invoice state when the staff session ends", () => {
		const store = useOrdersStore.getState();
		store.setPaymentDraft({ method: "non_tunai", amount: "125.50" });
		store.setInvoiceOpen(true);

		store.reset();

		expect(useOrdersStore.getState()).toMatchObject({
			method: "tunai",
			amount: "",
			invoiceOpen: false,
		});
	});
});
