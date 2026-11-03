/**
 * Images added on the platform are shrunk in the browser before they are saved:
 * at most `maxSide` pixels on the long side, re-encoded as JPEG. A 4 MB phone photo becomes
 * roughly 150–400 KB, so pages and the database carry far less data.
 * Other files (PDF documents, SVG, GIF) are returned unchanged.
 */
export async function fileToCompressedDataUrl(
  file: File,
  { maxSide = 1600, quality = 0.8 }: { maxSide?: number; quality?: number } = {},
): Promise<string> {
  const original = await readAsDataUrl(file);
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") return original;
  try {
    const img = await loadImage(original);
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return original;
    // Transparent PNG areas become white instead of black in the JPEG
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const compressed = canvas.toDataURL("image/jpeg", quality);
    return compressed.length < original.length ? compressed : original;
  } catch {
    return original;
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
