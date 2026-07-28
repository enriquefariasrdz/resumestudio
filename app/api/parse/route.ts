import { NextResponse } from 'next/server';
import mammoth from 'mammoth';

const pdfPageBreakRegex = /-{3,}\s*Page\s*\(\d+\)\s*Break\s*-{3,}/gi;

function cleanExtractedText(rawText: string) {
  return rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !pdfPageBreakRegex.test(line))
    .join('\n');
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

  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const tesseract = await import('tesseract.js');
  const createWorker = (tesseract.createWorker ?? tesseract.default?.createWorker) as any;

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
    const viewport = page.getViewport({ scale: 1.5 });
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
  if (!ocrText) {
    throw new Error('OCR could not extract text from the PDF. The file may be scanned or image-only.');
  }

  return ocrText;
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