import { LoginForm } from "./LoginForm";
import LoginIllustration from "./LoginIllustration";
import { SocialButtons } from "./SocialButtons";

export function LoginPage() {
	return (
		<main className="min-h-dvh bg-white text-neutral-900">
			<div className="mx-auto grid min-h-dvh w-full max-w-6xl grid-cols-1 lg:grid-cols-2">
				<section className="hidden items-center justify-center p-8 sm:flex lg:border-r lg:border-neutral-200">
					<LoginIllustration />
				</section>
				<section className="flex items-center justify-center px-6 py-10 sm:hidden">
					<div className="w-full max-w-[280px]">
						<LoginIllustration />
					</div>
				</section>

				<section className="flex items-start justify-center px-6 pb-12 pt-2 sm:items-center sm:py-12">
					<div className="w-full max-w-sm">
						<LoginForm />

						<div className="my-6 flex items-center gap-3 text-sm text-neutral-400">
							<span className="h-px flex-1 bg-neutral-200" />
							Atau
							<span className="h-px flex-1 bg-neutral-200" />
						</div>

						<SocialButtons />

						<p className="mt-6 text-center text-sm text-neutral-500">
							Belum punya akun?{" "}
							<a
								href="/login"
								className="font-semibold text-[#EF7D1A] hover:text-[#E06F00]"
							>
								Daftar
							</a>
						</p>
					</div>
				</section>
			</div>
		</main>
	);
}
