export function OrderDetailEmpty() {
	return (
		<section className="flex h-full min-h-0 flex-1 items-center justify-center rounded-2xl border border-neutral-100 bg-white shadow-sm">
			<div className="flex flex-col items-center px-8 text-center">
				<svg
					width="180"
					height="140"
					viewBox="0 0 180 140"
					fill="none"
					aria-hidden="true"
				>
					<ellipse cx="90" cy="122" rx="62" ry="8" fill="#F5F6F8" />
					<path
						d="M38 96h104"
						stroke="#E5E7EB"
						strokeWidth="5"
						strokeLinecap="round"
					/>
					<path
						d="M48 96a42 42 0 0 1 84 0"
						stroke="#E5E7EB"
						strokeWidth="5"
						strokeLinecap="round"
					/>
					<circle cx="90" cy="46" r="5" fill="#EF7D1A" />
					<rect
						x="112"
						y="52"
						width="40"
						height="52"
						rx="6"
						fill="#fff"
						stroke="#E5E7EB"
						strokeWidth="3"
					/>
					<path
						d="M119 63h26M119 72h26M119 81h18"
						stroke="#E5E7EB"
						strokeWidth="3"
						strokeLinecap="round"
					/>
					<path
						d="M119 90h12"
						stroke="#EF7D1A"
						strokeWidth="3"
						strokeLinecap="round"
					/>
				</svg>
				<p className="mt-4 text-sm text-neutral-400">
					Tidak Ada Detail Pesanan
				</p>
				<p className="mt-1 text-xs text-neutral-300">
					Pilih pesanan di kiri untuk melihat detail
				</p>
			</div>
		</section>
	);
}
