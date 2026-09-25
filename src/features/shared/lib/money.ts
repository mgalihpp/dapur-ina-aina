export function toMinorUnits(value: string): bigint {
	if (!/^\d+(\.\d{1,2})?$/.test(value))
		throw new Error("Nominal uang tidak valid.");
	const [whole, fraction = ""] = value.split(".");
	return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
}

export function fromMinorUnits(value: bigint): string {
	const whole = value / 100n;
	const fraction = String(value % 100n).padStart(2, "0");
	return `${whole}.${fraction}`;
}

export function sumMoneyLines(
	lines: { price: string; quantity: number }[],
): string {
	const total = lines.reduce(
		(sum, line) => sum + toMinorUnits(line.price) * BigInt(line.quantity),
		0n,
	);
	return fromMinorUnits(total);
}
