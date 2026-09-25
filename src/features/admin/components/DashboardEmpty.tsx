export function DashboardEmpty() {
	return (
		<div className="mt-6 flex flex-col items-center rounded-2xl border border-neutral-100 bg-white px-8 py-12 text-center shadow-sm">
			<svg
				width="200"
				height="150"
				viewBox="0 0 200 150"
				fill="none"
				aria-hidden="true"
			>
				<ellipse cx="100" cy="132" rx="70" ry="8" fill="#F5F6F8" />
				<rect
					x="118"
					y="30"
					width="52"
					height="66"
					rx="8"
					fill="#fff"
					stroke="#E5E7EB"
					strokeWidth="3"
				/>
				<path
					d="M128 78V60l8-6 8 8 8-12 8 10v18"
					stroke="#EF7D1A"
					strokeWidth="3"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<circle cx="162" cy="38" r="4" fill="#EF7D1A" />
				<path
					d="M40 108h80"
					stroke="#E5E7EB"
					strokeWidth="5"
					strokeLinecap="round"
				/>
				<path
					d="M48 108a32 32 0 0 1 64 0"
					stroke="#E5E7EB"
					strokeWidth="5"
					strokeLinecap="round"
				/>
				<path
					d="M78 78v-8a6 6 0 0 1 12 0v8"
					stroke="#EF7D1A"
					strokeWidth="3"
					strokeLinecap="round"
				/>
				<circle cx="84" cy="60" r="4" fill="#EF7D1A" />
				<rect x="52" y="118" width="28" height="6" rx="3" fill="#F5F6F8" />
				<rect x="84" y="118" width="18" height="6" rx="3" fill="#FDE9D7" />
			</svg>
			<p className="mt-4 text-base font-bold text-neutral-900">
				Belum ada penjualan pada periode ini
			</p>
		</div>
	);
}
