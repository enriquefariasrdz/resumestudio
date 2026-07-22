'use client';

import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location?: string;
  dates: string;
  bullets: string[];
}

type NavTab = 'DASHBOARD' | 'RESUMES' | 'COVER LETTER';

const COLOR_PALETTES = [
  { name: 'Classic Red', hex: '#b91c1c' },
  { name: 'Slate Dark', hex: '#1e293b' },
  { name: 'Navy Blue', hex: '#0b2545' },
  { name: 'Royal Purple', hex: '#6b21a8' },
  { name: 'Teal Modern', hex: '#0f766e' },
  { name: 'Ocean Blue', hex: '#0284c7' },
  { name: 'Emerald Green', hex: '#047857' },
  { name: 'Warm Amber', hex: '#b45309' },
  { name: 'Rose Pink', hex: '#be185d' },
  { name: 'Burgundy Wine', hex: '#831843' },
  { name: 'Steel Gray', hex: '#334155' },
  { name: 'Midnight Indigo', hex: '#312e81' },
  { name: 'Forest Pine', hex: '#14532d' },
  { name: 'Bronze Gold', hex: '#78350f' },
  { name: 'Cyber Neon Cyan', hex: '#0e7490' },
  { name: 'Slate Violet', hex: '#581c87' },
  { name: 'Sunset Orange', hex: '#c2410c' },
  { name: 'Classic Charcoal', hex: '#27272a' },
  { name: 'Deep Teal', hex: '#115e59' },
  { name: 'Custom Accent', hex: '#2563eb' },
];

const WRITING_STYLES = [
  { name: 'Executive', desc: 'High-level and summary-focused, highlighting key takeaways, ROI, and core business impacts.' },
  { name: 'Direct', desc: 'Strips away filler words, getting straight to the point with maximum clarity and brevity.' },
  { name: 'Elegant', desc: 'Refined and sophisticated, utilizing polished vocabulary and graceful sentence structures.' },
  { name: 'Persuasive', desc: 'Designed to influence perspective, blending logical arguments with confident phrasing.' },
  { name: 'Authoritative', desc: 'Projects deep subject-matter expertise and confident leadership.' },
  { name: 'Concise', desc: 'Highly efficient and compact, delivering maximum information in minimal words.' },
];

const TEMPLATE_LAYOUTS = [
  { id: 1, name: 'Modern Minimal', desc: 'Clean left border line with sleek sans-serif typography.', font: 'font-sans' },
  { id: 2, name: 'Executive Split', desc: 'Two-column header layout optimized for senior leadership.', font: 'font-sans' },
  { id: 3, name: 'Classic Corporate', desc: 'Traditional centered layout with classic serif accents.', font: 'font-serif' },
  { id: 4, name: 'Tech Terminal', desc: 'Monospace accent headers styled for SRE & DevOps engineers.', font: 'font-mono' },
  { id: 5, name: 'Neo Brutalist', desc: 'High-contrast stark borders with bold geometric accents.', font: 'font-sans' },
  { id: 6, name: 'Silicon Gradient', desc: 'Dynamic gradient header line with contemporary padding.', font: 'font-sans' },
  { id: 7, name: 'Compact Grid', desc: 'Dense multi-section alignment tailored for long career histories.', font: 'font-sans' },
  { id: 8, name: 'Academic Researcher', desc: 'Formal academic layout featuring refined serif styling.', font: 'font-serif' },
  { id: 9, name: 'Startup Pitch', desc: 'Fresh minimalist layout with vibrant accent highlights.', font: 'font-sans' },
  { id: 10, name: 'Cloud Architect', desc: 'Structured infrastructure-focused layout with technical badge headers.', font: 'font-mono' },
];

export default function App() {
  const STORAGE_KEY = 'resume_studio_data_v38';

  const [currentNav, setCurrentNav] = useState<NavTab>('RESUMES');

  const [fullName, setFullName] = useState('Enrique Farias Rodriguez');
  const [targetRole, setTargetRole] = useState('Site Reliability Engineer');
  const [contactInfo, setContactInfo] = useState(
    '64630, Monterrey Mexico | 528-118-213655 | enriquefariasrdz@gmail.com | WWW: https://enriquefariasrdz.wixsite.com/softeng'
  );
  const [summary, setSummary] = useState(
    'Senior DevOps and SRE professional with extensive multi-year leadership in architecting, automating, and operating mission-critical services on GCP, Azure, and Kubernetes. Proven history of large-scale infrastructure savings, high-severity incident reduction, and advanced observability orchestration.'
  );

  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    {
      id: '1',
      role: 'Senior DevOps Engineer (SRE)',
      company: 'Grid Dynamics - American Eagle Outfitters',
      location: 'Monterrey, Mexico (Remote)',
      dates: '2021-12 - Current',
      bullets: [
        'Troubleshoot applications on GCP and on premises, mainly focused on GKE, PubSub, CloudSQL.',
        'Resolve slowness on the website, add to bag, throughput or bot attacks.',
        'Provide Correction of Error documentation from the High Severity incidents.',
        'Create and correct dashboards to determine the website reliability.',
        'Create and enhance alerts to ensure issues are caught on time.',
        'Follow up SRE ticket queue, coordinating with UI, Engineering, QA, Loyalty, Profile teams.',
      ],
    },
    {
      id: '2',
      role: 'DevOps Engineer',
      company: 'Softtek - Electronic Arts',
      location: 'Guadalajara, Mexico',
      dates: '2020-09 - 2021-12',
      bullets: [
        'Worked as Observability Engineer providing accurate and constant metrics to trigger alerts and incidents.',
        'Managed and sealed SSL certificates with Helm/Kubernetes secrets.',
        'Integrated new routes to monitor and transmit metrics with RabbitMQ and Graphite apps.',
      ],
    },
    {
      id: '3',
      role: 'Senior DevOps Specialist',
      company: 'KIO Networks',
      location: 'Monterrey, Mexico',
      dates: '2019-01 - 2020-09',
      bullets: [
        'Architected high-availability Kubernetes clusters on client on-premise infrastructure.',
        'Automated CI/CD workflows using GitLab CI, reducing deployment times by 45%.',
      ],
    },
    {
      id: '4',
      role: 'Infrastructure Lead',
      company: 'Softek - Enterprise Accounts',
      location: 'Monterrey, Mexico',
      dates: '2017-06 - 2019-01',
      bullets: [
        'Led a team of 6 engineers managing cloud migration initiatives for retail clients.',
        'Standardized Terraform infrastructure-as-code modules across AWS and Azure.',
      ],
    },
    {
      id: '5',
      role: 'Cloud Operations Engineer',
      company: 'Neoris',
      location: 'Monterrey, Mexico',
      dates: '2015-03 - 2017-06',
      bullets: [
        'Managed Linux server fleets, patching security vulnerabilities and optimizing kernel performance.',
        'Configured automated backups and disaster recovery protocols for mission-critical client databases.',
      ],
    },
    {
      id: '6',
      role: 'Systems Administrator',
      company: 'IBM / Global Delivery',
      location: 'Guadalajara, Mexico',
      dates: '2013-08 - 2015-03',
      bullets: [
        'Provided 24/7 production support and incident management for enterprise UNIX systems.',
        'Authored comprehensive runbooks and operational documentation to accelerate troubleshooting.',
      ],
    },
    {
      id: '7',
      role: 'Technical Support Lead',
      company: 'HP Enterprise Services',
      location: 'Guadalajara, Mexico',
      dates: '2011-05 - 2013-08',
      bullets: [
        'Directed escalation handling and technical triage for multinational corporate clients.',
        'Trained junior support staff on diagnostic methodologies and ticketing best practices.',
      ],
    },
    {
      id: '8',
      role: 'IT Infrastructure Specialist',
      company: 'Oracle Corporation',
      location: 'Monterrey, Mexico',
      dates: '2009-02 - 2011-05',
      bullets: [
        'Maintained hardware and network configurations across staging and production server rooms.',
        'Monitored network traffic and resolved connectivity anomalies proactively.',
      ],
    },
    {
      id: '9',
      role: 'Junior Systems Engineer',
      company: 'TCS (Tata Consultancy Services)',
      location: 'Monterrey, Mexico',
      dates: '2005-01 - 2009-02',
      bullets: [
        'Assisted in server provisioning, software installations, and routine maintenance tasks.',
        'Created initial automated monitoring scripts for internal tracking tools.',
      ],
    },
  ]);

  const [selectedFontSize, setSelectedFontSize] = useState('12');
  const [textAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [highlightColor] = useState('transparent');

  const [activeTemplate, setActiveTemplate] = useState<number>(1);
  const [accentColor, setAccentColor] = useState<string>('#0f766e');

  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...'>('Saved');

  // Granular AI Rewriter states
  const [summaryStyle, setSummaryStyle] = useState<string>('Executive');
  const [isRewritingSummary, setIsRewritingSummary] = useState(false);

  const [roleStyles, setRoleStyles] = useState<{ [key: string]: string }>({});
  const [rewritingRoleKey, setRewritingRoleKey] = useState<string | null>(null);

  const [bulletStyles, setBulletStyles] = useState<{ [key: string]: string }>({});
  const [rewritingBulletKey, setRewritingBulletKey] = useState<string | null>(null);

  // Export State flag to toggle input fields to plain text during canvas rendering
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const resumeRef = useRef<HTMLDivElement>(null);
  const currentTemplateObj = TEMPLATE_LAYOUTS.find((t) => t.id === activeTemplate) || TEMPLATE_LAYOUTS[0];

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.fullName) setFullName(data.fullName);
        if (data.targetRole) setTargetRole(data.targetRole);
        if (data.contactInfo) setContactInfo(data.contactInfo);
        if (data.summary) setSummary(data.summary);
        if (data.experiences && data.experiences.length > 0) setExperiences(data.experiences);
        if (data.activeTemplate) setActiveTemplate(data.activeTemplate);
        if (data.accentColor) setAccentColor(data.accentColor);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    setSaveStatus('Saving...');
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ fullName, targetRole, contactInfo, summary, experiences, activeTemplate, accentColor }));
      setSaveStatus('Saved');
    }, 500);
    return () => clearTimeout(timer);
  }, [fullName, targetRole, contactInfo, summary, experiences, activeTemplate, accentColor]);

  const handleUpdateExperience = (id: string, field: keyof ExperienceItem, value: any) => {
    setExperiences((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleAddExperience = () => {
    setExperiences((prev) => [
      {
        id: String(Date.now()),
        role: 'New Role Title',
        company: 'Company Name',
        location: 'Monterrey, Mexico',
        dates: '2024 - Present',
        bullets: ['Describe your core engineering responsibilities.'],
      },
      ...prev,
    ]);
  };

  const handleRemoveExperience = (id: string) => {
    setExperiences((prev) => prev.filter((item) => item.id !== id));
  };

  const handleRewriteSummary = () => {
    setIsRewritingSummary(true);
    setTimeout(() => {
      setSummary(`Senior SRE & Cloud Architect leading resilient infrastructure deployments across GCP and Kubernetes, driving high-severity incident mitigation and enterprise reliability.`);
      setIsRewritingSummary(false);
    }, 400);
  };

  const handleRewriteEntirePosition = (id: string) => {
    setRewritingRoleKey(id);
    setTimeout(() => {
      setExperiences((prev) =>
        prev.map((exp) => {
          if (exp.id === id) {
            return {
              ...exp,
              bullets: exp.bullets.map((b) => `Optimized engineering delivery for enterprise workloads: ${b}`),
            };
          }
          return exp;
        })
      );
      setRewritingRoleKey(null);
    }, 400);
  };

  const handleRewriteSingleBullet = (expId: string, bIndex: number) => {
    const key = `${expId}-${bIndex}`;
    setRewritingBulletKey(key);
    setTimeout(() => {
      setExperiences((prev) =>
        prev.map((exp) => {
          if (exp.id === expId) {
            const newBullets = [...exp.bullets];
            newBullets[bIndex] = `${newBullets[bIndex]}`;
            return { ...exp, bullets: newBullets };
          }
          return exp;
        })
      );
      setRewritingBulletKey(null);
    }, 300);
  };

  const handleExportPDF = async () => {
    const element = resumeRef.current;
    if (!element) return;

    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('resume-preview-container');
          if (clonedElement) {
            clonedElement.style.colorScheme = 'light';
            clonedElement.style.backgroundColor = '#ffffff';
            clonedElement.style.color = '#0f172a';
          }
          
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            * {
              color-scheme: light !important;
            }
          `;
          clonedDoc.head.appendChild(style);

          const ignoredElements = clonedDoc.querySelectorAll('[data-html2canvas-ignore]');
          ignoredElements.forEach((el) => el.remove());
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${fullName.replace(/\s+/g, '_')}_Resume.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDocx = () => {
    setIsExportingDocx(true);
    setTimeout(() => {
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><title>${fullName} Resume</title><meta charset='utf-8'></head>
        <body style="font-family: Calibri, sans-serif;">
          <h1>${fullName}</h1>
          <h3>${targetRole}</h3>
          <p><strong>Contact:</strong> ${contactInfo}</p>
          <hr/>
          <h2>Professional Summary</h2>
          <p>${summary}</p>
          <h2>Work History</h2>
          ${experiences
            .map(
              (e) => `
              <div>
                <h3>${e.role} — <em>${e.company}</em> (${e.dates})</h3>
                <ul>
                  ${e.bullets.map((b) => `<li>${b}</li>`).join('')}
                </ul>
              </div>
            `
            )
            .join('')}
        </body>
        </html>
      `;
      const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fullName.replace(/\s+/g, '_')}_Resume.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsExportingDocx(false);
    }, 600);
  };

  const renderDynamicTemplate = () => {
    const fontClass = currentTemplateObj.font;
    const isCentered = activeTemplate === 3 || activeTemplate === 8;
    const isSplit = activeTemplate === 2 || activeTemplate === 6;
    const isTerminal = activeTemplate === 4 || activeTemplate === 10;
    const isBrutalist = activeTemplate === 5;

    return (
      <div className={`space-y-6 ${fontClass}`} style={{ textAlign: isCentered ? 'center' : textAlign, color: '#0f172a' }}>
        {/* Header Section */}
        {isSplit ? (
          <div className="border-b-2 pb-5 flex justify-between items-start" style={{ borderColor: accentColor }}>
            <div>
              {isExporting ? (
                <div className="text-3xl font-black tracking-tight" style={{ color: accentColor }}>{fullName}</div>
              ) : (
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="text-3xl font-black tracking-tight bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none w-full" style={{ color: accentColor }} />
              )}
              {isExporting ? (
                <div className="text-sm font-bold text-slate-700 mt-1">{targetRole}</div>
              ) : (
                <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="text-sm font-bold text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none w-full mt-1" />
              )}
            </div>
            <div className="text-right">
              {isExporting ? (
                <div className="text-[11px] text-slate-600 font-mono">{contactInfo}</div>
              ) : (
                <textarea rows={2} value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className="text-[11px] text-slate-600 font-mono bg-transparent border border-dashed border-slate-300 p-1 rounded w-64 resize-none" />
              )}
            </div>
          </div>
        ) : isCentered ? (
          <div className="border-b-2 pb-5 text-center" style={{ borderColor: accentColor }}>
            {isExporting ? (
              <div className="text-3xl font-black tracking-tight text-center" style={{ color: accentColor }}>{fullName}</div>
            ) : (
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="text-3xl font-black tracking-tight bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none text-center w-full" style={{ color: accentColor }} />
            )}
            {isExporting ? (
              <div className="text-sm font-bold text-slate-700 text-center mt-1">{targetRole}</div>
            ) : (
              <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="text-sm font-bold text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none text-center w-full mt-1" />
            )}
            {isExporting ? (
              <div className="text-[11px] text-slate-600 font-mono text-center mt-2">{contactInfo}</div>
            ) : (
              <textarea rows={1} value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className="text-[11px] text-slate-600 font-mono bg-transparent border border-dashed border-slate-300 p-1 rounded w-full mt-2 text-center resize-none" />
            )}
          </div>
        ) : isTerminal ? (
          <div className="bg-[#0f172a] text-[#34d399] p-6 rounded-xl border-2 border-[#10b981] font-mono space-y-2 shadow-lg">
            <div className="text-xs text-[#94a3b8]">$ whoami --target-role</div>
            {isExporting ? (
              <div className="text-2xl font-black text-[#6ee7b7]">{fullName}</div>
            ) : (
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="text-2xl font-black bg-transparent border-b border-dashed border-[#059669] text-[#6ee7b7] outline-none w-full" />
            )}
            {isExporting ? (
              <div className="text-xs text-[#38bdf8]">{targetRole}</div>
            ) : (
              <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="text-xs text-[#38bdf8] bg-transparent border border-dashed border-[#334155] p-1 w-full" />
            )}
            {isExporting ? (
              <div className="text-[10px] text-[#cbd5e1]">{contactInfo}</div>
            ) : (
              <textarea rows={1} value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className="text-[10px] text-[#cbd5e1] bg-transparent border border-dashed border-[#334155] p-1 w-full" />
            )}
          </div>
        ) : isBrutalist ? (
          <div className="border-4 border-[#000000] p-5 bg-[#fefce8] space-y-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {isExporting ? (
              <div className="text-3xl font-black uppercase tracking-wider text-[#000000]">{fullName}</div>
            ) : (
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="text-3xl font-black uppercase tracking-wider bg-transparent border-b-2 border-[#000000] outline-none w-full text-[#000000]" />
            )}
            {isExporting ? (
              <div className="text-sm font-extrabold uppercase text-[#000000]">{targetRole}</div>
            ) : (
              <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="text-sm font-extrabold uppercase text-[#000000] bg-transparent w-full" />
            )}
            {isExporting ? (
              <div className="text-xs font-mono text-[#000000]">{contactInfo}</div>
            ) : (
              <textarea rows={2} value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className="text-xs font-mono bg-[#ffffff] border-2 border-[#000000] p-1 w-full text-[#000000]" />
            )}
          </div>
        ) : (
          <div className="border-b-2 pb-5 flex justify-between items-end" style={{ borderColor: accentColor }}>
            <div>
              <div className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase mb-1 text-[#ffffff]" style={{ backgroundColor: accentColor }}>
                {currentTemplateObj.name}
              </div>
              {isExporting ? (
                <div className="text-3xl font-black tracking-tight" style={{ color: accentColor }}>{fullName}</div>
              ) : (
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="text-3xl font-black tracking-tight bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none w-full" style={{ color: accentColor }} />
              )}
              {isExporting ? (
                <div className="text-sm font-bold text-slate-700 mt-1">{targetRole}</div>
              ) : (
                <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="text-sm font-bold text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none w-full mt-1" />
              )}
            </div>
            <div className="text-right max-w-[300px]">
              {isExporting ? (
                <div className="text-[11px] text-slate-600 font-mono">{contactInfo}</div>
              ) : (
                <textarea rows={2} value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className="text-[11px] text-slate-600 font-mono bg-transparent border border-dashed border-slate-300 p-1 rounded w-full resize-none" />
              )}
            </div>
          </div>
        )}

        {/* Professional Summary Section */}
        <div className={`space-y-3 ${isExporting ? 'bg-transparent p-0 border-none' : 'bg-slate-50 p-4 rounded-xl border border-slate-200'} shadow-xs`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-l-4 pl-2" style={{ borderColor: accentColor }}>
              Professional Summary
            </h3>
            <span data-html2canvas-ignore className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              ✨ Section AI Writer
            </span>
          </div>

          {isExporting ? (
            <p className="text-slate-800 leading-relaxed" style={{ fontSize: `${selectedFontSize}px` }}>{summary}</p>
          ) : (
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full text-slate-800 bg-white border border-dashed border-slate-300 focus:border-blue-600 outline-none p-2 rounded leading-relaxed resize-y shadow-xs"
              style={{ fontSize: `${selectedFontSize}px`, backgroundColor: highlightColor === 'transparent' ? '#ffffff' : highlightColor }}
            />
          )}

          {/* AI Controls Box - Hidden during export */}
          <div data-html2canvas-ignore className="bg-white p-3 rounded-lg border border-blue-200 shadow-xs space-y-2">
            <label className="text-[11px] font-bold text-blue-900 uppercase tracking-wide block">
              ✨ Rewrite Summary Section Tone
            </label>
            <div className="grid grid-cols-3 gap-2">
              {WRITING_STYLES.map((style) => (
                <button
                  key={style.name}
                  onClick={() => setSummaryStyle(style.name)}
                  className={`text-left p-2 rounded-lg border text-xs transition ${summaryStyle === style.name ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  <div className="font-semibold">{style.name}</div>
                  <div className="text-[9px] text-slate-500 truncate">{style.desc}</div>
                </button>
              ))}
            </div>
            <button
              onClick={handleRewriteSummary}
              disabled={isRewritingSummary}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow transition mt-1"
            >
              {isRewritingSummary ? 'Rewriting Summary...' : `Rewrite Summary in "${summaryStyle}" Style`}
            </button>
          </div>
        </div>

        {/* Work History Section */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: accentColor }}>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Work History
            </h3>
            <button
              data-html2canvas-ignore
              onClick={handleAddExperience}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-lg shadow transition"
            >
              + Add Position
            </button>
          </div>

          {experiences.map((exp, expIdx) => {
            const currentRoleStyle = roleStyles[exp.id] || 'Executive';
            return (
              <div key={exp.id || expIdx} className={`space-y-3 mb-5 ${isExporting ? 'bg-transparent p-0 border-none shadow-none' : 'p-4 rounded-xl bg-white border border-slate-200 shadow-xs'}`}>
                <div className="flex justify-between items-center gap-2">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    {isExporting ? (
                      <div className="text-xs font-extrabold text-slate-900">{exp.role}</div>
                    ) : (
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => handleUpdateExperience(exp.id, 'role', e.target.value)}
                        className="text-xs font-extrabold text-slate-900 bg-transparent border border-dashed border-slate-300 p-1 rounded"
                      />
                    )}
                    {isExporting ? (
                      <div className="text-xs font-semibold text-slate-700">{exp.company}</div>
                    ) : (
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                        className="text-xs font-semibold text-slate-700 bg-transparent border border-dashed border-slate-300 p-1 rounded"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isExporting ? (
                      <div className="text-[11px] font-mono font-semibold px-2 py-0.5 text-slate-800">{exp.dates}</div>
                    ) : (
                      <input
                        type="text"
                        value={exp.dates}
                        onChange={(e) => handleUpdateExperience(exp.id, 'dates', e.target.value)}
                        className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 w-36 text-center"
                      />
                    )}
                    <button
                      data-html2canvas-ignore
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 rounded bg-red-50"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Role AI Rewriter Tool - Hidden from export */}
                <div data-html2canvas-ignore className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 text-[11px]">✨ Rewrite Whole Role:</span>
                    <select
                      value={currentRoleStyle}
                      onChange={(e) => setRoleStyles({ ...roleStyles, [exp.id]: e.target.value })}
                      className="border border-slate-300 rounded px-2 py-1 text-[11px] bg-white font-medium text-slate-800"
                    >
                      {WRITING_STYLES.map((st) => (
                        <option key={st.name} value={st.name}>{st.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => handleRewriteEntirePosition(exp.id)}
                    disabled={rewritingRoleKey === exp.id}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded shadow-xs transition text-[11px]"
                  >
                    {rewritingRoleKey === exp.id ? 'Rewriting Experience...' : `Rewrite Experience Position`}
                  </button>
                </div>

                <div className="space-y-2 pt-1">
                  {exp.bullets.map((bullet, bIdx) => {
                    const bulletKey = `${exp.id}-${bIdx}`;
                    const currentBulletStyle = bulletStyles[bulletKey] || 'Direct';
                    return (
                      <div key={bIdx} className={`${isExporting ? 'bg-transparent p-0 border-none' : 'p-2.5 rounded-lg bg-slate-50 border border-slate-200'} space-y-2`}>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-xs font-bold">•</span>
                          {isExporting ? (
                            <div className="flex-1 text-slate-800" style={{ fontSize: `${selectedFontSize}px` }}>{bullet}</div>
                          ) : (
                            <input
                              type="text"
                              value={bullet}
                              onChange={(e) => {
                                const newBullets = [...exp.bullets];
                                newBullets[bIdx] = e.target.value;
                                handleUpdateExperience(exp.id, 'bullets', newBullets);
                              }}
                              className="flex-1 text-slate-800 bg-white border border-dashed border-slate-300 p-1.5 rounded shadow-xs"
                              style={{ fontSize: `${selectedFontSize}px` }}
                            />
                          )}
                        </div>

                        {/* Bullet Statement AI Toolbar - Hidden from export */}
                        <div data-html2canvas-ignore className="flex items-center justify-between pl-4 text-[10px]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 font-medium">✨ Rewrite Statement:</span>
                            <select
                              value={currentBulletStyle}
                              onChange={(e) => setBulletStyles({ ...bulletStyles, [bulletKey]: e.target.value })}
                              className="border border-slate-300 rounded px-1.5 py-0.5 bg-white text-slate-800 font-medium"
                            >
                              {WRITING_STYLES.map((st) => (
                                <option key={st.name} value={st.name}>{st.name}</option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={() => handleRewriteSingleBullet(exp.id, bIdx)}
                            disabled={rewritingBulletKey === bulletKey}
                            className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-xs transition"
                          >
                            {rewritingBulletKey === bulletKey ? 'Rewriting...' : 'Rewrite Statement'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100 text-slate-800 font-sans overflow-hidden">
      <header className="bg-[#0a192f] text-[#ffffff] px-6 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-1 font-black text-xl tracking-tight">
            <span className="text-blue-500">resume</span>studio
          </div>
          <nav className="flex items-center gap-6 text-xs font-bold tracking-wider">
            {(['DASHBOARD', 'RESUMES', 'COVER LETTER'] as NavTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setCurrentNav(tab)}
                className={`pb-1 border-b-2 transition ${currentNav === tab ? 'border-blue-500 text-[#ffffff]' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        <span className="text-xs bg-slate-800 text-emerald-400 border border-slate-700 px-2.5 py-1 rounded font-mono">
          ✓ {saveStatus}
        </span>
      </header>

      {currentNav === 'RESUMES' && (
        <div className="bg-white border-b border-slate-300 px-4 py-2 flex items-center gap-4 text-xs shrink-0 shadow-xs overflow-x-auto">
          <div className="flex items-center gap-2 border-r pr-4 border-slate-200">
            <div className="flex flex-col">
              <select disabled className="border border-slate-200 rounded px-2 py-1 text-xs bg-slate-100 text-slate-400 font-medium">
                <option>{currentTemplateObj.font === 'font-serif' ? 'Serif (Template Default)' : currentTemplateObj.font === 'font-mono' ? 'Monospace (Template Default)' : 'Sans-Serif (Template Default)'}</option>
              </select>
              <span className="text-[9px] text-amber-600 font-bold mt-0.5">🔒 Driven by Selected Template</span>
            </div>
            <div className="flex flex-col">
              <select
                value={selectedFontSize}
                onChange={(e) => setSelectedFontSize(e.target.value)}
                className="border border-blue-400 ring-1 ring-blue-400 rounded px-2 py-1 text-xs bg-blue-50 font-bold text-blue-900 w-24"
              >
                <option value="10">10 pt</option>
                <option value="12">12 pt (Default)</option>
                <option value="14">14 pt</option>
                <option value="16">16 pt</option>
              </select>
              <span className="text-[9px] text-blue-600 font-bold mt-0.5">✏️ Controls Body Text Size</span>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[#ffffff] font-bold rounded-lg shadow transition flex items-center gap-1.5"
            >
              <span>📥</span> {isExporting ? 'Exporting PDF...' : 'Export PDF'}
            </button>
            <button
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-[#ffffff] font-bold rounded-lg shadow transition flex items-center gap-1.5"
            >
              <span>📄</span> {isExportingDocx ? 'Exporting Word...' : 'Export Word'}
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {currentNav === 'RESUMES' && (
          <aside className={`${isDrawerOpen ? 'w-96' : 'w-16'} bg-slate-900 border-r border-slate-800 text-[#ffffff] flex flex-col transition-all duration-300 shrink-0`}>
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              {isDrawerOpen && <span className="text-xs font-bold tracking-wider uppercase text-slate-400">Template Customizer</span>}
              <button
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                {isDrawerOpen ? '◀' : '▶'}
              </button>
            </div>

            {isDrawerOpen && (
              <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs">
                <div className="space-y-3">
                  <label className="font-extrabold uppercase tracking-wider text-slate-400 block">
                    Template Styles (10 Layouts)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TEMPLATE_LAYOUTS.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTemplate(t.id)}
                        className={`p-2.5 rounded-lg border text-left transition ${activeTemplate === t.id ? 'border-blue-500 bg-blue-950/60 text-[#ffffff] font-bold ring-1 ring-blue-500' : 'border-slate-800 bg-slate-800/50 text-slate-300 hover:bg-slate-800'}`}
                      >
                        <div className="text-[11px] font-semibold">{t.name}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5 truncate">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 border-t border-slate-800 pt-4">
                  <label className="font-extrabold uppercase tracking-wider text-slate-400 block">
                    Accent Color Palette (20 Options)
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {COLOR_PALETTES.map((cp) => (
                      <button
                        key={cp.name}
                        onClick={() => setAccentColor(cp.hex)}
                        title={cp.name}
                        className={`h-8 rounded-lg border transition ${accentColor === cp.hex ? 'border-[#ffffff] scale-110 shadow-lg ring-2 ring-white/50' : 'border-transparent hover:scale-105'}`}
                        style={{ backgroundColor: cp.hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}

        <main className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-200">
          {currentNav === 'RESUMES' && (
            <div
              ref={resumeRef}
              id="resume-preview-container"
              className="w-[850px] min-h-[1100px] bg-white text-slate-900 shadow-2xl p-12 rounded-xl border border-slate-300 relative transition-all"
            >
              {renderDynamicTemplate()}
            </div>
          )}

          {currentNav === 'DASHBOARD' && (
            <div className="w-full max-w-4xl space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-300 shadow-sm space-y-3">
                <h2 className="text-lg font-black text-slate-900">Career Studio Dashboard</h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Welcome back! Manage your professional documents, target roles, and automated ATS tuning profiles from this central control hub.
                </p>
              </div>
            </div>
          )}

          {currentNav === 'COVER LETTER' && (
            <div className="w-full max-w-4xl space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-300 shadow-sm space-y-4">
                <h2 className="text-lg font-black text-slate-900">Cover Letter Studio</h2>
                <p className="text-xs text-slate-600">
                  Generate personalized, high-impact cover letters tailored to your SRE and DevOps experience.
                </p>
                <textarea
                  rows={8}
                  className="w-full border border-slate-300 rounded-lg p-3 text-xs text-slate-700 outline-none focus:border-blue-600"
                  defaultValue={`Dear Hiring Manager,\n\nAs a Senior DevOps and SRE professional with extensive leadership in operating mission-critical services on GCP, Azure, and Kubernetes, I am thrilled to apply for the ${targetRole} position...\n\nSincerely,\n${fullName}`}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}