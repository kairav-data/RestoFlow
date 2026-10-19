const MAX_INPUT_BYTES = 4 * 1024 * 1024;

/** Reads an image file and returns a downscaled data URL so it fits comfortably in browser storage. */
export async function fileToResizedDataUrl(
  file: File,
  maxSize: number,
  type: 'image/png' | 'image/jpeg' = 'image/png',
): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file (PNG, JPG or WebP).');
  if (file.size > MAX_INPUT_BYTES) throw new Error('Image is larger than 4 MB. Choose a smaller file.');

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('That image could not be read.'));
      el.src = objectUrl;
    });
    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Image processing is not available in this browser.');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL(type, 0.85);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
