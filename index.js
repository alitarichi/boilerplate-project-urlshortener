require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

const urlDatabase = {};

function generateShortCode() {
  return Math.random().toString(36).substring(2, 8);
}

app.post("/api/shortUrl", (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "url is required" });
  }

  const shortCode = generateShortCode();

  urlDatabase[shortCode] = url;

  res.json({
    originalUrl: url,
    short_url: `${req.protocol}://${req.get("host")}/api/${shortCode}`,
  });
});

app.get("/api/:shortCode", (req, res) => {
  const shortCode = req.params.shortCode;
  const originalUrl = urlDatabase[shortCode];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.status(404).json({ error: "Shortended URL not found" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
