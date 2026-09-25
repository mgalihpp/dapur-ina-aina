import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { QueryProgressBar } from "../components/QueryProgressBar";
import { QueryProvider } from "../lib/query-client";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Dapur Ina Aina",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/logo.png",
				type: "image/jpeg",
			},
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang="id"
			data-theme="light"
			className="light"
			style={{ colorScheme: "light" }}
			suppressHydrationWarning
		>
			<head>
				<HeadContent />
			</head>
			<body className="font-sans antialiased">
				<QueryProvider>
					{children}
					<QueryProgressBar />
					<TanStackDevtools
						config={{
							position: "bottom-right",
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
							{
								name: "Tanstack Query",
								render: <ReactQueryDevtoolsPanel />,
							},
						]}
					/>
				</QueryProvider>
				<Scripts />
			</body>
		</html>
	);
}
