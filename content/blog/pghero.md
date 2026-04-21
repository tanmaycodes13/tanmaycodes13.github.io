---
title: "PgHero With Docker Compose: A Friendly How-To Guide"
date: "2026-04-22"
description: "A practical guide to running PgHero with Docker Compose for database observability for small scale self hosted databases"
tags: ["postgres", "docker", "observability"]
---

# PgHero With Docker Compose: A Friendly How-To Guide

There are two kinds of database dashboards.

The first kind looks impressive, asks for twelve integrations, and then somehow
still leaves you guessing why your app feels slow.

The second kind gets out of the way and answers the questions you actually ask
when production is being production:

- What queries are slow?
- Which tables are growing?
- Are connections piling up?
- Do I have missing or duplicate indexes?
- What is running right now?
- Can I explain this query without spelunking through shell history?

PgHero is very much in the second camp. It is a lightweight dashboard for
Postgres that gives you a practical view into query performance, space usage,
connections, live activity, index health, and more.

This guide shows how to run PgHero locally with Docker Compose. By the end, you
will have:

- A Postgres database
- PgHero running in a browser
- `pg_stat_statements` enabled for query stats
- Optional historical query and space stats tables
- A tiny demo workload that creates slow queries you can actually see

The goal is not just to get a container running. The goal is to build a small
observability playground where PgHero has something interesting to show.

## What We Are Building

We will run two main services:

- `postgres`: a Postgres 16 database
- `pghero`: the PgHero dashboard

PgHero will connect to Postgres with `DATABASE_URL`:

```text
postgres://postgres:postgres@postgres:5432/app_development
```

The hostname is `postgres` because, inside Docker Compose, services can reach
each other by service name.

From your browser, PgHero will be available at:

```text
http://localhost:8080
```

## The Complete Docker Compose File

Create a file named `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16
    container_name: pghero_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app_development
    command:
      - postgres
      - -c
      - shared_preload_libraries=pg_stat_statements
      - -c
      - pg_stat_statements.track=all
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/initdb:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d app_development"]
      interval: 5s
      timeout: 5s
      retries: 10

  pghero:
    image: ankane/pghero
    container_name: pghero_dashboard
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgres://postgres:postgres@postgres:5432/app_development
      PGHERO_USERNAME: admin
      PGHERO_PASSWORD: secret
    ports:
      - "8080:8080"

volumes:
  postgres_data:
```

There are a few important details hiding in this small file.

First, we preload `pg_stat_statements`:

```yaml
command:
  - postgres
  - -c
  - shared_preload_libraries=pg_stat_statements
  - -c
  - pg_stat_statements.track=all
```

This matters because PgHero's query stats depend on Postgres' own
`pg_stat_statements` extension. Creating the extension is not enough; Postgres
must load it at server startup.

Second, PgHero waits for Postgres to become healthy:

```yaml
depends_on:
  postgres:
    condition: service_healthy
```

This avoids the classic Compose moment where the dashboard starts faster than
the database and immediately complains.

Third, PgHero has basic auth enabled:

```yaml
PGHERO_USERNAME: admin
PGHERO_PASSWORD: secret
```

For local development, this is fine. For anything real, use a strong password,
a private network, and preferably a reverse proxy with your normal auth story.

## Initialize PgHero Tables And Extensions

Create this directory:

```sh
mkdir -p docker/initdb
```

Then create `docker/initdb/01-pghero.sql`:

```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS pghero_query_stats (
  id bigserial primary key,
  database text,
  "user" text,
  query text,
  query_hash bigint,
  total_time float,
  calls bigint,
  captured_at timestamp
);

CREATE INDEX IF NOT EXISTS index_pghero_query_stats_on_database_and_captured_at
  ON pghero_query_stats (database, captured_at);

CREATE TABLE IF NOT EXISTS pghero_space_stats (
  id bigserial primary key,
  database text,
  schema text,
  relation text,
  size bigint,
  captured_at timestamp
);

CREATE INDEX IF NOT EXISTS index_pghero_space_stats_on_database_and_captured_at
  ON pghero_space_stats (database, captured_at);
```

The first line enables query stats:

```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

The `pghero_query_stats` table lets PgHero keep historical query stats over
time. The `pghero_space_stats` table does the same for table and index size.

You can run PgHero without the historical tables, but adding them from the
beginning makes the dashboard more interesting.

## Start Everything

Run:

```sh
docker compose up
```

Or run it in the background:

```sh
docker compose up -d
```

Open:

```text
http://localhost:8080
```

Log in with:

```text
username: admin
password: secret
```

You should see the PgHero overview page.

At this point, the dashboard is alive. It may still look quiet because a fresh
database has not done anything suspicious yet. That is not a bug. It is just a
database behaving itself, which is inconvenient when you are trying to demo an
observability tool.

So let us give it something to observe.

## Seed A Demo Table

Run this command:

```sh
docker compose exec postgres psql -U postgres -d app_development -v ON_ERROR_STOP=1 -c "
DROP TABLE IF EXISTS demo_events;

CREATE TABLE demo_events (
  id bigserial PRIMARY KEY,
  account_id integer NOT NULL,
  category integer NOT NULL,
  amount numeric(10,2) NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamp NOT NULL
);

INSERT INTO demo_events (account_id, category, amount, payload, created_at)
SELECT
  (random() * 10000)::int,
  (random() * 200)::int,
  (random() * 1000)::numeric(10,2),
  jsonb_build_object(
    'source', CASE WHEN random() < 0.5 THEN 'web' ELSE 'mobile' END,
    'flag', random() < 0.1,
    'region', CASE
      WHEN random() < 0.25 THEN 'north'
      WHEN random() < 0.5 THEN 'south'
      WHEN random() < 0.75 THEN 'east'
      ELSE 'west'
    END
  ),
  now() - (random() * interval '180 days')
FROM generate_series(1, 500000);

ANALYZE demo_events;
SELECT count(*) AS rows FROM demo_events;
"
```

This creates half a million fake event rows. The data is not precious, but it
has enough shape to make realistic-looking queries:

- Account IDs
- Categories
- Amounts
- JSON payloads
- Timestamps

Refresh PgHero and check the Space page:

```text
http://localhost:8080/space
```

You should see `demo_events`.

## Generate Slow Queries

PgHero's default slow-query logic is intentionally conservative. By default,
slow queries need:

- At least `100` calls
- At least `20ms` average time

That means running one slow query once is not enough. PgHero is looking for
patterns, not one-off drama.

Reset query stats first so our demo queries stand out:

```sh
docker compose exec postgres psql -U postgres -d app_development -c "SELECT pg_stat_statements_reset();"
```

Now run a repeated count query:

```sh
docker compose exec postgres bash -lc '
for i in $(seq 1 120); do
  psql -U postgres -d app_development -q -c "SELECT count(*) FROM demo_events, pg_sleep(0.03) WHERE category = 42;" >/dev/null
done
'
```

And a repeated aggregate query:

```sh
docker compose exec postgres bash -lc '
for i in $(seq 1 120); do
  psql -U postgres -d app_development -q -c "SELECT account_id, sum(amount) FROM demo_events, pg_sleep(0.03) WHERE created_at > now() - interval '\''90 days'\'' GROUP BY account_id ORDER BY sum(amount) DESC LIMIT 20;" >/dev/null
done
'
```

The `pg_sleep(0.03)` is a demo trick. It gives each query a reliable delay so
that it crosses PgHero's slow-query threshold. In a real app, you would not add
sleep to your queries; production will find its own ways to be creative.

Check what Postgres recorded:

```sh
docker compose exec postgres psql -U postgres -d app_development -P pager=off -c "
SELECT
  calls,
  round((total_plan_time + total_exec_time)::numeric / calls, 1) AS avg_ms,
  left(query, 160) AS query
FROM pg_stat_statements
WHERE query LIKE '%demo_events%'
ORDER BY calls DESC, avg_ms DESC
LIMIT 8;
"
```

Now open:

```text
http://localhost:8080/queries
```

You should see your generated queries. This is the moment PgHero starts feeling
useful: total time, average time, calls, and normalized SQL all show up in one
place.

## See Live Queries

The Queries page is powered by historical-ish accumulated stats from
`pg_stat_statements`.

The Live Queries page is different. It shows what is running right now from
`pg_stat_activity`.

Start a five-minute query:

```sh
docker compose exec -d postgres psql -U postgres -d app_development -c "SELECT pg_sleep(300) /* pghero live query demo */;"
```

Then open:

```text
http://localhost:8080/live_queries
```

You should see the sleeping query while it is still running.

To verify directly from Postgres:

```sh
docker compose exec postgres psql -U postgres -d app_development -P pager=off -c "
SELECT
  pid,
  state,
  now() - query_start AS duration,
  query
FROM pg_stat_activity
WHERE query LIKE '%pghero live query demo%'
  AND state <> 'idle'
ORDER BY query_start;
"
```

If you miss the five-minute window, just run the detached `pg_sleep(300)`
command again.

## Capture Historical Query Stats

The Queries page is useful immediately, but historical query stats make it more
powerful. They let you inspect query behavior over time.

You can run a capture manually:

```sh
docker compose run --rm pghero bin/rake pghero:capture_query_stats
```

For a real deployment, schedule this every five minutes with cron, your
orchestrator, or a tiny sidecar service.

For example, add this optional service to `docker-compose.yml`:

```yaml
  pghero_query_stats:
    image: ankane/pghero
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgres://postgres:postgres@postgres:5432/app_development
    command: >
      sh -c "while true; do
        bin/rake pghero:capture_query_stats;
        sleep 300;
      done"
```

Then restart Compose:

```sh
docker compose up -d
```

After captures begin, PgHero can show query stats over time.

## Capture Historical Space Stats

Space stats do not need to run as frequently. Once a day is usually enough for
most development and staging environments.

Manual capture:

```sh
docker compose run --rm pghero bin/rake pghero:capture_space_stats
```

Optional sidecar:

```yaml
  pghero_space_stats:
    image: ankane/pghero
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgres://postgres:postgres@postgres:5432/app_development
    command: >
      sh -c "while true; do
        bin/rake pghero:capture_space_stats;
        sleep 86400;
      done"
```

## Add A PgHero Config File

Environment variables are enough for a single database. If you want more
control, create a PgHero config file.

Create `pghero.yml`:

```yaml
databases:
  primary:
    url: <%= ENV["DATABASE_URL"] %>

long_running_query_sec: 60
slow_query_ms: 20
slow_query_calls: 100
explain: true
explain_timeout_sec: 10
time_zone: "UTC"
```

Mount it into the PgHero container:

```yaml
  pghero:
    image: ankane/pghero
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgres://postgres:postgres@postgres:5432/app_development
      PGHERO_USERNAME: admin
      PGHERO_PASSWORD: secret
    volumes:
      - ./pghero.yml:/app/config/pghero.yml:ro
    ports:
      - "8080:8080"
```

This is also how you can configure multiple databases:

```yaml
databases:
  primary:
    url: <%= ENV["DATABASE_URL"] %>
  analytics:
    url: <%= ENV["ANALYTICS_DATABASE_URL"] %>
```

Then add `ANALYTICS_DATABASE_URL` to the PgHero service environment.

## Common Troubleshooting

### The Queries Page Is Empty

Check that `pg_stat_statements` is loaded:

```sh
docker compose exec postgres psql -U postgres -d app_development -Atc "SHOW shared_preload_libraries;"
```

It should return:

```text
pg_stat_statements
```

Then check that the extension exists:

```sh
docker compose exec postgres psql -U postgres -d app_development -c "SELECT * FROM pg_stat_statements LIMIT 1;"
```

If this errors with:

```text
pg_stat_statements must be loaded via shared_preload_libraries
```

then Postgres did not start with the preload setting. Update the Compose
`command`, then recreate the database container:

```sh
docker compose down
docker compose up -d
```

If you want to delete the volume and start completely fresh:

```sh
docker compose down -v
docker compose up -d
```

Be careful: `down -v` deletes the database volume.

### Slow Queries Still Do Not Show Up

Remember the defaults:

- `slow_query_calls: 100`
- `slow_query_ms: 20`

If you only ran a query once, it may appear on `/queries`, but it may not appear
in the Overview slow-query warning.

Run the demo loop 120 times, then refresh:

```text
http://localhost:8080/queries
```

### Live Queries Is Empty

Live queries are temporary. If the query finishes before you open the page, it
will be gone.

Run:

```sh
docker compose exec -d postgres psql -U postgres -d app_development -c "SELECT pg_sleep(300) /* pghero live query demo */;"
```

Then immediately open:

```text
http://localhost:8080/live_queries
```

### PgHero Cannot Connect To Postgres

Inside Compose, use the service name as the hostname:

```text
postgres://postgres:postgres@postgres:5432/app_development
```

Do not use `localhost` from the PgHero container. Inside a container,
`localhost` means "this same container", not "the Postgres container".

### Port 8080 Is Already In Use

Change the host port:

```yaml
ports:
  - "8081:8080"
```

Then open:

```text
http://localhost:8081
```

## Cleaning Up

Stop the stack:

```sh
docker compose down
```

Stop the stack and delete the database volume:

```sh
docker compose down -v
```

Again: `down -v` removes the Postgres data volume.

## Final Thoughts

PgHero shines because it sits close to Postgres and speaks in database-native
terms. It does not need you to redesign your app or install a giant monitoring
platform before you can learn something useful.

With a small Docker Compose file, you get:

- A dashboard for query stats
- Visibility into live queries
- Index suggestions
- Space usage
- Connection health
- Explain support
- A local lab for learning how slow queries behave

That makes PgHero especially nice for local development, staging environments,
performance debugging, and teaching teams how Postgres thinks.

The best part is that the setup is disposable. Break it, reset it, generate
weird queries, explain them, add indexes, and watch what changes. That feedback
loop is where the tool becomes more than a dashboard. It becomes a way to build
better intuition.
