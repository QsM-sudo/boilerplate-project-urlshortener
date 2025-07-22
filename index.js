const express = require("express");
const cors = require("cors");
const dns = require("dns");
const bodyParser = require("body-parser");
const app = express();

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

let urlDatabase = {};
let urlCount = 1;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// POST /api/shorturl
app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;

  try {
    const urlObj = new URL(originalUrl);
    dns.lookup(urlObj.hostname, (err) => {
      if (err) {
        return res.json({ error: "invalid url" });
      }

      const shortUrl = urlCount++;
      urlDatabase[shortUrl] = originalUrl;

      res.json({
        original_url: originalUrl,
        short_url: shortUrl
      });
    });
  } catch {
    return res.json({ error: "invalid url" });
  }
});

// GET /api/shorturl/:short_url
app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    return res.redirect(originalUrl);
  } else {
    return res.json({ error: "No short URL found for the given input" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
