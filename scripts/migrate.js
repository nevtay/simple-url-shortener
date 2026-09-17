// scripts/migrate.js
// Goal: read every .sql file in migrations/ and run it against the DB.
// Run with: npm run migrate

const fs = require("fs");
const path = require("path");
const pool = require("../src/db.js");

async function migrate() {
  const dir = path.join(__dirname, "..", "migrations");

  const files = fs.readdirSync(dir).sort();

  for (const file of files) {
    const fileContent = fs.readFileSync(path.join(dir, file), "utf-8");
    console.log("Running migration for:", file);
    await pool.query(fileContent);
  }

  console.log("Migration(s) complete");
  await pool.end();
}

migrate().catch((err) => {
  console.log("Postgres migration failed:", err);
  process.exit(1);
});

// ---
// Think before coding:
// - What happens if you run this script twice in a row? Trace through
//   your SQL file from step 3 — does it error, or silently do nothing?
//   (This is why "IF NOT EXISTS" existed as a hint back in the .sql file.)
