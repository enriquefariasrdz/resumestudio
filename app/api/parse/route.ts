import { NextResponse } from 'next/server';
import mammoth from 'mammoth';

const pdfPageBreakRegex = /-{3,}\s*Page\s*\(\d+\)\s*Break\s*-{3,}/gi;

function cleanExtractedText(rawText: string) {
  const pdfPageBreakRegex = /-{3,}\s*Page\s*\(\d+\)\s*Break\s*-{3,}/gi;

  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !pdfPageBreakRegex.test(line));

  const cleanedLines: string[] = [];

  for (let line of lines) {
    // Skip standalone noise symbol lines (e.g. "-", "|", "•", "=")
    if (/^[»«+=~°•\-–—›>§¢¤*|]{1,3}$/.test(line)) {
      continue;
    }

    // Fix URL formatting with spaces (e.g., https: // -> https://)
    line = line.replace(/(https?):\s*\/\/\s*/gi, '$1://');

    // Fix broken OCR word splits (e.g. Rod riguez -> Rodriguez, GitLab Cl -> GitLab CI)
    line = line.replace(/\bRod\s+riguez\b/gi, 'Rodriguez');
    line = line.replace(/\bGitLab\s+Cl\b/g, 'GitLab CI');

    // Remove leading pipe bars on section headers (e.g. "| PROFESSIONAL SUMMARY" -> "PROFESSIONAL SUMMARY")
    line = line.replace(/^\|\s*/, '');

    // Normalize OCR misread bullet points (e.g., », «, +, =, ~, °, •, -, >, §, ¢, ¤, ›) into clean standard bullet points
    if (/^[»«+=~°•\-–—›>§¢¤*]\s*/.test(line)) {
      line = line.replace(/^[»«+=~°•\-–—›>§¢¤*]+\s*/, '• ');
    }

    cleanedLines.push(line);
  }

  return cleanedLines.join('\n');
}

// Helper function to parse PDF buffer using pdf-parse-debugging-disabled
async function extractPdfText(buffer: Buffer): Promise<string> {
  // Dynamic import prevents Turbopack from bundling binaries at build time
  // @ts-ignore
  const pdfParse = (await import('pdf-parse-debugging-disabled')).default;
  const data = await pdfParse(buffer);
  const text = cleanExtractedText(data.text || '');

  if (text.trim()) {
    return text;
  }

  return extractPdfTextWithOcr(buffer);
}

/**
 * Extract raw image data directly from a PDF buffer by finding image XObject stream blocks.
 * This matches dictionary parameters per object to prevent misreading length/dimensions and avoids pdfjs-dist segfaults.
 */
function extractRawImagesFromPdf(buffer: Buffer): Array<{ width: number; height: number; rawData: Buffer; isJpeg?: boolean; isRGB?: boolean }> {
  const str = buffer.toString('latin1');
  const results: Array<{ width: number; height: number; rawData: Buffer; isJpeg?: boolean; isRGB?: boolean }> = [];

  const imageObjRegex = /<<\s*\/Type\s*\/XObject\s*\/Subtype\s*\/Image[\s\S]*?>>\s*stream/g;
  let match: RegExpExecArray | null;

  while ((match = imageObjRegex.exec(str)) !== null) {
    const dictText = match[0];
    const streamStartIdx = match.index + match[0].length;

    const widthMatch = dictText.match(/\/Width\s+(\d+)/);
    const heightMatch = dictText.match(/\/Height\s+(\d+)/);
    const lengthMatch = dictText.match(/\/Length\s+(\d+)/);
    const colorSpaceMatch = dictText.match(/\/ColorSpace\s+(\/DeviceRGB|\/DeviceGray|\/DeviceCMYK)/);
    const filterMatch = dictText.match(/\/Filter\s*(\/DCTDecode|\/\[?\s*\/DCTDecode)/);

    if (!widthMatch || !heightMatch || !lengthMatch) continue;

    const width = parseInt(widthMatch[1], 10);
    const height = parseInt(heightMatch[1], 10);
    const declaredLength = parseInt(lengthMatch[1], 10);
    const isJpeg = !!filterMatch;
    const isRGB = colorSpaceMatch?.[1] === '/DeviceRGB';

    if (width <= 0 || height <= 0 || width > 10000 || height > 10000) continue;

    let actualStreamStart = streamStartIdx;
    if (buffer[actualStreamStart] === 0x0d) actualStreamStart++;
    if (buffer[actualStreamStart] === 0x0a) actualStreamStart++;

    if (actualStreamStart + declaredLength > buffer.length) continue;

    const rawData = buffer.subarray(actualStreamStart, actualStreamStart + declaredLength);

    results.push({
      width,
      height,
      rawData: Buffer.from(rawData),
      isJpeg,
      isRGB,
    });
  }

  return results;
}

async function extractPdfTextWithOcr(buffer: Buffer): Promise<string> {
  const { createCanvas, DOMMatrix, DOMPoint, DOMRect, Path2D, ImageData, Image } =
    await import('@napi-rs/canvas');

  if (!globalThis.DOMMatrix) {
    Object.defineProperty(globalThis, 'DOMMatrix', {
      value: DOMMatrix,
      configurable: true,
    });
  }
  if (!globalThis.DOMPoint) {
    Object.defineProperty(globalThis, 'DOMPoint', {
      value: DOMPoint,
      configurable: true,
    });
  }
  if (!globalThis.DOMRect) {
    Object.defineProperty(globalThis, 'DOMRect', {
      value: DOMRect,
      configurable: true,
    });
  }
  if (!globalThis.Path2D) {
    Object.defineProperty(globalThis, 'Path2D', {
      value: Path2D,
      configurable: true,
    });
  }
  if (!globalThis.ImageData) {
    Object.defineProperty(globalThis, 'ImageData', {
      value: ImageData,
      configurable: true,
    });
  }
  if (!globalThis.Image) {
    Object.defineProperty(globalThis, 'Image', {
      value: Image,
      configurable: true,
    });
  }

  if (!globalThis.navigator) {
    Object.defineProperty(globalThis, 'navigator', {
      value: { language: 'en-US', platform: 'node', userAgent: 'node' },
      configurable: true,
    });
  }

  const tesseract = await import('tesseract.js');
  const createWorker = (tesseract.createWorker ?? tesseract.default?.createWorker) as any;

  // Strategy 1: Try direct raw image extraction from PDF (avoids pdfjs-dist segfault on large images)
  const rawImages = extractRawImagesFromPdf(buffer);
  if (rawImages.length > 0) {
    try {
      const worker = await createWorker('eng', 1, { logger: () => null });
      const extractedTexts: string[] = [];

      for (const img of rawImages) {
        let imageBufferToOcr: Buffer | null = null;

        if (img.isJpeg) {
          imageBufferToOcr = img.rawData;
        } else if (img.isRGB && img.width * img.height * 3 <= img.rawData.length) {
          const canvas = createCanvas(img.width, img.height);
          const ctx = canvas.getContext('2d');
          const imageData = ctx.createImageData(img.width, img.height);

          for (let y = 0; y < img.height; y++) {
            const srcRow = y * img.width * 3;
            const dstRow = y * img.width * 4;
            for (let x = 0; x < img.width; x++) {
              const srcIdx = srcRow + x * 3;
              const dstIdx = dstRow + x * 4;
              const gray = 0.299 * img.rawData[srcIdx] + 0.587 * img.rawData[srcIdx + 1] + 0.114 * img.rawData[srcIdx + 2];
              const bw = gray < 190 ? 0 : 255;
              imageData.data[dstIdx] = bw;
              imageData.data[dstIdx + 1] = bw;
              imageData.data[dstIdx + 2] = bw;
              imageData.data[dstIdx + 3] = 255;
            }
          }

          ctx.putImageData(imageData, 0, 0);
          imageBufferToOcr = canvas.toBuffer('image/png');
        }

        if (imageBufferToOcr) {
          const { data } = await worker.recognize(imageBufferToOcr);
          const pageText = cleanExtractedText(data.text || '');
          if (pageText.trim()) {
            extractedTexts.push(pageText);
          }
        }
      }

      await worker.terminate();

      const fullOcrText = extractedTexts.join('\n\n').trim();
      if (fullOcrText.length > 20) {
        return fullOcrText;
      }
    } catch (directOcrErr) {
      console.warn('Direct image OCR failed, falling back to pdfjs-dist:', directOcrErr);
    }
  }

  // Strategy 2: Fall back to pdfjs-dist rendering (original approach)
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

    class NodeCanvasFactory {
      create(width: number, height: number) {
        if (width <= 0 || height <= 0) {
          throw new Error('Invalid canvas size for OCR rendering');
        }
        const canvas = createCanvas(width, height);
        return { canvas, context: canvas.getContext('2d') as any };
      }

      reset(canvasAndContext: { canvas: any }, width: number, height: number) {
        canvasAndContext.canvas.width = width;
        canvasAndContext.canvas.height = height;
      }

      destroy(canvasAndContext: { canvas: any }) {
        canvasAndContext.canvas.width = 0;
        canvasAndContext.canvas.height = 0;
      }
    }

    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer), disableWorker: true } as any);
    const pdf = await loadingTask.promise;

    const worker = await createWorker('eng', 1, { logger: () => null });

    const pageTexts: string[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.0 });
      const canvasFactory = new NodeCanvasFactory();
      const { canvas, context } = canvasFactory.create(Math.ceil(viewport.width), Math.ceil(viewport.height));

      await page.render({ canvasContext: context as any, viewport, canvasFactory } as any).promise;
      const imageBuffer = canvas.toBuffer('image/png');
      const { data } = await worker.recognize(imageBuffer);
      const pageText = cleanExtractedText(data.text || '');

      if (pageText.trim()) {
        pageTexts.push(pageText);
      }
    }

    await worker.terminate();

    const ocrText = pageTexts.join('\n\n').trim();
    if (ocrText) {
      return ocrText;
    }
  } catch (pdfjsErr) {
    console.warn('pdfjs-dist OCR failed:', pdfjsErr);
  }

  throw new Error('OCR could not extract text from the PDF. The file may be scanned, image-only, or corrupted.');
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let extractedText = '';

    if (file.name.toLowerCase().endsWith('.pdf')) {
      extractedText = await extractPdfText(buffer);
    } else if (file.name.toLowerCase().endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload a .pdf or .docx file.' },
        { status: 400 }
      );
    }

    if (!extractedText || !extractedText.trim()) {
      return NextResponse.json(
        { error: 'Could not extract text. The file might be scanned, empty, or image-only.' },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: extractedText.trim() });
  } catch (error: any) {
    console.error('===========================================');
    console.error('PARSE ROUTE FAILED WITH ERROR:', error);
    console.error('===========================================');

    return NextResponse.json(
      { error: error?.message || 'Server error while parsing file.' },
      { status: 500 }
    );
  }
}