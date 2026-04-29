import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const inputPath = "public/人間イラスト素材.png";
const outputDir = "public/stickman-assets";

const columnBounds = [
  [0, 443],
  [443, 886],
  [886, 1330],
];

const rowBounds = [
  [0, 395],
  [395, 790],
  [790, 1183],
];

const innerMargin = 2;
const supersampleScale = 2;
const alphaBlur = 0.7;
const distanceFloor = 10;
const distanceCeil = 84;
const lowAlphaCutoff = 2;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(edge0, edge1, value) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function colorDistance(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function createBackgroundEstimate(rawBuffer, width, height, channels) {
  const samples = [];
  const borderThickness = Math.max(8, Math.round(Math.min(width, height) * 0.04));

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const isBorder =
        x < borderThickness ||
        y < borderThickness ||
        x >= width - borderThickness ||
        y >= height - borderThickness;

      if (!isBorder) {
        continue;
      }

      const offset = (y * width + x) * channels;
      const r = rawBuffer[offset];
      const g = rawBuffer[offset + 1];
      const b = rawBuffer[offset + 2];
      const maxChannel = Math.max(r, g, b);
      const minChannel = Math.min(r, g, b);
      const avg = (r + g + b) / 3;

      if (avg < 238 || maxChannel - minChannel > 18) {
        continue;
      }

      samples.push([r, g, b]);
    }
  }

  if (samples.length === 0) {
    return { r: 252, g: 251, b: 249 };
  }

  samples.sort((a, b) => {
    const av = a[0] + a[1] + a[2];
    const bv = b[0] + b[1] + b[2];
    return bv - av;
  });

  const keepCount = Math.max(32, Math.floor(samples.length * 0.6));
  const subset = samples.slice(0, keepCount);
  const totals = subset.reduce(
    (acc, [r, g, b]) => {
      acc.r += r;
      acc.g += g;
      acc.b += b;
      return acc;
    },
    { r: 0, g: 0, b: 0 },
  );

  return {
    r: totals.r / subset.length,
    g: totals.g / subset.length,
    b: totals.b / subset.length,
  };
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function buildSoftAlpha(rawBuffer, width, height, channels, background) {
  const alphaRgb = Buffer.alloc(width * height * 3);

  for (let index = 0, out = 0; index < rawBuffer.length; index += channels, out += 3) {
    const distance = colorDistance(
      rawBuffer[index],
      rawBuffer[index + 1],
      rawBuffer[index + 2],
      background.r,
      background.g,
      background.b,
    );

    const matte = smoothstep(distanceFloor, distanceCeil, distance);
    const alpha = Math.round(matte * 255);

    alphaRgb[out] = alpha;
    alphaRgb[out + 1] = alpha;
    alphaRgb[out + 2] = alpha;
  }

  const { data } = await sharp(alphaRgb, {
    raw: {
      width,
      height,
      channels: 3,
    },
  })
    .blur(alphaBlur)
    .raw()
    .toBuffer({ resolveWithObject: true });

  return data;
}

function despillAndCompose(rawBuffer, alphaBuffer, width, height, channels, background) {
  const rgba = Buffer.alloc(width * height * 4);

  for (let index = 0, alphaIndex = 0, out = 0; index < rawBuffer.length; index += channels, alphaIndex += 3, out += 4) {
    const alpha = alphaBuffer[alphaIndex];
    const normalizedAlpha = alpha / 255;
    const sourceR = rawBuffer[index];
    const sourceG = rawBuffer[index + 1];
    const sourceB = rawBuffer[index + 2];

    if (alpha <= lowAlphaCutoff) {
      rgba[out] = 0;
      rgba[out + 1] = 0;
      rgba[out + 2] = 0;
      rgba[out + 3] = 0;
      continue;
    }

    const recoveredR = clamp(
      (sourceR - background.r * (1 - normalizedAlpha)) / normalizedAlpha,
      0,
      255,
    );
    const recoveredG = clamp(
      (sourceG - background.g * (1 - normalizedAlpha)) / normalizedAlpha,
      0,
      255,
    );
    const recoveredB = clamp(
      (sourceB - background.b * (1 - normalizedAlpha)) / normalizedAlpha,
      0,
      255,
    );

    rgba[out] = Math.round(recoveredR);
    rgba[out + 1] = Math.round(recoveredG);
    rgba[out + 2] = Math.round(recoveredB);
    rgba[out + 3] = alpha;
  }

  return rgba;
}

function zeroOuterBorder(rgbaBuffer, width, height) {
  for (let x = 0; x < width; x += 1) {
    const top = x * 4 + 3;
    const bottom = ((height - 1) * width + x) * 4 + 3;
    rgbaBuffer[top] = 0;
    rgbaBuffer[bottom] = 0;
  }

  for (let y = 0; y < height; y += 1) {
    const left = (y * width) * 4 + 3;
    const right = (y * width + (width - 1)) * 4 + 3;
    rgbaBuffer[left] = 0;
    rgbaBuffer[right] = 0;
  }
}

async function processCell(image, left, top, width, height, outputPath) {
  const supersampledWidth = width * supersampleScale;
  const supersampledHeight = height * supersampleScale;
  const { data, info } = await image
    .clone()
    .extract({ left, top, width, height })
    .resize(supersampledWidth, supersampledHeight, {
      kernel: sharp.kernel.lanczos3,
      fit: "fill",
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const background = createBackgroundEstimate(data, info.width, info.height, info.channels);
  const alpha = await buildSoftAlpha(data, info.width, info.height, info.channels, background);
  const rgba = despillAndCompose(data, alpha, info.width, info.height, info.channels, background);

  const { data: resized, info: resizedInfo } = await sharp(rgba, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .resize(width, height, {
      kernel: sharp.kernel.lanczos3,
      fit: "fill",
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  zeroOuterBorder(resized, resizedInfo.width, resizedInfo.height);

  await sharp(resized, {
    raw: {
      width: resizedInfo.width,
      height: resizedInfo.height,
      channels: 4,
    },
  })
    .png()
    .toFile(outputPath);
}

async function main() {
  await ensureDir(outputDir);
  const image = sharp(inputPath);

  let index = 1;

  for (let row = 0; row < rowBounds.length; row += 1) {
    for (let col = 0; col < columnBounds.length; col += 1) {
      const [leftBound, rightBound] = columnBounds[col];
      const [topBound, bottomBound] = rowBounds[row];

      const left = leftBound + innerMargin;
      const top = topBound + innerMargin;
      const width = rightBound - leftBound - innerMargin * 2;
      const height = bottomBound - topBound - innerMargin * 2;
      const filename = `stickman-${String(index).padStart(2, "0")}.png`;

      await processCell(image, left, top, width, height, path.join(outputDir, filename));
      index += 1;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
