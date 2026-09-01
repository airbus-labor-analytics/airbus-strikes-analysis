#!/usr/bin/env bun
import { spawn } from "child_process";

async function show(imgPath, width = 80) {
  if (!imgPath) {
    console.error("Usage: bun scripts/view_terminal_image.js <path-to-image> [width]");
    process.exit(1);
  }

  // Get actual dimensions
  const idProc = spawn("identify", ["-format", "%w %h", imgPath]);
  let idOut = "";
  idProc.stdout.on("data", d => idOut += d);
  await new Promise(r => idProc.on("close", r));
  const parts = idOut.trim().split(" ");
  const origW = Number(parts[0]) || 1000;
  const origH = Number(parts[1]) || 600;
  const h = Math.max(2, Math.round((origH / origW) * width));

  // Convert to target dimensions as raw RGB stream
  const scaleProc = spawn("convert", [imgPath, "-resize", `${width}x${h}!`, "rgb:-"]);
  const scaleChunks = [];
  scaleProc.stdout.on("data", d => scaleChunks.push(d));
  await new Promise(r => scaleProc.on("close", r));
  const scaleBuf = Buffer.concat(scaleChunks);

  let out = "";
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < width; x++) {
      const topIdx = (y * width + x) * 3;
      const botIdx = ((y + 1) * width + x) * 3;
      const tr = scaleBuf[topIdx] || 0;
      const tg = scaleBuf[topIdx + 1] || 0;
      const tb = scaleBuf[topIdx + 2] || 0;
      
      if (y + 1 < h) {
        const br = scaleBuf[botIdx] || 0;
        const bg = scaleBuf[botIdx + 1] || 0;
        const bb = scaleBuf[botIdx + 2] || 0;
        out += `\x1b[38;2;${tr};${tg};${tb}m\x1b[48;2;${br};${bg};${bb}m▀\x1b[0m`;
      } else {
        out += `\x1b[38;2;${tr};${tg};${tb}m▀\x1b[0m`;
      }
    }
    out += "\n";
  }
  process.stdout.write(out);
}

const targetPath = process.argv[2];
const targetWidth = parseInt(process.argv[3] || "80", 10);
await show(targetPath, targetWidth);
