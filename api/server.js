import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const romsDir = path.join(__dirname, "roms");

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/games", (req, res) => {
  // Liste simple basée sur le dossier roms/
  const files = fs.existsSync(romsDir) ? fs.readdirSync(romsDir) : [];
  const games = files
    .filter(f => /\.(nes|gb|gbc|gba|sfc|smc|zip)$/i.test(f))
    .map(f => ({
      id: f,
      title: f.replace(/\.(\w+)$/, ""),
      rom: `/api/roms/${encodeURIComponent(f)}`
    }));

  res.json({ games });
});

app.get("/api/roms/:file", (req, res) => {
  const file = decodeURIComponent(req.params.file);
  const filePath = path.join(romsDir, file);

  if (!filePath.startsWith(romsDir))
    return res.status(400).send("Bad path");

  if (!fs.existsSync(filePath))
    return res.status(404).send("ROM not found");

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize - 1;

    const chunkSize = end - start + 1;
    const fileStream = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "application/octet-stream"
    });

    fileStream.pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "application/octet-stream",
      "Accept-Ranges": "bytes"
    });

    fs.createReadStream(filePath).pipe(res);
  }
});

app.listen(port, () => console.log(`Retro API listening on :${port}`));
