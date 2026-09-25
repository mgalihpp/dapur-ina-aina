import { createFileRoute } from "@tanstack/react-router";
import { ReportsView } from "@/features/reports";

export const Route = createFileRoute("/admin/reports/")({
	component: ReportsView,
});
