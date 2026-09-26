## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [PostgreSQL](https://www.postgresql.org/) v13 or later, running and reachable
- npm (installed alongside Node.js)

## Installation

1. Clone the repo and install dependencies:

   ```bash
   git clone <repo-url>
   cd simple-url-shortener
   npm install
   ```

2. Create a database in Postgres for the app, e.g.:

   ```bash
   createdb simpleUrlShortener
   ```

3. Create a `.env` file in the project root with your database connection string and (optionally) a port:

   ```
   DATABASE_URL=postgresql://<user>:<password>@localhost:5432/simpleUrlShortener
   PORT=3000
   ```

4. Run the migrations to create the `links` table:

   ```bash
   npm run migrate
   ```

## Usage

Start the server:

```bash
npm start
```

Or, for auto-restart on file changes during development:

```bash
npm run dev
```

By default the server runs on `http://localhost:3000` (or the `PORT` set in `.env`).

**Shorten a URL**

```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"longUrl": "https://example.com/some/long/path"}'
```

Response:

```json
{
  "shortUrl": "http://localhost:3000/AbCdEfG",
  "shortCode": "AbCdEfG",
  "longUrl": "https://example.com/some/long/path",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

**Visit a short URL**

Visiting the returned `shortUrl` in a browser (or via `curl -L`) redirects to the original `longUrl` and increments its click count.

```bash
curl -L http://localhost:3000/AbCdEfG
```

**Health check**

```bash
curl http://localhost:3000/health
```

### Using Postman

1. Open Postman and create a new request.
2. **Shorten a URL:**
   - Method: `POST`
   - URL: `http://localhost:3000/shorten`
   - Body tab → select `raw` → change the type dropdown from `Text` to `JSON`
   - Enter:
     ```json
     {
       "longUrl": "https://example.com/some/long/path"
     }
     ```
   - Hit **Send**. You should get a `201 Created` response with `shortUrl`, `shortCode`, `longUrl`, and `createdAt`.
3. **Visit a short URL:**
   - Create a new request with method `GET` and URL set to the `shortUrl` from the previous response (e.g. `http://localhost:3000/AbCdEfG`).
   - By default Postman follows redirects automatically, so **Send** will land you on `longUrl`. To inspect the raw `302` instead, open the request's **Settings** and turn off "Automatically follow redirects", then check the response headers for `Location`.
4. **Health check:**
   - Method: `GET`, URL: `http://localhost:3000/health`.

Tip: save these as a Postman Collection with a `baseUrl` variable (e.g. `{{baseUrl}}/shorten`) so you can switch between local and deployed environments without editing each request.
