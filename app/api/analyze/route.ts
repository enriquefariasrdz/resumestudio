import { NextResponse } from 'next/server';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

export async function POST(request: Request) {
  try {
    const resumeData = await request.json();

    const systemPrompt = `You are an expert ATS resume reviewer and technical recruiter. Analyze the given resume JSON data and evaluate it on a scale of 0 to 100.

Check for:
1. Professional Summary (Is it compelling, quantified, and concise?)
2. Work History (Are there action verbs, bullet points, and measurable impact?)
3. Contact Details (Is key contact information present?)
4. Key Technical Skills & Experience

Respond strictly in valid JSON format matching this exact schema:
{
  "score": 82,
  "issueCount": 3,
  "sections": {
    "contact": { "status": "pass", "message": "Contact info complete" },
    "summary": { "status": "warning", "message": "Add quantifiable metrics to summary" },
    "experience": { "status": "warning", "message": "Include action verbs at the start of bullet points" }
  },
  "suggestions": [
    "Start experience bullet points with strong power verbs.",
    "Add clear metrics like percentages, cloud efficiency savings, or team size."
  ]
}`;

    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        prompt: `${systemPrompt}\n\nRESUME DATA:\n${JSON.stringify(resumeData)}`,
        format: 'json',
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API status: ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.response);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Audit Error:', error);
    return NextResponse.json(
      { error: 'Failed to complete resume audit.' },
      { status: 500 }
    );
  }
}