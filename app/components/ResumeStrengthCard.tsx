'use client';

import React, { useState } from 'react';

interface StrengthAnalysis {
  score: number;
  issueCount: number;
  sections: {
    contact: { status: 'pass' | 'warning'; message: string };
    summary: { status: 'pass' | 'warning'; message: string };
    experience: { status: 'pass' | 'warning'; message: string };
    education: { status: 'pass' | 'warning'; message: string };
  };
  suggestions: string[];
}

interface Props {
  resumeData: any;
}

export default function ResumeStrengthCard({ resumeData }: Props) {
  const [analysis, setAnalysis] = useState<StrengthAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runAudit = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resumeData),
      });
      const data = await res.json();
      if (!data.error) {
        setAnalysis(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
        {/* Score Pill Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 w-full md:w-64 shrink-0 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-sm">Resume Strength</span>
            <span
              className={`text-sm font-extrabold px-3 py-1 rounded-full ${
                (analysis?.score || 70) >= 80
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {analysis ? analysis.score : 69}
            </span>
          </div>

          <div className="space-y-2 text-xs pt-1 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className={analysis?.sections.contact.status === 'pass' ? 'text-emerald-600' : 'text-amber-500'}>
                {analysis?.sections.contact.status === 'pass' ? '✓' : '⚠️'}
              </span>
              <span className="text-slate-700">Contact Information</span>
            </div>

            <div className="flex items-center gap-2">
              <span className={analysis?.sections.summary.status === 'pass' ? 'text-emerald-600' : 'text-amber-500'}>
                {analysis?.sections.summary.status === 'pass' ? '✓' : '⚠️'}
              </span>
              <span className="text-slate-700">Professional Summary</span>
            </div>

            <div className="flex items-center gap-2">
              <span className={analysis?.sections.experience.status === 'pass' ? 'text-emerald-600' : 'text-amber-500'}>
                {analysis?.sections.experience.status === 'pass' ? '✓' : '⚠️'}
              </span>
              <span className="text-slate-700">Work History</span>
            </div>
          </div>
        </div>

        {/* Action & Feedback Banner */}
        <div className="flex-1 space-y-3">
          <h3 className="text-xl font-bold text-slate-900">Fix & Optimize Resume</h3>
          <p className="text-sm text-slate-600">
            {analysis
              ? `Local AI found ${analysis.issueCount} area(s) to optimize for maximum recruiter conversion.`
              : 'Run a local AI health check to spot missing metrics, weak power verbs, and ATS formatting gaps.'}
          </p>

          {analysis?.suggestions && (
            <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 bg-white p-3 rounded-lg border border-slate-200">
              {analysis.suggestions.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          )}

          <button
            onClick={runAudit}
            disabled={isAnalyzing}
            className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow transition"
          >
            {isAnalyzing ? 'Analyzing with Ollama...' : '⚡ Run Local AI Resume Audit'}
          </button>
        </div>
      </div>
    </div>
  );
}