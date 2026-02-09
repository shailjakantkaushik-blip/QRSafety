import QRCode from "qrcode";

export async function generateQrPngDataUrl(url: string) {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 512,
  });
}

export function dataUrlToBuffer(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Buffer.from(base64, "base64");
}
