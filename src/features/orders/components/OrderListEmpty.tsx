export function OrderListEmpty() {
	return (
		<div className="mt-4 flex flex-col items-center rounded-2xl border border-neutral-100 bg-white px-6 py-10 text-center shadow-sm">
			<svg
				width="180"
				height="140"
				viewBox="0 0 180 140"
				fill="none"
				aria-hidden="true"
			>
				<ellipse cx="90" cy="124" rx="62" ry="8" fill="#F5F6F8" />
				<rect
					x="58"
					y="18"
					width="64"
					height="88"
					rx="8"
					fill="#fff"
					stroke="#E5E7EB"
					strokeWidth="3"
				/>
				<rect x="74" y="10" width="32" height="12" rx="6" fill="#EF7D1A" />
				<path
					d="M68 44h44M68 56h44M68 68h30"
					stroke="#E5E7EB"
					strokeWidth="3"
					strokeLinecap="round"
				/>
				<path
					d="M68 80h20"
					stroke="#EF7D1A"
					strokeWidth="3"
					strokeLinecap="round"
				/>
				<circle cx="96" cy="92" r="3" fill="#EF7D1A" />
				<path
					d="M126 92l6 6 12-12"
					stroke="#E5E7EB"
					strokeWidth="3"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
			<p className="mt-4 text-sm font-bold text-neutral-900">
				Belum ada pesanan
			</p>
			<p className="mt-1 max-w-[260px] text-xs text-neutral-400">
				Pesanan baru yang dibuat kasir akan muncul di sini.
			</p>
		</div>
	);
}
