import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const EMPTY_ILLUSTRATION_VARIANTS = [
	"sales",
	"menu",
	"category",
	"stock",
	"orders",
	"report",
	"cart",
	"table",
	"search",
	"users",
] as const;

export type EmptyIllustrationVariant =
	(typeof EMPTY_ILLUSTRATION_VARIANTS)[number];

type EmptyIllustrationProps = {
	variant: EmptyIllustrationVariant;
	className?: string;
};

type EmptyStateSize = "sm" | "md" | "lg";
type EmptyStateSurface = "dashed" | "solid" | "plain";
type EmptyStateWidth = "full" | "content";

type EmptyStateProps = {
	variant: EmptyIllustrationVariant;
	title: string;
	description?: string;
	action?: ReactNode;
	size?: EmptyStateSize;
	surface?: EmptyStateSurface;
	width?: EmptyStateWidth;
	className?: string;
};

const sizeStyles = {
	sm: {
		shell: "gap-2 px-3 py-4",
		illustration: "h-20 w-28",
		title: "text-sm",
		description: "text-xs leading-5",
	},
	md: {
		shell: "gap-3 px-6 py-8",
		illustration: "h-28 w-40",
		title: "text-base",
		description: "text-sm leading-6",
	},
	lg: {
		shell: "gap-4 px-6 py-12 sm:px-10 sm:py-16",
		illustration: "h-36 w-52",
		title: "text-lg",
		description: "text-sm leading-6",
	},
} satisfies Record<
	EmptyStateSize,
	{
		shell: string;
		illustration: string;
		title: string;
		description: string;
	}
>;

const surfaceStyles = {
	dashed:
		"rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface-strong)]",
	solid:
		"rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] shadow-sm",
	plain: "border-0 bg-transparent shadow-none",
} satisfies Record<EmptyStateSurface, string>;

function IllustrationArt({ variant }: EmptyIllustrationProps) {
	switch (variant) {
		case "sales":
			return (
				<g>
					<rect
						x="57"
						y="28"
						width="110"
						height="96"
						rx="12"
						fill="var(--surface-strong)"
						stroke="var(--sea-ink)"
						strokeWidth="3"
					/>
					<path
						d="M76 101V78M94 101V63M112 101V84M130 101V55M148 101V72"
						stroke="var(--sea-ink)"
						strokeLinecap="round"
						strokeWidth="7"
					/>
					<path
						d="m76 70 20-18 18 8 18-22 16 10"
						stroke="var(--lagoon)"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="4"
					/>
					<circle cx="176" cy="112" r="23" fill="var(--hero-a)" />
					<circle
						cx="176"
						cy="112"
						r="15"
						fill="var(--surface-strong)"
						stroke="var(--lagoon)"
						strokeWidth="3"
					/>
					<path
						d="M176 104v9l6 4"
						stroke="var(--lagoon)"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="3"
					/>
				</g>
			);
		case "menu":
			return (
				<g>
					<circle cx="102" cy="96" r="49" fill="var(--hero-a)" />
					<circle
						cx="102"
						cy="96"
						r="36"
						fill="var(--surface-strong)"
						stroke="var(--sea-ink)"
						strokeWidth="3"
					/>
					<circle cx="102" cy="96" r="21" fill="var(--sand)" />
					<path
						d="M91 84c6-8 17-8 23 0M91 108c6 8 17 8 23 0"
						stroke="var(--lagoon)"
						strokeLinecap="round"
						strokeWidth="3"
					/>
					<path
						d="M157 57c16 2 27 14 27 30 0 17-13 30-30 30-6 0-12-2-17-5"
						stroke="var(--sea-ink)"
						strokeLinecap="round"
						strokeWidth="5"
					/>
					<circle
						cx="177"
						cy="93"
						r="18"
						fill="var(--surface-strong)"
						stroke="var(--lagoon)"
						strokeWidth="5"
					/>
					<path
						d="m191 107 13 13"
						stroke="var(--lagoon)"
						strokeLinecap="round"
						strokeWidth="5"
					/>
				</g>
			);
		case "category":
			return (
				<g>
					<path d="M56 48 105 28l49 20-49 20z" fill="var(--hero-a)" />
					<path
						d="M56 48v61l49 20V68z"
						fill="var(--surface-strong)"
						stroke="var(--sea-ink)"
						strokeWidth="3"
						strokeLinejoin="round"
					/>
					<path
						d="M105 68v61l49-20V48z"
						fill="var(--sand)"
						stroke="var(--sea-ink)"
						strokeWidth="3"
						strokeLinejoin="round"
					/>
					<path
						d="m77 58 28-11 27 11-27 11z"
						fill="var(--lagoon)"
						opacity="0.9"
					/>
					<path
						d="M76 95h18M76 108h18M115 95h18M115 108h18"
						stroke="var(--sea-ink)"
						strokeLinecap="round"
						strokeWidth="3"
					/>
					<circle
						cx="174"
						cy="112"
						r="25"
						fill="var(--surface-strong)"
						stroke="var(--lagoon)"
						strokeWidth="3"
					/>
					<path
						d="M164 112h20M174 102v20"
						stroke="var(--lagoon)"
						strokeLinecap="round"
						strokeWidth="3"
					/>
				</g>
			);
		case "stock":
			return (
				<g>
					<path d="m62 62 55-24 61 24-61 25z" fill="var(--hero-a)" />
					<path
						d="M62 62v55l55 25V87z"
						fill="var(--surface-strong)"
						stroke="var(--sea-ink)"
						strokeWidth="3"
						strokeLinejoin="round"
					/>
					<path
						d="M117 87v55l61-25V62z"
						fill="var(--sand)"
						stroke="var(--sea-ink)"
						strokeWidth="3"
						strokeLinejoin="round"
					/>
					<path
						d="M62 62 117 87l61-25M117 87v55"
						stroke="var(--lagoon)"
						strokeWidth="3"
					/>
					<path
						d="m87 48 30 13 30-13"
						stroke="var(--lagoon)"
						strokeLinecap="round"
						strokeWidth="3"
					/>
					<path
						d="M83 107h20M83 121h20"
						stroke="var(--sea-ink)"
						strokeLinecap="round"
						strokeWidth="3"
					/>
					<circle
						cx="177"
						cy="116"
						r="20"
						fill="var(--surface-strong)"
						stroke="var(--lagoon)"
						strokeWidth="3"
					/>
					<path
						d="M177 106v20M167 116h20"
						stroke="var(--lagoon)"
						strokeLinecap="round"
						strokeWidth="3"
					/>
				</g>
			);
		case "orders":
			return (
				<g>
					<path
						d="M72 24h78l22 22v89H72z"
						fill="var(--surface-strong)"
						stroke="var(--sea-ink)"
						strokeLinejoin="round"
						strokeWidth="3"
					/>
					<path
						d="M150 24v23h22"
						fill="var(--hero-a)"
						stroke="var(--sea-ink)"
						strokeLinejoin="round"
						strokeWidth="3"
					/>
					<path
						d="M88 69h45M88 83h32M88 97h38"
						stroke="var(--lagoon)"
						strokeLinecap="round"
						strokeWidth="4"
					/>
					<path
						d="m150 103 7 7 14-16"
						stroke="var(--sea-ink)"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="4"
					/>
					<path
						d="M63 135h112"
						stroke="var(--lagoon)"
						strokeLinecap="round"
						strokeWidth="4"
					/>
				</g>
			);
		case "report":
			return (
				<g>
					<rect
						x="59"
						y="27"
						width="101"
						height="112"
						rx="11"
						fill="var(--surface-strong)"
						stroke="var(--sea-ink)"
						strokeWidth="3"
					/>
					<path
						d="M78 52h62M78 66h43"
						stroke="var(--lagoon)"
						strokeLinecap="round"
						strokeWidth="4"
					/>
					<path
						d="M78 112V91M96 112V78M114 112V96M132 112V70"
						stroke="var(--sea-ink)"
						strokeLinecap="round"
						strokeWidth="7"
					/>
					<path
						d="M77 122h59"
						stroke="var(--sea-ink)"
						strokeLinecap="round"
						strokeWidth="3"
					/>
					<circle cx="175" cy="109" r="25" fill="var(--hero-a)" />
					<path
						d="M164 109h22M175 98v22"
						stroke="var(--lagoon)"
						strokeLinecap="round"
						strokeWidth="4"
					/>
				</g>
			);
		case "cart":
			return (
				<g>
					<path
						d="M54 65h124l-12 62H67z"
						fill="var(--hero-a)"
						stroke="var(--sea-ink)"
						strokeLinejoin="round"
						strokeWidth="3"
					/>
					<path
						d="M77 65 91 38h51l15 27"
						fill="var(--surface-strong)"
						stroke="var(--sea-ink)"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="3"
					/>
					<path
						d="M67 91h99M96 79l5 48M126 79l-5 48"
						stroke="var(--lagoon)"
						strokeWidth="3"
					/>
					<circle cx="91" cy="139" r="8" fill="var(--sea-ink)" />
					<circle cx="143" cy="139" r="8" fill="var(--sea-ink)" />
					<circle cx="169" cy="47" r="16" fill="var(--lagoon)" opacity="0.9" />
					<path
						d="M169 39v16M161 47h16"
						stroke="var(--surface-strong)"
						strokeLinecap="round"
						strokeWidth="3"
					/>
				</g>
			);
		case "table":
			return (
				<g>
					<ellipse
						cx="119"
						cy="65"
						rx="61"
						ry="18"
						fill="var(--hero-a)"
						stroke="var(--sea-ink)"
						strokeWidth="3"
					/>
					<path
						d="M77 66v56M161 66v56"
						stroke="var(--sea-ink)"
						strokeLinecap="round"
						strokeWidth="6"
					/>
					<path
						d="M98 126h44"
						stroke="var(--lagoon)"
						strokeLinecap="round"
						strokeWidth="5"
					/>
					<circle
						cx="120"
						cy="63"
						r="17"
						fill="var(--surface-strong)"
						stroke="var(--lagoon)"
						strokeWidth="3"
					/>
					<path
						d="M111 63h18M120 54v18"
						stroke="var(--lagoon)"
						strokeLinecap="round"
						strokeWidth="3"
					/>
					<path
						d="M51 97h19M170 97h19"
						stroke="var(--sea-ink)"
						strokeLinecap="round"
						strokeWidth="5"
					/>
				</g>
			);
		case "search":
			return (
				<g>
					<circle cx="103" cy="88" r="45" fill="var(--hero-a)" />
					<circle
						cx="103"
						cy="88"
						r="32"
						fill="var(--surface-strong)"
						stroke="var(--sea-ink)"
						strokeWidth="3"
					/>
					<circle cx="103" cy="88" r="17" fill="var(--sand)" />
					<path
						d="M91 76c7-8 17-8 24 0M91 100c7 8 17 8 24 0"
						stroke="var(--lagoon)"
						strokeLinecap="round"
						strokeWidth="3"
					/>
					<circle
						cx="169"
						cy="91"
						r="24"
						fill="var(--surface-strong)"
						stroke="var(--lagoon)"
						strokeWidth="5"
					/>
					<path
						d="m187 109 17 17"
						stroke="var(--lagoon)"
						strokeLinecap="round"
						strokeWidth="5"
					/>
				</g>
			);
		case "users":
			return (
				<g>
					<rect
						x="58"
						y="43"
						width="102"
						height="76"
						rx="13"
						fill="var(--surface-strong)"
						stroke="var(--sea-ink)"
						strokeWidth="3"
					/>
					<circle
						cx="91"
						cy="74"
						r="15"
						fill="var(--hero-a)"
						stroke="var(--lagoon)"
						strokeWidth="3"
					/>
					<circle
						cx="128"
						cy="74"
						r="15"
						fill="var(--sand)"
						stroke="var(--sea-ink)"
						strokeWidth="3"
					/>
					<path
						d="M72 103c3-12 11-18 19-18s16 6 19 18M109 103c3-12 11-18 19-18s16 6 19 18"
						fill="none"
						stroke="var(--sea-ink)"
						strokeLinecap="round"
						strokeWidth="3"
					/>
					<path
						d="M77 57h15M114 57h15"
						stroke="var(--lagoon)"
						strokeLinecap="round"
						strokeWidth="3"
					/>
					<path
						d="M174 104v-16M166 96h16"
						stroke="var(--lagoon)"
						strokeLinecap="round"
						strokeWidth="4"
					/>
				</g>
			);
		default: {
			const exhaustive: never = variant;
			return exhaustive;
		}
	}
}

export function EmptyIllustration({
	variant,
	className,
}: EmptyIllustrationProps) {
	return (
		<svg
			viewBox="0 0 240 180"
			fill="none"
			aria-hidden="true"
			focusable="false"
			className={cn("shrink-0", className)}
		>
			<ellipse cx="120" cy="160" rx="78" ry="8" fill="var(--sand)" />
			<circle cx="177" cy="32" r="27" fill="var(--hero-a)" />
			<IllustrationArt variant={variant} />
		</svg>
	);
}

export function EmptyState({
	variant,
	title,
	description,
	action,
	size = "md",
	surface = "dashed",
	width = "full",
	className,
}: EmptyStateProps) {
	const styles = sizeStyles[size];

	return (
		<div
			data-empty-state={variant}
			className={cn(
				"flex min-w-0 flex-col items-center justify-center text-center",
				width === "content" ? "w-fit" : "w-full",
				surfaceStyles[surface],
				styles.shell,
				className,
			)}
		>
			<EmptyIllustration variant={variant} className={styles.illustration} />
			<div className="flex max-w-sm flex-col items-center gap-1.5">
				<p className={cn("font-bold text-[var(--sea-ink)]", styles.title)}>
					{title}
				</p>
				{description ? (
					<p
						className={cn(
							"text-balance text-[var(--sea-ink-soft)]",
							styles.description,
						)}
					>
						{description}
					</p>
				) : null}
				{action ? <div className="mt-2">{action}</div> : null}
			</div>
		</div>
	);
}
