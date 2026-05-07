import { ogSize, ogContentType, ogAlt, createOgImageResponse } from "../_ogImage";

export const runtime = "nodejs";
export const alt = ogAlt;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImageResponse();
}
