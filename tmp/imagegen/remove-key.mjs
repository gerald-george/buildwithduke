import { chromium } from "../../apps/web/node_modules/@playwright/test/index.mjs";
import { readFile, writeFile } from "node:fs/promises";
import { extname } from "node:path";

const [input, output, transparentAt = "18", opaqueAt = "190"] = process.argv.slice(2);
if (!input || !output) throw new Error("Usage: remove-key.mjs <input> <output> [transparentAt] [opaqueAt]");

const mime = extname(input).toLowerCase() === ".jpg" || extname(input).toLowerCase() === ".jpeg" ? "image/jpeg" : "image/png";
const source = `data:${mime};base64,${(await readFile(input)).toString("base64")}`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const result = await page.evaluate(async ({ source, transparentAt, opaqueAt }) => {
  const image = new Image();
  image.src = source;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas context unavailable");
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const key = [pixels.data[0], pixels.data[1], pixels.data[2]];
  let transparent = 0;
  let visible = 0;

  for (let offset = 0; offset < pixels.data.length; offset += 4) {
    const red = pixels.data[offset];
    const green = pixels.data[offset + 1];
    const blue = pixels.data[offset + 2];
    const distance = Math.hypot(red - key[0], green - key[1], blue - key[2]);
    let alpha = distance <= transparentAt ? 0 : distance >= opaqueAt ? 255 : Math.round(255 * (distance - transparentAt) / (opaqueAt - transparentAt));
    alpha = Math.round(255 * Math.pow(alpha / 255, 0.82));

    if (alpha > 0 && alpha < 255) {
      const ratio = alpha / 255;
      pixels.data[offset] = Math.max(0, Math.min(255, Math.round((red - (1 - ratio) * key[0]) / ratio)));
      pixels.data[offset + 1] = Math.max(0, Math.min(255, Math.round((green - (1 - ratio) * key[1]) / ratio)));
      pixels.data[offset + 2] = Math.max(0, Math.min(255, Math.round((blue - (1 - ratio) * key[2]) / ratio)));
    }
    pixels.data[offset + 3] = alpha;
    if (alpha === 0) transparent += 1;
    if (alpha > 200) visible += 1;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.putImageData(pixels, 0, 0);
  return { dataUrl: canvas.toDataURL("image/png"), width: canvas.width, height: canvas.height, transparent, visible, key };
}, { source, transparentAt: Number(transparentAt), opaqueAt: Number(opaqueAt) });
await browser.close();
await writeFile(output, Buffer.from(result.dataUrl.split(",")[1], "base64"));
console.log(JSON.stringify({ ...result, dataUrl: undefined }));
