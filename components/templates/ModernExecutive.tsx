// components/templates/ModernExecutive.tsx
import React from "react";

interface TemplateProps {
  content: {
    name: string;
    title: string;
    summary: string;
    competencies: string[];
  };
}

export function ModernExecutive({ content }: TemplateProps) {
  return (
    <div className="max-w-3xl mx-auto grid grid-cols-3 bg-white text-gray-900 shadow-sm border border-gray-200">
      <div className="col-span-1 bg-slate-900 text-white p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold">{content.name}</h1>
          <p className="text-xs text-slate-400 mt-1">{content.title}</p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Core Competencies</h3>
          <ul className="text-xs space-y-2">
            {content.competencies.map((item, index) => (
              <li key={index} className="bg-slate-800 p-2 rounded">{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="col-span-2 p-8 space-y-6">
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Professional Profile</h2>
          <p className="text-sm leading-relaxed text-gray-700">{content.summary}</p>
        </section>
      </div>
    </div>
  );
}