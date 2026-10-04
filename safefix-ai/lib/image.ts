export const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // before compression
export const MAX_SEND_BYTES = 4 * 1024 * 1024; // Vercel request body limit is ~4.5 MB

export function formatBytes(n: number): string {
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/** Downscales large photos in the browser so the upload stays small and fast. */
export async function prepareImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close?.();
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.85)
      );
      if (blob && (scale < 1 || blob.size < file.size)) {
        const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
        return new File([blob], name, { type: "image/jpeg" });
      }
    }
  } catch {
    // Browser could not decode the image (e.g. HEIC). Fall back to the original.
  }
  if (file.size > MAX_SEND_BYTES) {
    throw new Error(
      "This image is too large to upload. Try a smaller photo or convert it to JPG or PNG."
    );
  }
  return file;
}
