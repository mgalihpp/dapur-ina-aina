For the complete Prisma documentation index optimized for AI agents, see [https://www.prisma.io/docs/llms.txt](https://www.prisma.io/docs/llms.txt). A markdown version of every docs page is available by appending `.md` to its URL.

Prisma ORM 8 is here.The docs now default to Prisma ORM 8. Prisma ORM 7 docs stay at /orm/v7. [Read the docs](https://www.prisma.io/docs/getting-started)

![](https://www.prisma.io/docs/_next/image?url=%2Fimg%2Fbrand%2Ftexture.jpg&w=3840&q=75&dpl=dpl_4oMyEa2AUicouGCxYgRDN8vYCWNj)

[All docs](https://www.prisma.io/docs)

ORM

ORM versionv7

Introduction

[Prisma 7](https://www.prisma.io/docs/orm/v7)

Core Concepts

[Data modeling](https://www.prisma.io/docs/orm/v7/core-concepts/data-modeling)

Supported databases

[Overview](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases) [PostgreSQL](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/postgresql) [MySQL](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/mysql) [SQLite](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/sqlite) [SQL Server](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/sql-server) [MongoDB](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/mongodb) [Database drivers](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/database-drivers)

[API patterns](https://www.prisma.io/docs/orm/v7/core-concepts/api-patterns)

Prisma Schema

Overview

Data Model

[What is introspection?](https://www.prisma.io/docs/orm/v7/prisma-schema/introspection) [PostgreSQL extensions](https://www.prisma.io/docs/orm/v7/prisma-schema/postgresql-extensions)

Prisma Client

[Prisma Client](https://www.prisma.io/docs/orm/v7/prisma-client)

Setup and Configuration

Queries

Client Extensions

Deployment

Observability and Logging

Debugging and Troubleshooting

Special Fields and Types

Testing

Type Safety

Using Raw SQL

Prisma Migrate

[Overview of Prisma Migrate](https://www.prisma.io/docs/orm/v7/prisma-migrate) [Getting started with Prisma Migrate](https://www.prisma.io/docs/orm/v7/prisma-migrate/getting-started) [Understanding Migrations](https://www.prisma.io/docs/orm/v7/prisma-migrate/understanding-prisma-migrate/mental-model) [Migration histories](https://www.prisma.io/docs/orm/v7/prisma-migrate/understanding-prisma-migrate/migration-histories) [About the shadow database](https://www.prisma.io/docs/orm/v7/prisma-migrate/understanding-prisma-migrate/shadow-database) [Limitations and known issues](https://www.prisma.io/docs/orm/v7/prisma-migrate/understanding-prisma-migrate/limitations-and-known-issues)

Workflows

Reference

[Prisma CLI reference](https://www.prisma.io/docs/orm/v7/reference/prisma-cli-reference) [Prisma Client API](https://www.prisma.io/docs/orm/v7/reference/prisma-client-reference) [Schema API](https://www.prisma.io/docs/orm/v7/reference/prisma-schema-reference) [Config API](https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference) [Connection URLs](https://www.prisma.io/docs/orm/v7/reference/connection-urls) [Environment Variables](https://www.prisma.io/docs/orm/v7/reference/environment-variables-reference) [Database Features](https://www.prisma.io/docs/orm/v7/reference/database-features) [Supported databases](https://www.prisma.io/docs/orm/v7/reference/supported-databases) [System requirements](https://www.prisma.io/docs/orm/v7/reference/system-requirements) [Error Reference](https://www.prisma.io/docs/orm/v7/reference/error-reference) [Prisma Error Reference](https://www.prisma.io/docs/orm/v7/reference/errors) [Prisma Client & Prisma schema](https://www.prisma.io/docs/orm/v7/reference/preview-features/client-preview-features) [Prisma CLI Preview features](https://www.prisma.io/docs/orm/v7/reference/preview-features/cli-preview-features)

More

[Best practices](https://www.prisma.io/docs/orm/v7/more/best-practices) [ORM releases and maturity levels](https://www.prisma.io/docs/orm/v7/more/releases)

Comparisons

Dev environment

Troubleshooting

[All Systems Operational](https://www.prisma-status.com/)

[![Prisma](https://www.prisma.io/docs-static/_next/static/immutable/media/full-color.15vsm3_n4ohm5.svg)![Prisma](https://www.prisma.io/docs-static/_next/static/immutable/media/full-color-white.2fo90un674tus.svg)![Prisma](https://www.prisma.io/docs-static/_next/static/immutable/media/mark.33jj2rcm8g1fz.svg)Prisma home](https://www.prisma.io/)/ [docsPrisma documentation home](https://www.prisma.io/docs)/ [ORM](https://www.prisma.io/docs/orm/v7)

`Ctrl`  `K`

Ask AI
`Ctrl`  `I`

Ask AI

[GitHub](https://pris.ly/github?utm_source=docs&utm_medium=navbar)[Join Discord](https://pris.ly/discord?utm_source=docs&utm_medium=navbar)[Login](https://console.prisma.io/login?utm_source=docs&utm_medium=login)

MySQLSetup

Supported databases

# MySQL

Prisma ORM v7

Copy MarkdownOpen

Use Prisma ORM with MySQL databases including self-hosted MySQL/MariaDB and serverless PlanetScale

Prisma ORM supports MySQL and MariaDB databases, including self-hosted servers and serverless PlanetScale.

## [Setup](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/mysql\#setup)

Configure the MySQL provider in your Prisma schema:

schema.prisma

```
datasource db {
  provider = "mysql"
}
```

**Self-hosted MySQL/MariaDB:**

prisma.config.ts

```
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"), // mysql://user:pass@host:3306/db
  },
});
```

**PlanetScale:**

prisma.config.ts

```
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"), // Uses connection string from PlanetScale
  },
});
```

## [Using driver adapters](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/mysql\#using-driver-adapters)

Use JavaScript database drivers via [driver adapters](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/database-drivers#driver-adapters):

**With `mariadb` driver:**

bun

pnpm

yarn

npm

```
bun add @prisma/adapter-mariadb
```

```
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/prisma";

const adapter = new PrismaMariaDb({
  host: "localhost",
  port: 3306,
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });
```

**PlanetScale serverless:**

bun

pnpm

yarn

npm

```
bun add @prisma/adapter-planetscale undici
```

```
import { PrismaPlanetScale } from "@prisma/adapter-planetscale";
import { PrismaClient } from "./generated/prisma";
import { fetch as undiciFetch } from "undici"; // Only for Node.js <18

const adapter = new PrismaPlanetScale({
  url: process.env.DATABASE_URL,
  fetch: undiciFetch,
});
const prisma = new PrismaClient({ adapter });
```

## [Supported variants](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/mysql\#supported-variants)

### [Self-hosted MySQL/MariaDB](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/mysql\#self-hosted-mysqlmariadb)

Standard MySQL (5.6+) or MariaDB (10.0+) servers.

- Connection URL: `mysql://user:pass@host:3306/database`
- Full Prisma Migrate support
- Use `prisma migrate dev` for development
- Both MySQL and MariaDB use the same `mysql` provider

**Connection string arguments:**

| Argument | Default | Description |
| --- | --- | --- |
| `connect_timeout` | `5` | Seconds to wait for connection |
| `sslcert` |  | Path to server certificate |
| `sslidentity` |  | Path to PKCS12 certificate |
| `sslaccept` | `accept_invalid_certs` | Certificate validation mode |

### [PlanetScale](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/mysql\#planetscale)

Serverless MySQL-compatible database built on Vitess clustering system.

- Connection URL: Update host to `aws.connect.psdb.cloud`
- Uses Vitess for horizontal scaling
- Database branching workflow (development/production branches)
- Non-blocking schema changes

**Key features:**

- Enterprise scalability across multiple servers
- Database branches for schema testing
- Non-blocking schema deployments
- Serverless-optimized (avoids connection limits)

**Branch workflow:**

1. **Development branches** \- Test schema changes freely
2. **Production branches** \- Protected, require deploy requests
3. **Deploy requests** \- Merge dev changes to production

**Schema changes:**

Use `prisma db push` (not `prisma migrate`):

bun

pnpm

yarn

npm

```
bunx prisma db push
```

PlanetScale generates its own schema diff when merging branches.

**Referential integrity options:**

**Option 1: Emulate relations (recommended for default PlanetScale)**

Set `relationMode = "prisma"` to handle relations in Prisma Client:

schema.prisma

```
datasource db {
  provider     = "mysql"
  relationMode = "prisma"
}
```

Add indexes on foreign keys manually:

```
model Post {
  id       Int       @id @default(autoincrement())
  title    String
  comments Comment[]
}

model Comment {
  id     Int    @id @default(autoincrement())
  postId Int
  post   Post   @relation(fields: [postId], references: [id])

  @@index([postId]) // Required when using relationMode = "prisma"
}
```

**Option 2: Enable foreign key constraints**

[Enable foreign key constraints](https://planetscale.com/docs/concepts/foreign-key-constraints) in PlanetScale settings to use standard relations without `relationMode = "prisma"`.

**Resources:** [PlanetScale docs](https://planetscale.com/docs) • [Prisma integration](https://planetscale.com/docs/prisma/automatic-prisma-migrations)

## [Type mappings](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/mysql\#type-mappings)

### [Type mapping between MySQL and Prisma schema](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/mysql\#type-mapping-between-mysql-and-prisma-schema)

| Prisma | MySQL/MariaDB |
| --- | --- |
| `String` | `VARCHAR(191)` |
| `Boolean` | `TINYINT(1)` |
| `Int` | `INT` |
| `BigInt` | `BIGINT` |
| `Float` | `DOUBLE` |
| `Decimal` | `DECIMAL(65,30)` |
| `DateTime` | `DATETIME(3)` |
| `Json` | `JSON` |
| `Bytes` | `LONGBLOB` |

See [full type mapping reference](https://www.prisma.io/docs/orm/v7/reference/prisma-schema-reference#model-field-scalar-types) for complete details.

## [Common patterns](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/mysql\#common-patterns)

**SSL connections:**

```
DATABASE_URL="mysql://user:pass@host:3306/db?sslcert=./cert.pem&sslaccept=strict"
```

**Unix socket connections:**

```
DATABASE_URL="mysql://user:pass@localhost/db?socket=/var/run/mysqld/mysqld.sock"
```

**PlanetScale sharding (Preview):**

Define shard keys in your schema:

```
generator client {
  provider        = "prisma-client"
  output          = "./generated/prisma"
  previewFeatures = ["shardKeys"]
}

model User {
  id     String @default(uuid())
  region String @shardKey
}
```

**Connection troubleshooting:**

PlanetScale production branches are read-only for direct DDL. If you get error P3022, ensure you're:

- Using `prisma db push` instead of `prisma migrate`
- Working on a development branch, or
- Using a deploy request to update production

[Edit on GitHub](https://github.com/prisma/docs/edit/main/apps/docs/content/docs/orm/v7/core-concepts/supported-databases/mysql.mdx)

[PostgreSQL\\
\\
Use Prisma ORM with PostgreSQL databases including self-hosted, serverless (Neon, Supabase), and CockroachDB](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/postgresql) [SQLite\\
\\
Use Prisma ORM with SQLite databases including local SQLite, Turso (libSQL), and Cloudflare D1](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/sqlite)

### On this page

[Setup](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/mysql#setup) [Using driver adapters](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/mysql#using-driver-adapters) [Supported variants](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/mysql#supported-variants) [Self-hosted MySQL/MariaDB](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/mysql#self-hosted-mysqlmariadb) [PlanetScale](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/mysql#planetscale) [Type mappings](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/mysql#type-mappings) [Type mapping between MySQL and Prisma schema](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/mysql#type-mapping-between-mysql-and-prisma-schema) [Common patterns](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/mysql#common-patterns)

## Chat

### How can I help?

Ask me anything about Prisma

How do I migrate from Prisma ORM v6 to v7?How do I use Prisma with Next.js?How do I deploy Prisma to Railway?

Press `⌘`  `I` to toggle

Enable deep thinking

Send message

Powered by [kapa.ai](https://kapa.ai/)

reCAPTCHA

Recaptcha requires verification.

protected by **reCAPTCHA**