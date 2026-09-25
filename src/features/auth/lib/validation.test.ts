import { expect, test } from "bun:test";
import { loginMethodFor } from "./validation";

test("chooses username login for identifiers without an at sign", () => {
	expect(loginMethodFor("aina-kasir")).toBe("username");
});

test("chooses email login for identifiers with an at sign", () => {
	expect(loginMethodFor("kasir@example.com")).toBe("email");
});
