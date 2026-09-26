import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invalidation, qk } from "@/lib/query-keys";
import { createPublicOrder } from "@/server/public-functions";
import type { PublicOrderInput } from "@/server/validators";

export function useCreatePublicOrderMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: PublicOrderInput) => createPublicOrder({ data: input }),
		onSuccess: async () => {
			toast.success("Pesanan dibuat.");
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: qk.public.orderRoot }),
				queryClient.invalidateQueries({ queryKey: invalidation.stock }),
				queryClient.invalidateQueries({ queryKey: invalidation.orders }),
				queryClient.invalidateQueries({ queryKey: invalidation.dashboard }),
				queryClient.invalidateQueries({ queryKey: qk.tables.root }),
			]);
		},
	});
}
