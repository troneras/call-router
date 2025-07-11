---

# Call Router API - Claude Instructions

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.

## Project Structure

This is a Fastify-based API following best practices:

```
src/
├── server.ts              # Server startup code
├── app.ts                 # Application logic
├── plugins/
│   ├── external/          # External plugins (database, etc.)
│   └── app/               # Application-specific plugins
├── routes/                # Route handlers (auto-loaded)
└── db/                    # Database configuration and migrations
test/                      # Test files
```

## Development Commands

- `bun run dev` - Start development server with hot reload
- `bun run start` - Start production server
- `bun test` - Run tests
- `bun run db:migrate` - Run database migrations
- `bun run db:seed` - Seed database with sample data

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests. Tests are automatically discovered with `.test`, `_test_`, `.spec` or `_spec_` in the filename.

```ts#test/app.spec.ts
import { test, expect } from "bun:test";
import build from "./build.js";

test("requests the \"/\" route", async () => {
  const app = build();

  const response = await app.inject({
    method: "GET",
    url: "/",
  });

  expect(response.statusCode).toBe(200);
});
```

Test structure follows Fastify best practices with a build helper function.

## Fastify Architecture

This project uses Fastify with:
- **Plugin-based architecture** - External and app plugins
- **Auto-loading routes** - Routes are automatically loaded from `src/routes/`
- **Type safety** - Full TypeScript support
- **Database integration** - Drizzle ORM with PostgreSQL
- **Comprehensive testing** - HTTP injection testing with Bun

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";

// import .css files directly and it works
import './index.css';

import { createRoot } from "react-dom/client";

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.md`.
