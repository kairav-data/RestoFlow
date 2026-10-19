import QRCode from 'qrcode';

const COLORS = { dark: '#1D1C19', light: '#FFFFFF' };

export function qrPngDataUrl(text: string, width = 512): Promise<string> {
  return QRCode.toDataURL(text, { errorCorrectionLevel: 'M', margin: 1, width, color: COLORS });
}

export function qrSvgString(text: string): Promise<string> {
  return QRCode.toString(text, { type: 'svg', errorCorrectionLevel: 'M', margin: 1, color: COLORS });
}

export function downloadBlob(filename: string, blob: Blob): void {
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}
