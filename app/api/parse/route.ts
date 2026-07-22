import { NextResponse } from 'next/server';
import mammoth from 'mammoth';

// Helper function to parse PDF buffer using pdf-parse-debugging-disabled
async function extractPdfText(buffer: Buffer): Promise<string> {
  // Dynamic import prevents Turbopack from bundling binaries at build time
  // @ts-ignore
  const pdfParse = (await import('pdf-parse-debugging-disabled')).default;
  const data = await pdfParse(buffer);
  return data.text || '';
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