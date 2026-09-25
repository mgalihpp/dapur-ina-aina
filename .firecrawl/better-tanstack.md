Toggle theme

[readme](https://better-auth.com/)

[docs](https://better-auth.com/docs)

products

[enterprise](https://better-auth.com/enterprise)

resources

[sign-in](https://dash.better-auth.com/sign-in)

Latest Version

1.7.6

Search `⌘K`

Get Started

Concepts

Authentication

Databases

Integrations

Full Stack

[Astro](https://better-auth.com/docs/integrations/astro) [React Router v7](https://better-auth.com/docs/integrations/react-router) [Next](https://better-auth.com/docs/integrations/next) [Nuxt](https://better-auth.com/docs/integrations/nuxt) [Electron](https://better-auth.com/docs/integrations/electron) [SvelteKit](https://better-auth.com/docs/integrations/svelte-kit) [SolidStart](https://better-auth.com/docs/integrations/solid-start) [TanStack Start](https://better-auth.com/docs/integrations/tanstack) [Waku](https://better-auth.com/docs/integrations/waku)

Backend

[Hono](https://better-auth.com/docs/integrations/hono) [Fastify](https://better-auth.com/docs/integrations/fastify) [Encore](https://better-auth.com/docs/integrations/encore) [Express](https://better-auth.com/docs/integrations/express) [Elysia](https://better-auth.com/docs/integrations/elysia) [Nitro](https://better-auth.com/docs/integrations/nitro) [NestJS](https://better-auth.com/docs/integrations/nestjs) [Convex](https://better-auth.com/docs/integrations/convex)

Mobile & Desktop

[Expo](https://better-auth.com/docs/integrations/expo) [Lynx](https://better-auth.com/docs/integrations/lynx)

Infrastructure

Plugins

Guides

AI Resources

Reference

[GitHub](https://github.com/better-auth/better-auth)

Toggle theme

TanStack Start IntegrationQuick Start

# TanStack Start Integration

Integrate Better Auth with TanStack Start.

Copy MDOpen in

This integration guide is assuming you are using TanStack Start.

Before you start, make sure you have a Better Auth instance configured. If you haven't done that yet, check out the [installation](https://better-auth.com/docs/installation).

## [Quick Start](https://better-auth.com/docs/integrations/tanstack\#quick-start)

You can create a new TanStack Start project with Better Auth integrated using the following command. This CLI sets up a project with an auth instance configured with the plugin and mounted handlers.

npm

pnpm

yarn

bun

```
npm create @tanstack/start

◇  What add-ons would you like for your project?
│  Better Auth
```

## [Usage](https://better-auth.com/docs/integrations/tanstack\#usage)

### [Mount the handler](https://better-auth.com/docs/integrations/tanstack\#mount-the-handler)

We need to mount the handler to a TanStack API endpoint/Server Route.
Create a new file: `/src/routes/api/auth/$.ts`

src/routes/api/auth/$.ts

```
import { auth } from '@/lib/auth'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/auth/$')({
    server: {
        handlers: {
            GET: async ({ request }:{ request: Request }) => {
                return await auth.handler(request)
            },
            POST: async ({ request }:{ request: Request }) => {
                return await auth.handler(request)
            },
        },
    },
})
```

### [Usage tips](https://better-auth.com/docs/integrations/tanstack\#usage-tips)

- We recommend using the client SDK or `authClient` to handle authentication, rather than server actions with `auth.api`.
- When you call functions that need to set cookies (like `signInEmail` or `signUpEmail`), you'll need to handle cookie setting for TanStack Start. Better Auth provides a `tanstackStartCookies` plugin to automatically handle this for you.

For React (TanStack Start with React):

src/lib/auth.ts

```
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";

export const auth = betterAuth({
    //...your config
    plugins: [tanstackStartCookies()] // make sure this is the last plugin in the array
})
```

For Solid.js (TanStack Start with Solid):

src/lib/auth.ts

```
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start/solid";

export const auth = betterAuth({
    //...your config
    plugins: [tanstackStartCookies()] // make sure this is the last plugin in the array
})
```

Now, when you call functions that set cookies, they will be automatically set using TanStack Start's cookie handling system.

```
import { auth } from "@/lib/auth"

const signIn = async () => {
    await auth.api.signInEmail({
        body: {
            email: "user@email.com",
            password: "password",
        }
    })
}
```

### [Protecting Resources](https://better-auth.com/docs/integrations/tanstack\#protecting-resources)

To protect resources that require authentication, use `beforeLoad` with a server function. This ensures authentication is checked on every navigation, including client-side navigation via `<Link>` components.

First, create server-side helpers to check the session:

src/lib/auth.functions.ts

```
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    return session;
});

export const ensureSession = createServerFn({ method: "GET" }).handler(async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) {
        throw new Error("Unauthorized");
    }

    return session;
});
```

#### [Protecting Routes](https://better-auth.com/docs/integrations/tanstack\#protecting-routes)

Use `beforeLoad` in your route definitions:

src/routes/dashboard.tsx

```
import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSession } from '@/lib/auth.functions'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const session = await getSession();

    if (!session) {
      throw redirect({ to: "/login" });
    }

    return { user: session.user };
  },
  component: Dashboard,
})

function Dashboard() {
  const { user } = Route.useRouteContext();

  return <div>Welcome, {user.name}!</div>
}
```

#### [Protecting Multiple Routes (Layout)](https://better-auth.com/docs/integrations/tanstack\#protecting-multiple-routes-layout)

For protecting multiple routes, use a pathless layout route:

src/routes/\_protected.tsx

```
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { getSession } from '@/lib/auth.functions'

export const Route = createFileRoute('/_protected')({
  beforeLoad: async ({ location }) => {
    const session = await getSession();

    if (!session) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }

    return { user: session.user };
  },
  component: () => <Outlet />,
})
```

Then nest protected routes under `_protected`:

src

routes

\_protected

dashboard.tsx

settings.tsx

\_protected.tsx

login.tsx

#### [Protecting Server Functions](https://better-auth.com/docs/integrations/tanstack\#protecting-server-functions)

Use `ensureSession` helper to protect server functions:

src/lib/posts.functions.ts

```
import { createServerFn } from "@tanstack/react-start";
import { ensureSession } from "./auth.functions";

export const createPost = createServerFn({ method: "POST" })
  .inputValidator((data: { title: string }) => data)
  .handler(async ({ data }) => {
    const session = await ensureSession();
    const post = await db.posts.create({
      title: data.title,
      authorId: session.user.id,
    });

    return post;
  });
```

[Edit on GitHub](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/integrations/tanstack.mdx)

[SolidStart Integration\\
\\
Integrate Better Auth with SolidStart.](https://better-auth.com/docs/integrations/solid-start) [Waku Integration\\
\\
Integrate Better Auth with Waku.](https://better-auth.com/docs/integrations/waku)

### On this page

[Quick Start](https://better-auth.com/docs/integrations/tanstack#quick-start) [Usage](https://better-auth.com/docs/integrations/tanstack#usage) [Mount the handler](https://better-auth.com/docs/integrations/tanstack#mount-the-handler) [Usage tips](https://better-auth.com/docs/integrations/tanstack#usage-tips) [Protecting Resources](https://better-auth.com/docs/integrations/tanstack#protecting-resources) [Protecting Routes](https://better-auth.com/docs/integrations/tanstack#protecting-routes) [Protecting Multiple Routes (Layout)](https://better-auth.com/docs/integrations/tanstack#protecting-multiple-routes-layout) [Protecting Server Functions](https://better-auth.com/docs/integrations/tanstack#protecting-server-functions)

Ask AI `⌘I`