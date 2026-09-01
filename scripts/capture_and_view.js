#!/usr/bin/env bun
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

// Tab ID mapping
const TABS = {
  portal: "tab-portal",
  inicio: "tab-portal",
  finanzas: "tab-overview",
  overview: "tab-overview",
  beluga: "tab-industrial",
  industrial: "tab-industrial",
  salarios: "tab-purchasing-power",
  wages: "tab-purchasing-power",
  sindicatos: "tab-union-force",
  unions: "tab-union-force",
  evidencias: "tab-evidence",
  evidence: "tab-evidence"
};

const argTarget = (process.argv[2] || "portal").toLowerCase();
const tabId = TABS[argTarget] || argTarget;
const width = parseInt(process.argv[3] || "80", 10);
const openGui = process.argv.includes("--gui") || process.argv.includes("-g");

// Function to render ANSI Truecolor half-blocks
async function renderAnsi(imgPath, termWidth = 80) {
  const idProc = spawn("identify", ["-format", "%w %h", imgPath]);
  let idOut = "";
  idProc.stdout.on("data", d => idOut += d);
  await new Promise(r => idProc.on("close", r));
  const parts = idOut.trim().split(" ");
  const origW = Number(parts[0]) || 1000;
  const origH = Number(parts[1]) || 600;
  const h = Math.max(2, Math.round((origH / origW) * termWidth));

  const scaleProc = spawn("convert", [imgPath, "-resize", `${termWidth}x${h}!`, "rgb:-"]);
  const scaleChunks = [];
  scaleProc.stdout.on("data", d => scaleChunks.push(d));
  await new Promise(r => scaleProc.on("close", r));
  const scaleBuf = Buffer.concat(scaleChunks);

  let out = "";
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < termWidth; x++) {
      const topIdx = (y * termWidth + x) * 3;
      const botIdx = ((y + 1) * termWidth + x) * 3;
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
  return out;
}

console.log(`\x1b[1;36m[AIRBUS 2026]\x1b[0m Capturando vista del módulo: \x1b[1;33m${argTarget}\x1b[0m (${tabId})...`);

// If target is an existing image file directly, render it
if (fs.existsSync(argTarget)) {
  const rendered = await renderAnsi(argTarget, width);
  process.stdout.write(rendered);
  if (openGui) {
    spawn("imv", [argTarget], { detached: true, stdio: "ignore" }).unref();
  }
  process.exit(0);
}

// Otherwise, use puppeteer / headless browser to capture the dashboard
const htmlPath = path.resolve(process.cwd(), "dashboard/index.html");
const outputFile = `/tmp/airbus-preview-${argTarget}.png`;

// Simple node script via puppeteer if available or browser tool
const puppeteerScript = `
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('file://${htmlPath}', { waitUntil: 'networkidle0' });
  if ('${tabId}' !== 'tab-portal') {
    await page.evaluate((id) => {
      if (typeof switchTab === 'function') switchTab(id);
    }, '${tabId}');
    await new Promise(r => setTimeout(r, 400));
  }
  await page.screenshot({ path: '${outputFile}' });
  await browser.close();
})();
`;

// Run capture script
try {
  const tmpScript = "/tmp/capture_tmp.js";
  fs.writeFileSync(tmpScript, puppeteerScript);
  const p = spawn("bunx", ["puppeteer", "run", tmpScript], { stdio: "pipe" });
  await new Promise(r => p.on("close", r));
} catch (e) {
  // fallback
}

if (fs.existsSync(outputFile)) {
  const rendered = await renderAnsi(outputFile, width);
  process.stdout.write(rendered);
  console.log(`\x1b[32m✔ Captura guardada en:\x1b[0m ${outputFile}`);
  if (openGui) {
    spawn("imv", [outputFile], { detached: true, stdio: "ignore" }).unref();
    console.log(`\x1b[35m✔ Abierta en visor flotante Wayland (imv)\x1b[0m`);
  }
} else {
  console.log("No se pudo generar la captura automáticamente.");
}
