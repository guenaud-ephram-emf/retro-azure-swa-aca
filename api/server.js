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
    .map(f => ({ id: f, title: f.replace(/\.(\w+)$/, ""), rom: `/api/roms/${f}` }));

  res.json({ games });
});

app.get("/api/roms/:file", (req, res) => {
  const file = req.params.file;
  const fullPath = path.join(romsDir, file);

  if (!fullPath.startsWith(romsDir)) return res.status(400).send("Bad path");
  if (!fs.existsSync(fullPath)) return res.status(404).send("ROM not found");

  res.sendFile(fullPath);
});

app.listen(port, () => console.log(`Retro API listening on :${port}`));
