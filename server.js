const express = require("express");
const crypto = require("crypto");

const app = express();

let latestFrame = null;
let lastUpdate = 0;

const CAMERA_TOKEN = process.env.CAMERA_TOKEN || "";
const VIEW_PASSWORD = process.env.VIEW_PASSWORD || "";

function secureEqual(a, b) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length &&
    crypto.timingSafeEqual(x, y);
}

// Camera uploads
app.post(
  "/upload",
  express.raw({
    type: "image/jpeg",
    limit: "500kb"
  }),
  (req, res) => {

    const token = req.headers["x-camera-token"];

    if (!CAMERA_TOKEN ||
        !secureEqual(token || "", CAMERA_TOKEN)) {
      return res.status(401).send("Unauthorized");
    }

    if (!req.body || !req.body.length) {
      return res.status(400).send("No image");
    }

    latestFrame = Buffer.from(req.body);
    lastUpdate = Date.now();

    res.send("OK");
  }
);

// Protect website and image feed
function viewerAuth(req, res, next) {
  const auth = req.
