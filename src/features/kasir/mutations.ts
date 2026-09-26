import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invalidateKeys } from "@/features/shared/lib/invalidate";
import { dataQueryFn } from "@/lib/query-helpers";
import { qk } from "@/lib/query-keys";
import { bebaskanMeja } from "@/server/meja-functions";

const bebaskanMejaFn = dataQueryFn(bebaskanMeja);

/** Bebaskan meja eksplisit (tamu pergi). Pesanan selesai tidak otomatis membebaskan. */
export function useBebaskanMeja() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: bebaskanMejaFn,
		onSuccess: () => {
			invalidateKeys(queryClient, [qk.tables.root]);
			toast.success("Meja dibebaskan.");
		},
	});
}
