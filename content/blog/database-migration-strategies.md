---
title: "Database Migration Strategies for Zero-Downtime Deployments"
date: "2026-04-27"
description: "How to run schema migrations without taking your application offline, covering expand-contract patterns and feature flags."
tags: ["postgres", "backend", "devops"]
---
## Database Migration Strategies for Zero-Downtime Deployments

Deploying a new feature is already nerve-wracking enough without having to worry about taking your app offline for a schema migration. But database changes—especially schema updates—are one of those things that can quickly turn into a nightmare if you don’t plan them carefully.

How do you update your database without users running into errors or downtime? The answer lies in adopting **zero-downtime migration strategies**, typically leveraging **expand-contract patterns** and **feature flags**. In this post, I’ll walk you through these techniques, show examples using PostgreSQL, and share practical tips to keep your migrations smooth and drama-free.

---

## The Problem: Why Are Schema Changes Risky?

Schema changes are inherently risky because they affect the structure of your database, which is tightly coupled with your application. Depending on the type of change, you might:

- **Break existing queries**: Removing a column that the app still uses will cause runtime errors.
- **Lock the database**: Some operations, like `ALTER TABLE`, can lock rows or the entire table, freezing queries and causing cascading failures.
- **Lose data**: Dropping or altering columns without careful planning might result in irreversible data loss.

A simple change that works perfectly in your local dev environment can bring down your production app if users and background jobs are still relying on the "old" schema.

Zero-downtime migrations aim to fix that by ensuring that your application and database can coexist safely during the migration process.

---

## The Expand-Contract Pattern

The expand-contract pattern (sometimes called "safe migrations") is the gold standard for zero-downtime deployments. The idea is simple: you make additive changes to your database first (expand), then update your application to use the new schema, and finally clean up any old artifacts (contract).

### Step 1: Expand - Add Non-Breaking Changes

In this step, you prepare your database for the change without affecting the existing application behavior. This typically involves:

- Adding new columns
- Creating new tables or indexes
- Avoiding anything that removes or alters existing schema elements

Here’s an example. Let’s say you want to rename a column `full_name` to `name` in a PostgreSQL table called `users`. In the "expand" phase, you add the new column:

```sql
-- Step 1: Add the new column
ALTER TABLE users ADD COLUMN name TEXT;

-- Optionally, backfill the data from the old column to the new one
UPDATE users SET name = full_name;
```

At this point, nothing breaks because your application is still using the old `full_name` column.

### Step 2: Update the Code

Once the new schema is in place, update your application to use it. This is where **feature flags** come in handy.

A feature flag allows you to safely toggle new functionality on/off without deploying new code. You can update your app to write to **both** the new and old columns while reading from one of them, depending on the feature flag state.

For example, in your application code:

```python
# Pseudocode for toggling between old and new column
if feature_flag_enabled("use_new_name_column"):
    # Write to both columns
    db.execute("INSERT INTO users (name, full_name) VALUES (%s, %s)", (name, name))
    # Read from the new column
    result = db.query("SELECT name FROM users WHERE id = %s", (user_id,))
else:
    # Write to the old column
    db.execute("INSERT INTO users (full_name) VALUES (%s)", (name,))
    # Read from the old column
    result = db.query("SELECT full_name FROM users WHERE id = %s", (user_id,))
```

This ensures that your application is compatible with both the old and new schema during the migration process.

### Step 3: Contract - Remove Old Schema Artifacts

Once you're confident that the new schema is working and you're no longer using the old column, you can safely clean it up:

```sql
-- Step 3: Drop the old column
ALTER TABLE users DROP COLUMN full_name;
```

By this point, your app no longer depends on `full_name`, so dropping it won’t cause any issues.

---

## Gotchas to Watch Out For

Even with a well-thought-out expand-contract plan, things can still go sideways. Here are some common pitfalls and how to avoid them:

### 1. Long-Lived Database Connections

Some ORMs or application frameworks (hi, Django) use long-lived database connections that might not immediately pick up schema changes. If your app throws errors after a migration, it might be because the connection pool is stale.

**Tip**: Configure your app to recycle database connections periodically, or restart your app instances after schema changes.

### 2. Index Creation on Large Tables

Adding an index to a large table can be a blocking operation that locks the table for a long time. PostgreSQL has a solution for this: **concurrent indexing**.

Instead of this:

```sql
CREATE INDEX idx_name ON users (name);
```

Use this:

```sql
CREATE INDEX CONCURRENTLY idx_name ON users (name);
```

The `CONCURRENTLY` keyword ensures that the index is built without locking the table, but it does require extra disk space and time to complete.

### 3. Data Backfills

Backfilling data into a new column can put a heavy load on your database, especially for large tables. Instead of running a single massive `UPDATE`, break it into smaller batches:

```sql
-- Backfill in batches to reduce load
DO $$
DECLARE
    batch_size INT := 1000;
    offset INT := 0;
BEGIN
    LOOP
        UPDATE users
        SET name = full_name
        WHERE id IN (SELECT id FROM users ORDER BY id LIMIT batch_size OFFSET offset);

        EXIT WHEN NOT FOUND;
        offset := offset + batch_size;
    END LOOP;
END $$;
```

This approach is slower than a single query, but it avoids overwhelming your database.

---

## Feature Flags: Your Safety Net

Feature flags are a critical tool for zero-downtime migrations. They let you:

1. **Gradually roll out changes**: Enable the new feature for a small subset of users before rolling it out globally.
2. **Easily roll back**: If something goes wrong, just toggle the flag off.
3. **Test in production**: You can safely test the new schema without committing to it permanently.

Popular feature flag libraries like [LaunchDarkly](https://launchdarkly.com) or open-source tools like [Unleash](https://www.getunleash.io/) make it easy to integrate this into your workflow.

---

## Actionable Takeaways

1. Use the **expand-contract pattern**: Always add new schema elements first and clean up old ones only after confirming the app no longer uses them.
2. Leverage **feature flags** to decouple database migrations from app deployments.
3. Use **concurrent indexing** and **batch updates** to avoid locking tables or overloading your database.
4. Test migrations in a staging environment that mimics production as closely as possible.
5. Monitor your application closely during and after every migration. Tools like pg_stat_activity in PostgreSQL can help you spot locking issues.

Schema migrations don’t have to be scary. With the right strategy, you can ship new features and updates without ever taking your app offline. Just plan ahead, test thoroughly, and don’t forget to have a rollback strategy ready.

Happy migrating! 🚀
