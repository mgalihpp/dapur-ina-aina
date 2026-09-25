import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { id as localeId } from "react-day-picker/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	addDays,
	fmtDay,
	fmtDayShort,
	mondayOf,
	sameDay,
} from "../lib/periode";

export type Rentang = { from: Date; to: Date };

type PeriodePickerProps = {
	range: Rentang;
	onApply: (range: Rentang) => void;
};

type ShortcutDef = {
	id: string;
	label: string;
	pick: (now: Date) => Rentang;
};

function startOfDay(d: Date): Date {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Rentang bebas — tidak terikat minggu/bulan (periode kustom tidak disimpan).
const SHORTCUTS: ShortcutDef[] = [
	{
		id: "today",
		label: "Hari ini",
		pick: (n) => ({ from: startOfDay(n), to: startOfDay(n) }),
	},
	{
		id: "yesterday",
		label: "Kemarin",
		pick: (n) => ({
			from: addDays(startOfDay(n), -1),
			to: addDays(startOfDay(n), -1),
		}),
	},
	{
		id: "last-7",
		label: "7 hari terakhir",
		pick: (n) => ({ from: addDays(startOfDay(n), -6), to: startOfDay(n) }),
	},
	{
		id: "this-week",
		label: "Minggu ini",
		pick: (n) => ({ from: mondayOf(n), to: startOfDay(n) }),
	},
	{
		id: "last-week",
		label: "Minggu lalu",
		pick: (n) => ({
			from: addDays(mondayOf(n), -7),
			to: addDays(mondayOf(n), -1),
		}),
	},
	{
		id: "this-month",
		label: "Bulan ini",
		pick: (n) => ({
			from: new Date(n.getFullYear(), n.getMonth(), 1),
			to: startOfDay(n),
		}),
	},
	{
		id: "last-month",
		label: "Bulan lalu",
		pick: (n) => ({
			from: new Date(n.getFullYear(), n.getMonth() - 1, 1),
			to: new Date(n.getFullYear(), n.getMonth(), 0),
		}),
	},
	{
		id: "last-30",
		label: "30 hari terakhir",
		pick: (n) => ({ from: addDays(startOfDay(n), -29), to: startOfDay(n) }),
	},
];

export function rangeLabel(range: Rentang): string {
	if (sameDay(range.from, range.to)) return fmtDay.format(range.from);
	return `${fmtDayShort.format(range.from)} – ${fmtDay.format(range.to)}`;
}

export function PeriodePicker({ range, onApply }: PeriodePickerProps) {
	const [open, setOpen] = useState(false);
	const [temp, setTemp] = useState<DateRange | undefined>(range);
	const [activeShot, setActiveShot] = useState<string | null>(null);

	const picked: Rentang = {
		from: temp?.from ?? range.from,
		to: temp?.to ?? temp?.from ?? range.to,
	};

	return (
		<Popover
			open={open}
			onOpenChange={(next) => {
				if (next) {
					setTemp(range);
					setActiveShot(null);
				}
				setOpen(next);
			}}
		>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-200"
				>
					<CalendarIcon className="size-4 shrink-0" />
					{rangeLabel(range)}
				</button>
			</PopoverTrigger>
			<PopoverContent
				className="w-auto max-w-[calc(100vw-2rem)] p-4"
				align="start"
			>
				<div className="flex flex-col gap-4 sm:flex-row">
					<div className="flex flex-row gap-1 overflow-x-auto border-b border-neutral-100 pb-3 sm:w-44 sm:shrink-0 sm:flex-col sm:overflow-visible sm:border-r sm:border-b-0 sm:pb-0 sm:pr-3">
						{SHORTCUTS.map((s) => (
							<button
								key={s.id}
								type="button"
								onClick={() => {
									const r = s.pick(new Date());
									setTemp({ from: r.from, to: r.to });
									setActiveShot(s.id);
								}}
								className={`whitespace-nowrap rounded-lg px-4 py-1.5 text-left text-sm font-semibold transition sm:whitespace-normal ${
									activeShot === s.id
										? "bg-[#EF7D1A] text-white shadow-sm"
										: "text-neutral-500 hover:text-neutral-700"
								}`}
							>
								{s.label}
							</button>
						))}
					</div>
					<div className="min-w-0">
						<div className="grid grid-cols-2 gap-3">
							<label className="block">
								<span className="text-xs font-semibold text-neutral-500">
									Mulai
								</span>
								<input
									readOnly
									tabIndex={-1}
									value={temp?.from ? fmtDay.format(temp.from) : "—"}
									className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none"
								/>
							</label>
							<label className="block">
								<span className="text-xs font-semibold text-neutral-500">
									Selesai
								</span>
								<input
									readOnly
									tabIndex={-1}
									value={temp?.to ? fmtDay.format(temp.to) : "—"}
									className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none"
								/>
							</label>
						</div>
						<div className="max-w-[calc(100vw-4rem)] overflow-x-auto">
							<Calendar
								mode="range"
								locale={localeId}
								selected={temp}
								onSelect={(r) => {
									setTemp(r);
									setActiveShot(null);
								}}
								numberOfMonths={2}
							/>
						</div>
						<div className="mt-2 flex items-center justify-end gap-2 border-t border-neutral-100 pt-3">
							<div className="flex shrink-0 gap-2">
								<Button variant="ghost" onClick={() => setOpen(false)}>
									Batal
								</Button>
								<Button
									onClick={() => {
										onApply(picked);
										setOpen(false);
									}}
								>
									Terapkan
								</Button>
							</div>
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
