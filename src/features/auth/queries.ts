import { queryOptions } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import { getSession } from "@/server/auth-functions";

export const sessionQueryOptions = () =>
	queryOptions({
		queryKey: qk.auth.session,
		queryFn: () => getSession(),
	});
