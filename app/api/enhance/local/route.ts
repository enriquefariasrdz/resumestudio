import { NextResponse } from 'next/server';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

export async function POST(request: Request) {
  try {
    const { bulletText, summaryText, roleTitle, mode = 'bullet' } = await request.json();

    if (mode === 'bullet' && !bulletText) {
      return NextResponse.json({ error: 'No bullet text provided' }, { status: 400 });
    }

    if (mode === 'summary' && !summaryText) {
      return NextResponse.json({ error: 'No summary text provided' }, { status: 400 });
    }

    // Role-tailored system prompt instructions
    const systemPrompt = `You are an expert technical resume writer specializing in SRE, DevOps, Cloud Architecture, and Software Engineering.
Your job is to rewrite raw resume text into concise, high-impact ATS statements.

RULES:
1. Start with a strong active verb (e.g., Orchestrated, Automated, Reduced, Architected, Spearheaded).
2. Include specific technologies relevant to ${roleTitle || 'DevOps/SRE Engineering'} where context allows.
3. Emphasize operational outcomes, latency, cost savings, reliability, or uptime metrics.
4. Do NOT output conversational filler, quotes, preamble, or explanations.
5. Return ONLY the final polished text.`;

    const userPrompt =
      mode === 'summary'
        ? `Rewrite this professional summary into a punchy 2-3 sentence executive summary for a ${roleTitle || 'Senior Technical'} candidate:\n"${summaryText}"`
        : `Rewrite this resume bullet point for a ${roleTitle || 'DevOps/SRE'} role to make it more impactful:\n"${bulletText}"`;

    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        prompt: `${systemPrompt}\n\nTask: ${userPrompt}`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama returned status ${response.status}`);
    }

    const data = await response.json();
    const cleanOutput = data.response?.trim().replace(/^["']|["']$/g, '') || '';

    if (mode === 'summary') {
      return NextResponse.json({ enhancedSummary: cleanOutput });
    }

    return NextResponse.json({ enhancedBullet: cleanOutput });
  } catch (error: any) {
    console.error('Ollama local enhancement error:', error);

    // Friendly connection guidance
    if (error?.cause?.code === 'ECONNREFUSED' || error?.message?.includes('fetch failed')) {
      return NextResponse.json(
        {
          error:
            'Could not connect to local Ollama. Please make sure Ollama is running (`ollama serve` or `ollama run llama3.2`).',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to communicate with local AI model.' },
      { status: 500 }
    );
  }
}