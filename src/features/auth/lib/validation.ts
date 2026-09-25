export function isValidEmail(value: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function loginMethodFor(identifier: string): "email" | "username" {
	return identifier.includes("@") ? "email" : "username";
}
