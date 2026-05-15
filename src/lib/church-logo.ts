import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export const MAX_CHURCH_LOGO_BYTES = 2 * 1024 * 1024;

const allowedMimeTypes = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
} as const;

function resolveUploadDir() {
  return path.join(process.cwd(), "public", "uploads", "church");
}

export function getChurchLogoUploadError(file: File) {
  if (!(file.type in allowedMimeTypes)) {
    return "Logo must be a PNG, JPG, or WEBP image.";
  }

  if (file.size <= 0) {
    return "Logo file is empty.";
  }

  if (file.size > MAX_CHURCH_LOGO_BYTES) {
    return "Logo must be 2 MB or smaller.";
  }

  return null;
}

export async function saveChurchLogo(file: File) {
  const extension = allowedMimeTypes[file.type as keyof typeof allowedMimeTypes];
  const fileName = `church-logo-${Date.now()}.${extension}`;
  const uploadDir = resolveUploadDir();
  const outputPath = path.join(uploadDir, fileName);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(outputPath, Buffer.from(await file.arrayBuffer()));

  return `/uploads/church/${fileName}`;
}

export async function deleteLocalChurchLogo(logoPath: string | null) {
  if (!logoPath || !logoPath.startsWith("/uploads/church/")) {
    return;
  }

  const relativePath = logoPath.replace(/^\/+/, "").replace(/\//g, path.sep);
  const absolutePath = path.join(process.cwd(), "public", relativePath);

  await rm(absolutePath, { force: true });
}
