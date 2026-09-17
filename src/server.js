require("dotenv").config();
const express = require("express");

const shortenRoute = require("./routes/shorten");
const redirectRoute = require("./routes/redirect");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/", shortenRoute);
app.use("/", redirectRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SERVER RUNNING ON ${PORT}`));
