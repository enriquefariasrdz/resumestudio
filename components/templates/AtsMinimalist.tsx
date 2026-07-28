// components/templates/AtsMinimalist.tsx
import React from "react";

interface TemplateProps {
  content: {
    name: string;
    title: string;
    summary: string;
    competencies: string[];
  };
  onChange?: (field: string, value: string) => void;
}

export function AtsMinimalist({ content, onChange }: TemplateProps) {
  return (
    <div className="max-w-2xl mx-auto p-8 bg-white text-black font-sans">
      <h1 className="text-2xl font-bold uppercase tracking-wide">{content.name}</h1>
      <p className="text-lg font-medium text-gray-700 mt-1">{content.title}</p>
      
      <hr className="my-4 border-gray-300" />
      
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Summary</h2>
        <p className="text-sm leading-relaxed">{content.summary}</p>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Core Competencies</h2>
        <ul className="list-disc list-inside text-sm space-y-1">
          {content.competencies.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}