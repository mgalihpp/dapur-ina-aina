function shortLabel(nama: string): string {
	const match = nama.match(/(\d+)\s*$/);
	return match?.[1] ?? nama.slice(0, 4);
}

export function MejaPlan({
	nama,
	label,
	disabled,
	ring,
	onSelect,
}: {
	nama: string;
	label: string;
	disabled?: boolean;
	ring?: "orange" | "red" | null;
	onSelect?: () => void;
}) {
	const ringClass =
		ring === "orange"
			? "ring-2 ring-[#F97316] ring-offset-2 ring-offset-white"
			: ring === "red"
				? "ring-2 ring-red-400 ring-offset-2 ring-offset-white"
				: disabled
					? ""
					: "hover:ring-2 hover:ring-neutral-200 hover:ring-offset-2 hover:ring-offset-white";
	return (
		<button
			type="button"
			onClick={onSelect}
			disabled={disabled ?? !onSelect}
			aria-label={label}
			className={`relative mx-auto flex h-36 w-36 items-center justify-center rounded-2xl transition outline-none ${disabled ? "cursor-not-allowed opacity-60" : ringClass}`}
		>
			<span
				aria-hidden
				className="absolute top-1 left-1/2 h-7 w-10 -translate-x-1/2 rounded-md border border-neutral-300 bg-white"
			/>
			<span
				aria-hidden
				className="absolute bottom-1 left-1/2 h-7 w-10 -translate-x-1/2 rounded-md border border-neutral-300 bg-white"
			/>
			<span
				aria-hidden
				className="absolute top-1/2 left-1 h-10 w-7 -translate-y-1/2 rounded-md border border-neutral-300 bg-white"
			/>
			<span
				aria-hidden
				className="absolute top-1/2 right-1 h-10 w-7 -translate-y-1/2 rounded-md border border-neutral-300 bg-white"
			/>
			<span
				aria-hidden
				className={`flex h-20 w-20 items-center justify-center rounded-full border-2 text-lg font-bold ${
					ring === "orange"
						? "border-[#F97316] bg-[#F97316]/10 text-[#F97316]"
						: ring === "red"
							? "border-red-400 bg-red-50 text-red-600"
							: "border-neutral-300 bg-white text-neutral-700"
				}`}
			>
				{shortLabel(nama)}
			</span>
		</button>
	);
}
