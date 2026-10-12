importScripts('/everyday/vendor/pdf-lib/1.17.1/pdf-lib.min.js');

self.onmessage = async event => {
  const { id, operation, imageBytes, testDelayMs = 0 } = event.data ?? {};
  if (typeof id !== 'string' || operation !== 'smoke' || !(imageBytes instanceof ArrayBuffer)) {
    self.postMessage({ id, error: 'Permintaan tes worker PDF tidak valid.' });
    return;
  }
  if (!self.PDFLib?.PDFDocument) {
    self.postMessage({ id, error: 'pdf-lib lokal tidak tersedia pada worker.' });
    return;
  }
  try {
    if (Number.isInteger(testDelayMs) && testDelayMs > 0 && testDelayMs <= 1000) {
      await new Promise(resolve => setTimeout(resolve, testDelayMs));
    }
    const { PDFDocument } = self.PDFLib;
    const document = await PDFDocument.create();
    const image = await document.embedJpg(new Uint8Array(imageBytes));
    const width = 595.2756;
    const height = 841.8898;
    const margin = 28.3465;
    const scale = Math.min((width - 2 * margin) / image.width, (height - 2 * margin) / image.height, 1);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const page = document.addPage([width, height]);
    page.drawImage(image, { x: (width - drawWidth) / 2, y: (height - drawHeight) / 2, width: drawWidth, height: drawHeight });
    const pdfBytes = await document.save();
    const parsed = await PDFDocument.load(pdfBytes);
    const firstPage = parsed.getPages()[0];
    const size = firstPage.getSize();
    const output = pdfBytes.byteOffset === 0 && pdfBytes.byteLength === pdfBytes.buffer.byteLength
      ? pdfBytes.buffer
      : pdfBytes.slice().buffer;
    self.postMessage({ id, pdfBytes: output, pageCount: parsed.getPageCount(), width: size.width, height: size.height }, [output]);
  } catch (error) {
    self.postMessage({ id, error: error?.message || 'Worker PDF gagal membuat atau memuat hasil.' });
  }
};
