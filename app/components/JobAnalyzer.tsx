'use client';

import React, { useState } from 'react';

interface AnalysisResult {
  matchScore: number;
  summary: string;
  missingKeywords: string[];
  matchingSkills: string[];
  keyRecommendations: string[];
}

interface JobAnalyzerProps {
  resumeData: any;
  onApplyKeywords?: (keywords: string[]) => void;
}

export default function JobAnalyzer({ resumeData, onApplyKeywords }: JobAnalyzerProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/analyze-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData, jobDescription }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        alert(data.error || 'Failed to perform analysis');
      }
    } catch (err) {
      console.error(err);
      alert('Could not connect to analysis endpoint.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 60) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
            🎯 Job Description Matcher
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Paste a target job posting to compute your ATS compatibility score.
          </p>
        </div>
      </div>

      <textarea
        rows={4}
        placeholder="Paste target job description here..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={handleAnalyze}
        disabled={loading || !jobDescription.trim()}
        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? 'Analyzing with Local AI...' : '🔍 Calculate ATS Match Score'}
      </button>

      {/* Analysis Results Display */}
      {result && (
        <div className="pt-4 border-t border-slate-700/60 space-y-4">
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-lg border border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block mb-1">ATS Match Score</span>
              <p className="text-xs text-slate-300 max-w-xs">{result.summary}</p>
            </div>
            <div
              className={`text-2xl font-extrabold px-4 py-2 rounded-xl border ${getScoreColor(
                result.matchScore
              )}`}
            >
              {result.matchScore}%
            </div>
          </div>

          {/* Missing Keywords Section */}
          {result.missingKeywords.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-rose-300">
                  Missing Critical Keywords ({result.missingKeywords.length})
                </span>
                {onApplyKeywords && (
                  <button
                    onClick={() => onApplyKeywords(result.missingKeywords)}
                    className="text-[11px] text-blue-400 hover:underline"
                  >
                    + Auto-Inject into Skills
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.missingKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="text-[11px] bg-rose-950/80 text-rose-300 border border-rose-800/60 px-2.5 py-0.5 rounded-md"
                  >
                    + {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Actionable Recommendations */}
          {result.keyRecommendations.length > 0 && (
            <div>
              <span className="text-xs font-medium text-slate-300 block mb-1.5">
                Recommended Updates:
              </span>
              <ul className="list-disc list-inside space-y-1">
                {result.keyRecommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-slate-400">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}