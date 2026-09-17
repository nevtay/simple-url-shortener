const router = require("express").Router();

const pool = require("../db");

router.get("/:code", async (req, res) => {
  const { code } = req.params;
  const result = await pool.query(
    `
    UPDATE links
    SET click_count = click_count + 1
    WHERE short_code = $1
    RETURNING long_url;
    `,
    [code],
  );

  if (result.rows[0]) {
    res.redirect(302, result.rows[0].long_url);
  } else {
    return res.status(404).json({ error: "No url found for short code" });
  }
});

module.exports = router;
