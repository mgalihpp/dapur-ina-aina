import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type SearchSelectOption = {
	value: string;
	label: string;
	hint?: string;
};

type SearchSelectProps = {
	value: string;
	onChange: (value: string) => void;
	options: SearchSelectOption[];
	placeholder?: string;
	searchPlaceholder?: string;
	emptyText?: string;
	ariaLabel?: string;
	disabled?: boolean;
	className?: string;
	id?: string;
};

/**
 * Dialog modal mengunci scroll halaman dan mematikan event wheel di luar
 * konten dialog, padahal popover dirender di luar dialog. Listener native ini
 * berjalan sebelum pengunci itu sehingga wheel di popover tetap menggulir
 * daftar. Di luar dialog modal tidak melakukan apa-apa.
 */
function guardWheel(event: WheelEvent) {
	if (!document.body.hasAttribute("data-scroll-locked")) return;
	const target = event.currentTarget;
	if (!(target instanceof HTMLElement)) return;
	const list = target.querySelector("[cmdk-list]");
	if (!(list instanceof HTMLElement)) return;
	event.preventDefault();
	event.stopPropagation();
	const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
	list.scrollTop += delta;
}

/** Pengganti Select dengan kolom cari. Nilai "" berarti belum dipilih. */
export function SearchSelect({
	value,
	onChange,
	options,
	placeholder = "Pilih…",
	searchPlaceholder = "Cari…",
	emptyText = "Tidak ada hasil.",
	ariaLabel,
	disabled = false,
	className,
	id,
}: SearchSelectProps) {
	const [open, setOpen] = useState(false);
	const selected = options.find((option) => option.value === value);

	function attachWheelGuard(node: HTMLDivElement | null) {
		if (!node) return;
		node.addEventListener("wheel", guardWheel, { passive: false });
		return () => {
			node.removeEventListener("wheel", guardWheel);
		};
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					id={id}
					variant="outline"
					role="combobox"
					aria-expanded={open}
					aria-label={ariaLabel}
					disabled={disabled}
					className={cn(
						"justify-between font-normal",
						!selected && "text-muted-foreground",
						className,
					)}
				>
					<span className="truncate">
						{selected ? selected.label : placeholder}
					</span>
					<ChevronsUpDown className="size-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				ref={attachWheelGuard}
				className="w-auto max-w-[calc(100vw-2rem)] p-0 min-w-[var(--radix-popover-trigger-width)]"
				align="start"
			>
				<Command>
					<CommandInput placeholder={searchPlaceholder} />
					<CommandList className="max-h-72 overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-300">
						<CommandEmpty>{emptyText}</CommandEmpty>
						<CommandGroup>
							{options.map((option) => (
								<CommandItem
									key={option.value}
									value={`${option.label} ${option.hint ?? ""}`}
									className="[&>svg:last-child]:hidden"
									onSelect={() => {
										onChange(option.value);
										setOpen(false);
									}}
								>
									<Check
										className={cn(
											"size-4",
											value === option.value ? "opacity-100" : "opacity-0",
										)}
									/>
									<span className="truncate">{option.label}</span>
									{option.hint ? (
										<span className="ml-auto shrink-0 text-xs text-muted-foreground">
											{option.hint}
										</span>
									) : null}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
