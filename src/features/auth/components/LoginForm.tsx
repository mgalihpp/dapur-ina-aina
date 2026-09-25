import { useNavigate } from "@tanstack/react-router";
import { AtSign, Lock } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { userRoleOf } from "@/lib/roles";
import { getSession } from "@/server/auth-functions";
import { isValidEmail } from "../lib/validation";

export function LoginForm() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		if (!isValidEmail(email.trim())) {
			setError("Masukkan alamat email yang valid.");
			return;
		}
		if (password.length < 8) {
			setError("Kata sandi minimal 8 karakter.");
			return;
		}
		setPending(true);
		try {
			const res = await authClient.signIn.email({
				email: email.trim(),
				password,
			});
			if (res.error) {
				setError("Email atau kata sandi salah. Coba lagi.");
				return;
			}
			const session = await getSession();
			const role = userRoleOf(session?.user);
			await navigate({
				to: role === "admin" ? "/admin" : role === "kasir" ? "/kasir" : "/",
			});
		} catch {
			setError("Email atau kata sandi salah. Coba lagi.");
		} finally {
			setPending(false);
		}
	}

	return (
		<div className="w-full max-w-sm">
			<h1 className="mb-8 text-center text-3xl font-bold tracking-tight text-neutral-900">
				Selamat Datang Kembali!
			</h1>

			<form onSubmit={onSubmit} noValidate className="space-y-4">
				<label className="block">
					<span className="sr-only">Alamat Email</span>
					<span className="relative block">
						<AtSign
							aria-hidden
							className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#EF7D1A]"
						/>
						<input
							type="email"
							autoComplete="email"
							placeholder="Alamat Email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							className="w-full rounded-lg border border-neutral-300 bg-white py-3 pl-11 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#EF7D1A] focus:outline-none focus:ring-2 focus:ring-[#EF7D1A]/30"
						/>
					</span>
				</label>

				<label className="block">
					<span className="sr-only">Kata Sandi</span>
					<span className="relative block">
						<Lock
							aria-hidden
							className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#EF7D1A]"
						/>
						<input
							type="password"
							autoComplete="current-password"
							placeholder="Kata Sandi"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							className="w-full rounded-lg border border-neutral-300 bg-white py-3 pl-11 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#EF7D1A] focus:outline-none focus:ring-2 focus:ring-[#EF7D1A]/30"
						/>
					</span>
				</label>

				{error ? (
					<p
						role="alert"
						className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700"
					>
						{error}
					</p>
				) : null}

				<div className="flex justify-end">
					<a
						href="/login"
						className="text-sm font-medium text-[#EF7D1A] hover:text-[#E06F00]"
					>
						Lupa Kata Sandi?
					</a>
				</div>

				<button
					type="submit"
					disabled={pending}
					className="w-full rounded-lg bg-[#EF7D1A] py-3 text-sm font-semibold text-white transition hover:bg-[#E06F00] disabled:cursor-not-allowed disabled:opacity-60"
				>
					{pending ? "Sedang masuk..." : "Masuk"}
				</button>
			</form>
		</div>
	);
}
