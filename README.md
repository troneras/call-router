# Call Router API

A Fastify-based API for managing calls with PostgreSQL database and Railway deployment.

## Features

- **Fastify**: Fast and low overhead web framework
- **PostgreSQL**: Robust relational database
- **Drizzle ORM**: Type-safe database operations
- **Bun**: Fast JavaScript runtime and package manager
- **Railway**: Easy deployment with automatic migrations

## Development Setup

### Prerequisites

- [Bun](https://bun.sh/) installed
- [Docker](https://www.docker.com/) installed (for local PostgreSQL)

### Local Development

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Start local PostgreSQL**
   ```bash
   docker-compose up -d
   ```

3. **Generate and run migrations**
   ```bash
   bun run db:generate
   bun run db:migrate
   ```

4. **Seed database (optional)**
   ```bash
   bun run db:seed
   ```

5. **Start development server**
   ```bash
   bun run dev
   ```

The API will be available at `http://localhost:3000`

## API Endpoints

- `GET /` - Hello world
- `GET /health` - Health check with database connection
- `GET /users` - List all users
- `GET /calls` - List all calls

## Database Management

- `bun run db:generate` - Generate new migration from schema changes
- `bun run db:push` - Push schema changes directly to database (dev only)
- `bun run db:migrate` - Run pending migrations
- `bun run db:seed` - Seed database with sample data

### Database Connection for DBbeaver

Use these connection details in DBbeaver:
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `call_router_dev`
- **Username**: `dev`
- **Password**: `dev123`

## Railway Deployment

### Setup

1. **Add PostgreSQL addon** in Railway dashboard
2. **Set environment variables**:
   - `DATABASE_URL` (auto-set by Railway PostgreSQL addon)
   - `PORT` (auto-set by Railway)

3. **Configure start command** in Railway:
   ```bash
   bun run railway
   ```

### Deployment Workflow

1. **Make changes** to schema in `src/db/schema.ts`
2. **Generate migration**:
   ```bash
   bun run db:generate
   ```
3. **Test locally**:
   ```bash
   bun run db:migrate
   bun run dev
   ```
4. **Commit and push** to trigger Railway deployment
5. **Migrations run automatically** on Railway deployment

### How Migration Tracking Works

- Drizzle creates a `__drizzle_migrations` table in your database
- Each migration gets a unique timestamp-based filename 
- The SQL files in `src/db/migrations/` are committed to git
- The `meta/` folder is ignored (contains local metadata only)
- Production tracks which migrations have been applied in the database table

## Project Structure

```
call-router/
├── src/
│   └── db/
│       ├── config.ts      # Database connection
│       ├── schema.ts      # Database schema
│       ├── migrate.ts     # Migration runner
│       ├── seed.ts        # Database seeder
│       └── migrations/    # Generated migrations
├── docker-compose.yml     # Local PostgreSQL
├── drizzle.config.ts      # Drizzle configuration
├── railway.sh            # Railway deployment script
├── index.ts              # Main application
└── .env                  # Environment variables
```

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database
PORT=3000
NODE_ENV=development
```
