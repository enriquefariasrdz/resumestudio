import { NextResponse } from 'next/server';
import ollama from 'ollama';

export async function POST(request: Request) {
  try {
    const { resumeData, jobDescription } = await request.json();

    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert ATS (Applicant Tracking System) scanner. Analyze the provided resume against the job description.

RESUME DATA:
${JSON.stringify(resumeData)}

JOB DESCRIPTION:
${jobDescription}

Perform a strict gap analysis and respond ONLY with a JSON object in this exact format, with no conversational preamble or markdown wrapping:
{
  "matchScore": 72,
  "summary": "Strong alignment in DevOps and containerization, but missing key observability tools and cloud compliance references mentioned in the posting.",
  "missingKeywords": ["Prometheus", "Terraform", "SOC2", "Grafana"],
  "matchingSkills": ["Kubernetes", "AWS", "GCP", "CI/CD"],
  "keyRecommendations": [
    "Add specific observability metrics (e.g., monitoring with Prometheus/Grafana).",
    "Mention infrastructure-as-code automation experience explicitly."
  ]
}
`;

    const response = await ollama.chat({
      model: 'llama3.2',
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    });

    const rawText = response.message.content.trim();
    
    // Extract JSON if wrapped in code blocks
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(rawText);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('JD Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze job description. Ensure Ollama is running.' },
      { status: 500 }
    );
  }
}