'use client';

import React, { useState, useEffect, useRef } from 'react';

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
  const STORAGE_KEY = 'resume_studio_data_v27';

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
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [highlightColor, setHighlightColor] = useState('#fef08a');

  const [activeTemplate, setActiveTemplate] = useState<number>(1);
  const [accentColor, setAccentColor] = useState<string>('#0f766e');
  const [activeTemplateSubTab, setActiveTemplateSubTab] = useState<'styling' | 'layouts'>('styling');

  const [activeDrawerTab, setActiveDrawerTab] = useState<'templates' | 'fields'>('templates');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...'>('Saved');

  const [selectedRewriteStyle, setSelectedRewriteStyle] = useState<string>('Executive');
  const [isRewriting, setIsRewriting] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
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
    setIsRewriting(true);
    setTimeout(() => {
      setSummary(`Senior SRE & Cloud Architect (${selectedRewriteStyle} tone) leading resilient infrastructure deployments across GCP and Kubernetes, driving high-severity incident mitigation and enterprise reliability.`);
      setIsRewriting(false);
    }, 400);
  };

  const renderDynamicTemplate = () => {
    const fontClass = currentTemplateObj.font;
    const isCentered = activeTemplate === 3 || activeTemplate === 8;
    const isSplit = activeTemplate === 2 || activeTemplate === 6;
    const isTerminal = activeTemplate === 4 || activeTemplate === 10;
    const isBrutalist = activeTemplate === 5;

    return (
      <div className={`space-y-6 ${fontClass}`} style={{ textAlign: isCentered ? 'center' : textAlign }}>
        {isSplit ? (
          <div className="border-b-2 pb-5 flex justify-between items-start" style={{ borderColor: accentColor }}>
            <div>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="text-3xl font-black tracking-tight bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none w-full" style={{ color: accentColor }} />
              <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="text-sm font-bold text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none w-full mt-1" />
            </div>
            <div className="text-right">
              <textarea rows={2} value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className="text-[11px] text-slate-500 font-mono bg-transparent border border-dashed border-slate-300 p-1 rounded w-64 resize-none" />
            </div>
          </div>
        ) : isCentered ? (
          <div className="border-b-2 pb-5 text-center" style={{ borderColor: accentColor }}>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="text-3xl font-black tracking-tight bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none text-center w-full" style={{ color: accentColor }} />
            <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="text-sm font-bold text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none text-center w-full mt-1" />
            <textarea rows={1} value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className="text-[11px] text-slate-500 font-mono bg-transparent border border-dashed border-slate-300 p-1 rounded w-full mt-2 text-center resize-none" />
          </div>
        ) : isTerminal ? (
          <div className="bg-slate-900 text-emerald-400 p-6 rounded-xl border-2 border-emerald-500 font-mono space-y-2 shadow-lg">
            <div className="text-xs text-slate-400">$ whoami --target-role</div>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="text-2xl font-black bg-transparent border-b border-dashed border-emerald-600 text-emerald-300 outline-none w-full" />
            <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="text-xs text-cyan-400 bg-transparent border border-dashed border-slate-700 p-1 w-full" />
            <textarea rows={1} value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className="text-[10px] text-slate-300 bg-transparent border border-dashed border-slate-700 p-1 w-full" />
          </div>
        ) : isBrutalist ? (
          <div className="border-4 border-black p-5 bg-yellow-50 space-y-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="text-3xl font-black uppercase tracking-wider bg-transparent border-b-2 border-black outline-none w-full" />
            <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="text-sm font-extrabold uppercase text-black bg-transparent w-full" />
            <textarea rows={2} value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className="text-xs font-mono bg-white border-2 border-black p-1 w-full" />
          </div>
        ) : (
          <div className="border-b-2 pb-5 flex justify-between items-end" style={{ borderColor: accentColor }}>
            <div>
              <div className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase mb-1 text-white" style={{ backgroundColor: accentColor }}>
                {currentTemplateObj.name}
              </div>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="text-3xl font-black tracking-tight bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none w-full" style={{ color: accentColor }} />
              <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="text-sm font-bold text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 outline-none w-full mt-1" />
            </div>
            <div className="text-right max-w-[300px]">
              <textarea rows={2} value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className="text-[11px] text-slate-500 font-mono bg-transparent border border-dashed border-slate-300 p-1 rounded w-full resize-none" />
            </div>
          </div>
        )}

        <div className="space-y-2 bg-slate-50/80 p-4 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-l-4 pl-2" style={{ borderColor: accentColor }}>
            Professional Summary
          </h3>
          <textarea
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full text-slate-700 bg-transparent border border-dashed border-slate-300 focus:border-blue-600 outline-none p-2 rounded leading-relaxed resize-y"
            style={{ fontSize: `${selectedFontSize}px`, backgroundColor: highlightColor === 'transparent' ? 'transparent' : highlightColor + '20' }}
          />
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: accentColor }}>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Work History ({experiences.length} Positions Active - Fluid Multi-Page Support)
            </h3>
            <button
              onClick={handleAddExperience}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-lg shadow transition"
            >
              + Add Position
            </button>
          </div>

          {experiences.map((exp, expIdx) => (
            <div key={exp.id || expIdx} className="space-y-2 mb-4 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex justify-between items-center gap-2">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => handleUpdateExperience(exp.id, 'role', e.target.value)}
                    className="text-xs font-extrabold text-slate-900 bg-transparent border border-dashed border-slate-300 p-1 rounded"
                  />
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                    className="text-xs font-semibold text-slate-600 bg-transparent border border-dashed border-slate-300 p-1 rounded"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={exp.dates}
                    onChange={(e) => handleUpdateExperience(exp.id, 'dates', e.target.value)}
                    className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 w-36 text-center"
                  />
                  <button
                    onClick={() => handleRemoveExperience(exp.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 rounded bg-red-50"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                {exp.bullets.map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs">•</span>
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) => {
                        const newBullets = [...exp.bullets];
                        newBullets[bIdx] = e.target.value;
                        handleUpdateExperience(exp.id, 'bullets', newBullets);
                      }}
                      className="flex-1 text-slate-700 bg-transparent border border-dashed border-slate-200 p-1 rounded"
                      style={{ fontSize: `${selectedFontSize}px` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100 text-slate-800 font-sans overflow-hidden">
      <header className="bg-[#0a192f] text-white px-6 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-1 font-black text-xl tracking-tight">
            <span className="text-blue-500">resume</span>studio
          </div>
          <nav className="flex items-center gap-6 text-xs font-bold tracking-wider">
            {(['DASHBOARD', 'RESUMES', 'COVER LETTER'] as NavTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setCurrentNav(tab)}
                className={`pb-1 border-b-2 transition ${currentNav === tab ? 'border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
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

          <div className="ml-auto">
            <button
              onClick={() => setIsAuditing(!isAuditing)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow"
            >
              {isAuditing ? 'Scanning...' : 'Run ATS Audit'}
            </button>
          </div>
        </div>
      )}

      {currentNav === 'RESUMES' && (
        <div className="flex-1 flex overflow-hidden relative">
          <div className="w-20 bg-white border-r border-slate-300 flex flex-col items-center py-4 gap-6 shrink-0 z-20">
            <button
              onClick={() => { setActiveDrawerTab('templates'); setIsDrawerOpen(true); }}
              className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
            >
              <div className="p-2.5 rounded-xl bg-slate-100">📄</div>
              Templates
            </button>
            <button
              onClick={() => { setActiveDrawerTab('fields'); setIsDrawerOpen(true); }}
              className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
            >
              <div className="p-2.5 rounded-xl bg-slate-100">✏️</div>
              Content
            </button>
          </div>

          {isDrawerOpen && (
            <div className="w-[440px] bg-white border-r border-slate-300 flex flex-col h-full shrink-0 z-10 shadow-xl">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Templates & Styling</h2>
                <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold px-2">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveTemplateSubTab('styling')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${activeTemplateSubTab === 'styling' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                  >
                    1. Colors & AI Rewriter
                  </button>
                  <button
                    onClick={() => setActiveTemplateSubTab('layouts')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${activeTemplateSubTab === 'layouts' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                  >
                    2. Choose Template
                  </button>
                </div>

                {activeTemplateSubTab === 'styling' && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Color Theme</label>
                      <div className="grid grid-cols-5 gap-3">
                        {COLOR_PALETTES.map((col) => (
                          <button
                            key={col.hex}
                            onClick={() => setAccentColor(col.hex)}
                            className={`h-11 w-11 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 shadow-xs mx-auto ${accentColor === col.hex ? 'border-slate-900 ring-2 ring-blue-600 scale-105' : 'border-slate-200'}`}
                            style={{ backgroundColor: col.hex }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-200">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">✨ AI Writing Style Rewriter</label>
                      <div className="grid grid-cols-2 gap-2">
                        {WRITING_STYLES.map((style) => (
                          <button
                            key={style.name}
                            onClick={() => setSelectedRewriteStyle(style.name)}
                            className={`text-left p-2.5 rounded-xl border text-xs transition ${selectedRewriteStyle === style.name ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs' : 'border-slate-200 bg-white text-slate-700'}`}
                          >
                            {style.name}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={handleRewriteSummary}
                        disabled={isRewriting}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition mt-2"
                      >
                        {isRewriting ? 'Rewriting...' : `Rewrite Summary in "${selectedRewriteStyle}" Style`}
                      </button>
                    </div>
                  </div>
                )}

                {activeTemplateSubTab === 'layouts' && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Select Template Layout</label>
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-2">
                      {TEMPLATE_LAYOUTS.map((tpl) => (
                        <button
                          key={tpl.id}
                          onClick={() => setActiveTemplate(tpl.id)}
                          className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col gap-1 ${activeTemplate === tpl.id ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 shadow-sm' : 'border-slate-200 hover:bg-slate-50'}`}
                        >
                          <span className="text-xs font-extrabold text-slate-900">{tpl.name}</span>
                          <span className="text-[11px] text-slate-500">{tpl.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fluid Height Canvas Container */}
          <div className="flex-1 bg-slate-200 overflow-y-auto p-8 flex justify-center items-start">
            <div className="bg-white shadow-2xl w-[850px] min-h-full h-auto p-10 text-slate-900 border border-slate-300 mb-12">
              {renderDynamicTemplate()}
            </div>
          </div>
        </div>
      )}

      {currentNav === 'DASHBOARD' && (
        <div className="flex-1 bg-slate-100 p-8">
          <h1 className="text-xl font-bold">Dashboard</h1>
        </div>
      )}

      {currentNav === 'COVER LETTER' && (
        <div className="flex-1 bg-slate-100 p-8">
          <h1 className="text-xl font-bold">Cover Letter Generator</h1>
        </div>
      )}
    </div>
  );
}