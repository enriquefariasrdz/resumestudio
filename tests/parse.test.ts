import { describe, it, expect } from 'vitest';
import { POST } from '../app/api/parse/route';
import fs from 'fs';
import path from 'path';

describe('Resume Parsing API Route Tests', () => {
  it('should return 400 when no file is uploaded', async () => {
    const formData = new FormData();
    const req = new Request('http://localhost:3000/api/parse', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('No file uploaded');
  });

  it('should return 400 for unsupported file formats', async () => {
    const file = new File(['hello world'], 'invalid.txt', { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', file);

    const req = new Request('http://localhost:3000/api/parse', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('Unsupported file format');
  });

  it('should parse PDF files cleanly without process crash or raw symbol artifacts', async () => {
    const pdfPath = path.join(process.cwd(), 'Enrique_Farias_Rodriguez_Resume (3).pdf');
    if (!fs.existsSync(pdfPath)) {
      console.warn('PDF sample file not found, skipping integration parsing test.');
      return;
    }

    const fileBuffer = fs.readFileSync(pdfPath);
    const file = new File([fileBuffer], 'Enrique_Farias_Rodriguez_Resume (3).pdf', { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', file);

    const req = new Request('http://localhost:3000/api/parse', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.text).toBeDefined();
    expect(data.text.length).toBeGreaterThan(100);
    expect(data.text).toContain('Enrique Farias');
    expect(data.text).toContain('Site Reliability Engineer');
    // Ensure URL spacing bug is fixed
    expect(data.text).toContain('https://');
    expect(data.text).not.toContain('https: //');
    // Ensure bullet points are sanitized
    expect(data.text).toContain('• Troubleshoot applications');
  }, 15000);
});
