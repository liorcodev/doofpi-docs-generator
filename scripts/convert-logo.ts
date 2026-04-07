import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const rootDir = join(import.meta.dir, "..");

// Read SVG file
const svgPath = join(rootDir, "assets", "logo.svg");
const svg = readFileSync(svgPath, "utf-8");

// Convert SVG to PNG
const pngPath = join(rootDir, "assets", "logo.png");
await sharp(Buffer.from(svg)).resize(512, 512).png().toFile(pngPath);

// Read PNG and convert to base64
const png = readFileSync(pngPath);
const base64 = `data:image/png;base64,${png.toString("base64")}`;

// Write to logo-base64.txt
const base64Path = join(rootDir, "src", "logo-base64.txt");
writeFileSync(base64Path, base64);

console.log("✅ Logo converted: SVG → PNG → base64");
console.log(`   PNG: ${pngPath}`);
console.log(`   Base64: ${base64Path}`);
