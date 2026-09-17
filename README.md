## Architecture

```
Client → Express API → Postgres
```

### Design Decisions

**Connection pooling**

- We use a pool instead of a single client to avoid opening a new connection, running the query, and closing it for every incoming request (i.e. `new Client()`)
- A `Pool` opens a small number of connections once, keeps them running, and distributes available ones to queries as needed
- This keeps latency low because we don't have to deal with processes such as TCP handshakes and authentication as part of the process of establishing individual connections
- Postgres also has a hard cap on how many connections it can handle at a given time

- TLDR: pooling reuses a fixed set of DB connections across concurrent requests, avoiding the overhead and connection-limit risk of opening one per request

**Collision-safe short codes**

- Each `short_code` is randomly generated using nanoid, which provides a URL-safe character set (alphanumeric characters, "-", and "\_"). At a length of 7 and 64 possible characters per position, we get 4.4 trillion possibilities (64^7)
- `short_code` is the value used to look up a link on every redirect (`WHERE short_code = $1`). If two rows shared the same code, a redirect would have no way to know which `long_url` to send the visitor to
- Hence the `UNIQUE` constraint, which allows the DB to enforce non-colliding values
- A retry flow is also implemented as a collision means the code was unlucky, not because of a bad request. If a user's `longUrl` is fine, then retrying with a fresh code costs nothing and should succeed on the next attempt

**302 vs 301 redirects**

- 302 is temporary, and tells the browser/CDN "this redirect might change later" — so it asks your server again next time instead of caching the destination
- 301 is permanent, so browsers cache it aggressively (sometimes forever). If a `short_code` is given a new `long_url`, cached clients would keep going to the old one
- `long_url` isn't immutable in the current schema, so 302 gives the freedom to update without breaking existing links
- 302 also allows `click_count` to track properly as every redirect hits the server, while a cached 301 would skip our server and throw off the numbers tracked by `click_count`

**Atomic click tracking**

- Instead of a `SELECT` + `UPDATE` query, we use a single `UPDATE ... RETURNING` statement to reduce the trips to Postgres from two to one, which reduces latency per redirect
- Two separate queries run the risk of another query modifying the row between the `SELECT` and `UPDATE` queries, but a single query keeps that possibility at bay
