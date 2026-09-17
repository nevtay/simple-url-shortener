const express = require("express");
const router = express.Router();
const { nanoid } = require("nanoid");
const pool = require("../db");

const isValidUrl = (str) => {
  try {
    const parsedUrlProtocol = new URL(str).protocol;

    if (parsedUrlProtocol === "http:" || parsedUrlProtocol === "https:") {
      return true;
    }

    return false;
  } catch (err) {
    console.log("Invalid URL:" + str);
    return false;
  }
};

// allows multiple retries if ID has collision
router.post("/shorten", async (req, res) => {
  const { longUrl } = req.body;
  const isValidLink = isValidUrl(longUrl);

  if (!isValidLink || !longUrl) {
    res.status(400).json({ error: "Invalid or missing URL" });
  } else {
    const MAX_ATTEMPTS = 5;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const shortCode = nanoid(7);
      try {
        const result = await pool.query(
          `
          INSERT into links (short_code, long_URL)
          VALUES ($1, $2)
          RETURNING short_code, long_url, created_at
        `,
          [shortCode, longUrl],
        );

        if (result.rows[0]) {
          const { short_code, long_url, created_at } = result.rows[0];
          const shortUrl = `${req.protocol}://${req.get("host")}/${shortCode}`;

          return res.status(201).json({
            shortUrl,
            shortCode: short_code,
            longUrl: long_url,
            createdAt: created_at,
          });
        }
      } catch (err) {
        console.log("Failed to add shortened URL to DB:", err);
        if (err.code === "23505") continue;
        return res.status(500).json({ error: "Internal server error" });
      }
    }

    return res
      .status(500)
      .json({ error: "ID error - unable to generate unique code" });
  }
});

module.exports = router;
