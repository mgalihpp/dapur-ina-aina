import { FacebookIcon, GoogleIcon } from "./BrandIcons";

export function SocialButtons() {
	return (
		<div className="grid grid-cols-2 gap-3">
			<button
				type="button"
				disabled
				title="Segera hadir"
				aria-disabled="true"
				className="flex cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white py-2.5 text-sm font-medium text-neutral-500 opacity-70"
			>
				<GoogleIcon />
				Google
			</button>
			<button
				type="button"
				disabled
				title="Segera hadir"
				aria-disabled="true"
				className="flex cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white py-2.5 text-sm font-medium text-neutral-500 opacity-70"
			>
				<FacebookIcon />
				Facebook
			</button>
		</div>
	);
}
