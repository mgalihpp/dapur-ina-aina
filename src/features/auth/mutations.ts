import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { qk } from "@/lib/query-keys";
import { getSession } from "@/server/auth-functions";

export type SignInInput = {
	identifier: string;
	password: string;
};

export function useSignInMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ identifier, password }: SignInInput) => {
			const isEmail = identifier.includes("@");
			const result = isEmail
				? await authClient.signIn.email({ email: identifier, password })
				: await authClient.signIn.username({ username: identifier, password });

			if (result.error) {
				throw new Error("Username/email atau kata sandi salah. Coba lagi.");
			}

			const session = await getSession();
			if (!session) throw new Error("Sesi tidak ditemukan. Coba lagi.");
			return session;
		},
		onSuccess: (session) => {
			queryClient.setQueryData(qk.auth.session, session);
			toast.success("Berhasil masuk.");
		},
	});
}

export function useSignOutMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			await authClient.signOut();
			await queryClient.cancelQueries();
			queryClient.clear();
		},
		onSuccess: () => {
			queryClient.removeQueries({ queryKey: qk.auth.root });
			toast.success("Berhasil keluar.");
		},
		onError: () => {
			toast.error("Gagal keluar. Coba lagi.");
		},
	});
}
