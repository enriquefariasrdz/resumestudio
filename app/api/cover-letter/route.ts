import { NextResponse } from 'next/server';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

export async function POST(request: Request) {
  try {
    const { fullName, targetRole, summary, experiences, jobDescription, companyName } = await request.json();

    const prompt = `Write a professional, highly engaging cover letter for ${fullName} applying for the position of ${targetRole} at ${companyName || 'the target company'}.

Applicant Background:
- Professional Summary: ${summary}
- Experience Highlights: ${JSON.stringify(experiences)}

Target Job Description:
${jobDescription || 'Senior Cloud / DevOps / SRE role requiring experience with Kubernetes, Cloud Infrastructure, and Automation.'}

Requirements:
- Keep it compelling, professional, and well-structured.
- Highlight quantifiable achievements and relevant cloud/DevOps experience.
- Do not include placeholders like [Insert Date] unless necessary. Return plain text paragraphs ready to submit.`;

    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ coverLetter: data.response });
  } catch (error: any) {
    console.error('Cover Letter Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate cover letter.' },
      { status: 500 }
    );
  }
}