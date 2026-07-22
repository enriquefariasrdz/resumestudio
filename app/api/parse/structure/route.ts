import { NextResponse } from 'next/server';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

export async function POST(request: Request) {
  try {
    const { rawText } = await request.json();

    if (!rawText) {
      return NextResponse.json({ error: 'No raw text provided' }, { status: 400 });
    }

    const systemPrompt = `You are a strict JSON extraction assistant. Extract resume details from raw text and return standard JSON.

OUTPUT FORMAT (JSON ONLY, NO MARKDOWN, NO EXPLANATION):
{
  "fullName": "Name Here",
  "targetRole": "Role Title Here",
  "contactInfo": "Email | Phone | Location | LinkedIn",
  "summary": "Concise summary here",
  "experiences": [
    {
      "id": "1",
      "role": "Job Title",
      "company": "Company Name",
      "bullets": ["Bullet 1", "Bullet 2"]
    }
  ]
}`;

    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        prompt: `${systemPrompt}\n\nRAW TEXT:\n${rawText}`,
        format: 'json',
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama returned status ${response.status}`);
    }

    const data = await response.json();
    const parsedData = JSON.parse(data.response);

    return NextResponse.json({ structuredData: parsedData });
  } catch (error: any) {
    console.error('Structuring Error:', error);
    return NextResponse.json(
      { error: 'Failed to structure resume content.' },
      { status: 500 }
    );
  }
}