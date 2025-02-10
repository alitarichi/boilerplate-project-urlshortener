require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// In-memory storage for shortened URLs
const urlDatabase = {};
let urlCounter = 1;

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// API endpoint to shorten URLs
app.post("/api/shorturl", function (req, res) {
  const originalUrl = req.body.url;

  // Validate the URL format
  const urlPattern = /^(http:\/\/|https:\/\/)/;
  if (!urlPattern.test(originalUrl)) {
    return res.json({ error: "invalid url" });
  }

  // Extract the hostname from the URL
  const { hostname } = new URL(originalUrl);

  // Verify the URL using dns.lookup
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }

    // Store the URL in the database
    const shortUrl = urlCounter++;
    urlDatabase[shortUrl] = originalUrl;

    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

// Redirect endpoint for shortened URLs
app.get("/api/shorturl/:shorturl", function (req, res) {
  const shortUrl = req.params.shorturl;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: "No short URL found for the given input" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
