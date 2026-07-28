import { NextResponse } from 'next/server';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

export async function POST(request: Request) {
  try {
    const { resumeData } = await request.json();

    if (!resumeData) {
      return NextResponse.json({ error: 'Resume data is required' }, { status: 400 });
    }

    const prompt = `You are a resume theme and layout design assistant. Based on the resume data below, generate exactly 20 distinct resume theme entries that a candidate can choose when applying to jobs.

Each theme entry must be an object with the following keys:
- name: short theme title
- description: what makes this theme unique and why it works for the candidate
- bestFor: the candidate types or jobs that should use this theme
- style: the visual / formatting style and tone of the theme

Return ONLY valid JSON in this exact format, with no markdown or extra text:
{
  "themes": [
    { "name": "...", "description": "...", "bestFor": "...", "style": "..." },
    ...
  ]
}

Resume data:
${JSON.stringify(resumeData)}`;

    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        prompt,
        format: 'json',
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API status: ${response.status}`);
    }

    const data = await response.json();
    const rawResponse = String(data.response || '');
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(rawResponse);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Theme generation failed:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate resume themes.' },
      { status: 500 }
    );
  }
}
