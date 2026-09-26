type TableIconProps = {
	className?: string;
};

/** Ikon meja resto tampak atas: meja bundar dikelilingi empat kursi. */
export function TableIcon({ className }: TableIconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden
			className={className}
		>
			<circle cx="12" cy="12" r="4" />
			<rect x="9.5" y="2" width="5" height="3.5" rx="1" />
			<rect x="9.5" y="18.5" width="5" height="3.5" rx="1" />
			<rect x="2" y="10" width="3.5" height="4" rx="1" />
			<rect x="18.5" y="10" width="3.5" height="4" rx="1" />
		</svg>
	);
}
