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

[MySQL](https://better-auth.com/docs/adapters/mysql) [SQLite](https://better-auth.com/docs/adapters/sqlite) [PostgreSQL](https://better-auth.com/docs/adapters/postgresql) [MS SQL](https://better-auth.com/docs/adapters/mssql) [Other Relational Databases](https://better-auth.com/docs/adapters/other-relational-databases)

Adapters

[Drizzle](https://better-auth.com/docs/adapters/drizzle) [Prisma](https://better-auth.com/docs/adapters/prisma) [MongoDB](https://better-auth.com/docs/adapters/mongo)

Others

[Community Adapters](https://better-auth.com/docs/adapters/community-adapters)

Integrations

Infrastructure

Plugins

Guides

AI Resources

Reference

[GitHub](https://github.com/better-auth/better-auth)

Toggle theme

PrismaInstallation

# Prisma

Integrate Better Auth with Prisma.

Copy MDOpen in

Prisma ORM is an open-source database toolkit that simplifies database access and management in applications by providing a type-safe query builder and an intuitive data modeling interface.

For an introduction to Prisma ORM, see
[Prisma getting started](https://www.prisma.io/docs/getting-started).

This guide uses Prisma 7 and PostgreSQL. If you use Prisma 6 or earlier, a
driver adapter is optional and your existing Prisma Client setup can remain
unchanged.

## [Installation](https://better-auth.com/docs/adapters/prisma\#installation)

To use the Prisma adapter, install `@better-auth/prisma-adapter`:

npm

pnpm

yarn

bun

```
npm install @better-auth/prisma-adapter
```

The example below uses Prisma 7 and PostgreSQL. If Prisma is not already
configured, follow
[Prisma's PostgreSQL quickstart](https://www.prisma.io/docs/prisma-orm/quickstart/postgresql)
before continuing.

## [Setup](https://better-auth.com/docs/adapters/prisma\#setup)

The examples below use the following project structure:

.env

prisma.config.ts

prisma

schema.prisma

src

generated

prisma

client.ts

lib

prisma.ts

auth.ts

### [Configure Prisma](https://better-auth.com/docs/adapters/prisma\#configure-prisma)

If you are starting a new Prisma project, initialize it with PostgreSQL and an
explicit Prisma Client output path:

npm

pnpm

yarn

bun

Initialize Prisma

```
npx prisma init --datasource-provider postgresql --output ../src/generated/prisma
```

This creates `prisma/schema.prisma`, `prisma.config.ts`, and `.env`. Set
`DATABASE_URL` in `.env` to your PostgreSQL connection string.

If Prisma is already configured in your project, keep your existing datasource
and output path and skip this initialization command.

Generate Prisma Client after configuring its output path:

npm

pnpm

yarn

bun

Generate Prisma Client

```
npx prisma generate
```

### [Create the Prisma client](https://better-auth.com/docs/adapters/prisma\#create-the-prisma-client)

Import `PrismaClient` from the output path configured in your Prisma schema and
pass the PostgreSQL driver adapter to it:

src/lib/prisma.ts

```
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

export const prisma = new PrismaClient({ adapter });
```

Create one `PrismaClient` instance and reuse it across your application.
Frameworks with hot reloading or serverless runtimes may require a
framework-specific lifecycle pattern.

### [Configure Better Auth](https://better-auth.com/docs/adapters/prisma\#configure-better-auth)

Pass the Prisma Client instance to the Better Auth Prisma adapter:

src/lib/auth.ts

```
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
});
```

## [Schema generation & migration](https://better-auth.com/docs/adapters/prisma\#schema-generation--migration)

The [Better Auth CLI](https://better-auth.com/docs/concepts/cli) generates the Prisma schema required
by your Better Auth configuration and plugins. Use the Prisma CLI to create and
apply a migration from the generated schema.

| Prisma Schema Generation | Prisma Schema Migration |
| --- | --- |
| ✅ Supported | ❌ Not Supported |

npm

pnpm

yarn

bun

Schema Generation

```
npx auth@latest generate
```

The Better Auth CLI updates your Prisma schema but does not apply the migration.
Use Prisma to create the database migration, then regenerate Prisma Client:

Terminal

```
npx prisma migrate dev --name add-better-auth
npx prisma generate
```

## [Joins](https://better-auth.com/docs/adapters/prisma\#joins)

Database joins are useful when Better-Auth needs to fetch related data from multiple tables in a single query.
Endpoints like `/get-session`, `/get-full-organization` and many others benefit greatly from this feature,
seeing upwards of 2x to 3x performance improvements depending on database latency.

The Prisma adapter supports joins out of the box since version `1.4.0`.
To enable this feature, set `advanced.database.joins` to `true` in your auth configuration.

auth.ts

```
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  advanced: {
    database: {
      joins: true,
    },
  },
});
```

Please make sure that your Prisma schema has the necessary relations defined.
If you do not see any relations in your Prisma schema, you can manually add them using the `@relation` directive
or run our latest CLI version `npx auth@latest generate` to generate a new Prisma schema with the relations.

## [Additional Information](https://better-auth.com/docs/adapters/prisma\#additional-information)

- If you're looking for performance improvements or tips, take a look at our guide to [performance optimizations](https://better-auth.com/docs/guides/optimizing-for-performance).
- [How to use Prisma ORM with Better Auth and Next.js](https://www.prisma.io/docs/guides/authentication/better-auth/nextjs)
- [How to use Prisma ORM with Better Auth and Astro](https://www.prisma.io/docs/guides/authentication/better-auth/astro)

[Edit on GitHub](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/adapters/prisma.mdx)

[Drizzle ORM Adapter\\
\\
Integrate Better Auth with Drizzle ORM.](https://better-auth.com/docs/adapters/drizzle) [MongoDB Adapter\\
\\
Integrate Better Auth with MongoDB.](https://better-auth.com/docs/adapters/mongo)

### On this page

[Installation](https://better-auth.com/docs/adapters/prisma#installation) [Setup](https://better-auth.com/docs/adapters/prisma#setup) [Configure Prisma](https://better-auth.com/docs/adapters/prisma#configure-prisma) [Create the Prisma client](https://better-auth.com/docs/adapters/prisma#create-the-prisma-client) [Configure Better Auth](https://better-auth.com/docs/adapters/prisma#configure-better-auth) [Schema generation & migration](https://better-auth.com/docs/adapters/prisma#schema-generation--migration) [Joins](https://better-auth.com/docs/adapters/prisma#joins) [Additional Information](https://better-auth.com/docs/adapters/prisma#additional-information)

Ask AI `⌘I`