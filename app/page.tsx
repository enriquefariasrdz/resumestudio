"use client";

import React, { useState, useEffect } from "react";
import AuthModal from "./components/AuthModal";
import AdminDashboard from "./components/AdminDashboard";
import { getAuthSession, signOutUser } from "./actions/authActions";
import { getResumes, saveResumeVersion, deleteResumeVersion } from "./actions/resumeActions";
import { UserSessionPayload } from "@/lib/auth";
import {
  User as UserIcon,
  LogOut,
  Shield,
  LogIn,
  Trash2,
  Plus,
  Check,
  FileText,
  Loader2,
  Upload,
  FileUp,
  Sparkles,
  LayoutTemplate
} from "lucide-react";

const sectionHeaderRegex = /^(?:PROFILE|SUMMARY|PROFESSIONAL\s+SUMMARY|EXECUTIVE\s+SUMMARY|OBJECTIVE|CAREER\s+SUMMARY|WORK\s+HISTORY|WORK\s+EXPERIENCE|PROFESSIONAL\s+EXPERIENCE|EMPLOYMENT\s+HISTORY|EXPERIENCE|EDUCATION(?:\s*&\s*QUALIFICATIONS)?|EDUCATION\s+&\s+QUALIFICATIONS|SKILLS|TECHNICAL\s+SKILLS|CORE\s+COMPETENCIES|CERTIFICATIONS|CERTIFICATE|PROJECTS|ACHIEVEMENTS|AWARDS|HONORS|LANGUAGES|VOLUNTEER|TRAINING|PROFILE)\b/i;

function parseRawTextToResumeFull(rawText: string, fileName: string) {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return {
      name: "Empty Document",
      title: "",
      contact: { address: "", phone: "", email: "", website: "" },
      summary: "",
      experience: [],
      education: [],
      originalContent: rawText,
    };
  }

  // Contact details regex extraction
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : "";

  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : "";

  const urlMatch = rawText.match(/https?:\/\/[^\s]+/);
  const website = urlMatch ? urlMatch[0] : "";

  let name = "";
  let title = "";

  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const line = lines[i];
    if (line.includes("@") || line.includes("http") || /curriculum|vitae|resume/i.test(line)) continue;
    if (!name) {
      name = line;
    } else if (!title && line.length < 60) {
      title = line;
      break;
    }
  }

  if (!name) name = lines[0] || "Uploaded Resume Candidate";
  if (!title) title = "Professional Role";

  const dateRegex = /\b(?:19|20)\d{2}(?:\s*[-–—/]\s*(?:(?:19|20)\d{2}|Current|Present|Now))?\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*(?:19|20)\d{2}\b/i;

  let currentSection: "SUMMARY" | "EXPERIENCE" | "EDUCATION" | "OTHER" = "SUMMARY";
  let summaryLines: string[] = [];
  const experiences: { period: string; role: string; company: string; bullets: string[] }[] = [];
  const education: { period: string; degree: string; institution: string }[] = [];

  let currentJob: { period: string; role: string; company: string; bullets: string[] } | null = null;
  let currentEdu: { period: string; degree: string; institution: string } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (sectionHeaderRegex.test(line)) {
      const upper = line.toUpperCase();
      if (upper.includes("EDUCATION")) {
        currentSection = "EDUCATION";
      } else if (upper.includes("EXPERIENCE") || upper.includes("EMPLOYMENT") || upper.includes("HISTORY")) {
        currentSection = "EXPERIENCE";
      } else if (upper.includes("SUMMARY") || upper.includes("OBJECTIVE")) {
        currentSection = "SUMMARY";
      } else {
        currentSection = "OTHER";
      }
      continue;
    }

    if (currentSection === "SUMMARY") {
      if (line !== name && line !== title && line !== email && line !== phone && line !== website) {
        summaryLines.push(line);
      }
    } else if (currentSection === "EXPERIENCE" || currentSection === "OTHER") {
      const hasDate = dateRegex.test(line);

      if (
        hasDate ||
        (!line.startsWith("•") &&
          !line.startsWith("-") &&
          !line.startsWith("*") &&
          line.length < 90 &&
          i + 1 < lines.length &&
          (lines[i + 1].startsWith("•") || lines[i + 1].startsWith("-") || lines[i + 1].startsWith("*")))
      ) {
        if (currentJob) {
          experiences.push(currentJob);
        }

        let period = "Period";
        let role = line;
        let company = "";

        const dateMatch = line.match(dateRegex);
        if (dateMatch) {
          period = dateMatch[0];
          const textWithoutDate = line
            .replace(dateMatch[0], "")
            .replace(/^[|\-–—,\s]+|[|\-–—,\s]+$/g, "")
            .trim();
          if (textWithoutDate) {
            const parts = textWithoutDate.split(/[|–—–-]/).map((p) => p.trim());
            role = parts[0] || line;
            company = parts.slice(1).join(" - ");
          }
        }

        currentJob = {
          period,
          role: role || "Role",
          company: company || "Company",
          bullets: [],
        };
      } else {
        const bulletText = line.replace(/^[-•*]\s*/, "");
        if (currentJob) {
          currentJob.bullets.push(bulletText);
        } else {
          currentJob = {
            period: "Experience",
            role: title,
            company: fileName,
            bullets: [bulletText],
          };
        }
      }
    } else if (currentSection === "EDUCATION") {
      const dateMatch = line.match(dateRegex);
      if (dateMatch || !currentEdu) {
        if (currentEdu) education.push(currentEdu);
        currentEdu = {
          period: dateMatch ? dateMatch[0] : "Education",
          degree: line
            .replace(dateMatch ? dateMatch[0] : "", "")
            .replace(/^[|\-–—,\s]+|[|\-–—,\s]+$/g, "")
            .trim() || line,
          institution: "Institution",
        };
      } else {
        currentEdu.institution =
          currentEdu.institution === "Institution" ? line : `${currentEdu.institution} - ${line}`;
      }
    }
  }

  if (currentJob) experiences.push(currentJob);
  if (currentEdu) education.push(currentEdu);

  if (experiences.length === 0) {
    experiences.push({
      period: "Full Document Content",
      role: title,
      company: fileName,
      bullets: lines.filter((l) => l !== name && l !== title && l !== email && l !== phone),
    });
  }

  return {
    name,
    title,
    contact: {
      address: "Address",
      phone: phone || "Phone",
      email: email || "Email",
      website: website || "https://linkedin.com",
    },
    summary: summaryLines.join("\n") || lines.slice(0, 3).join("\n"),
    experience: experiences,
    education: education.length > 0 ? education : [
      {
        period: "Education",
        degree: "Qualifications / Degree",
        institution: "Institution",
      },
    ],
    originalContent: rawText,
  };
}

export default function ResumeStudioPage() {
  const [currentUser, setCurrentUser] = useState<UserSessionPayload | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "admin">("editor");

  const [resumeData, setResumeData] = useState<any>({
    name: "Enrique Farias Rodriguez",
    title: "Site Reliability Engineer",
    contact: {
      address: "64630, Monterrey Mexico",
      phone: "528-118-213655",
      email: "enriquefariasrdz@gmail.com",
      website: "https://enriquefariasrdz.wixsite.com/softeng",
    },
    summary:
      "18 Years of Experience on IT Industry: 7 SRE/DevOps, 6 Team Lead Production Support, 5 Team Lead Helpdesk. Experienced SRE with international retail, gaming, and enterprise background managing GCP, AWS, Azure, and Kubernetes.",
    experience: [
      {
        period: "2021-12 - Current",
        role: "Senior DevOps Engineer (SRE)",
        company: "Grid Dynamics - American Eagle Outfitters, Monterrey, Mexico (Remote)",
        bullets: [
          "Troubleshoot applications on GCP and on premises, mainly focused on GKE, PubSub, CloudSQL.",
          "Resolve slowness on the website, add to bag, throughput or bot attacks.",
          "Provide Correction of Error documentation from the High Severity incidents.",
          "Create and correct dashboards to determine the website reliability.",
        ],
      },
      {
        period: "2020-09 - 2021-12",
        role: "DevOps Engineer",
        company: "Softtek - Electronic Arts, Guadalajara, Mexico",
        bullets: [
          "Worked as Observability Engineer providing accurate and constant metrics to trigger alerts and incidents.",
          "Managed and sealed SSL certificates with Helm/Kubernetes secrets.",
          "Integrated new routes to monitor and transmit metrics with RabbitMQ and Graphite apps.",
        ],
      },
      {
        period: "2018-11 - 2020-03",
        role: "DevOps Engineer",
        company: "Softtek - Staples, Guadalajara, Mexico",
        bullets: [
          "Designed and implemented Zabbix Monitoring on Azure and on premises, saving 10 million USD per year.",
          "Deployed components and applications using ARM templates automating on Azure DevOps pipelines.",
        ],
      },
    ],
    education: [
      {
        period: "1998-09 - 2002-01",
        degree: "BBA: Business Administration of Tourism",
        institution: "Instituto Regiomontano De Hoteleria AC - Monterrey",
      },
    ],
    originalContent: "",
  });

  const [activeTemplate, setActiveTemplate] = useState<"original" | "ats" | "modern">("ats");
  const [isEditing, setIsEditing] = useState(false);
  const [savedDbResumes, setSavedDbResumes] = useState<any[]>([]);
  const [versionNameInput, setVersionNameInput] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveNotification, setSaveNotification] = useState("");
  const [savingLoading, setSavingLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");

  // Check auth session on load
  useEffect(() => {
    async function checkAuth() {
      const res = await getAuthSession();
      if (res.success && res.user) {
        setCurrentUser(res.user);
        fetchUserResumes();
      }
    }
    checkAuth();
  }, []);

  const fetchUserResumes = async () => {
    const res = await getResumes();
    if (res.success && res.data) {
      setSavedDbResumes(res.data);
    }
  };

  const handleAuthSuccess = (user: UserSessionPayload) => {
    setCurrentUser(user);
    fetchUserResumes();
    setSaveNotification(`Welcome back, ${user.name || user.email}!`);
    setTimeout(() => setSaveNotification(""), 4000);
  };

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
    setSavedDbResumes([]);
    setActiveTab("editor");
    setSaveNotification("Logged out successfully.");
    setTimeout(() => setSaveNotification(""), 4000);
  };

  const handleFieldChange = (field: string, value: string) => {
    setResumeData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (field: string, value: string) => {
    setResumeData((prev: any) => ({
      ...prev,
      contact: { ...prev.contact, [field]: value },
    }));
  };

  const handleExperienceChange = (index: number, field: string, value: string) => {
    const updated = [...resumeData.experience];
    updated[index] = { ...updated[index], [field]: value };
    setResumeData((prev: any) => ({ ...prev, experience: updated }));
  };

  const handleBulletChange = (expIndex: number, bulletIndex: number, value: string) => {
    const updated = [...resumeData.experience];
    const newBullets = [...updated[expIndex].bullets];
    newBullets[bulletIndex] = value;
    updated[expIndex] = { ...updated[expIndex], bullets: newBullets };
    setResumeData((prev: any) => ({ ...prev, experience: updated }));
  };

  const handleAddBullet = (expIndex: number) => {
    const updated = [...resumeData.experience];
    updated[expIndex].bullets.push("");
    setResumeData((prev: any) => ({ ...prev, experience: updated }));
  };

  const handleRemoveBullet = (expIndex: number, bulletIndex: number) => {
    const updated = [...resumeData.experience];
    updated[expIndex].bullets = updated[expIndex].bullets.filter((_: any, i: number) => i !== bulletIndex);
    setResumeData((prev: any) => ({ ...prev, experience: updated }));
  };

  const handleAddExperience = () => {
    const newJob = {
      period: "YYYY-MM - Present",
      role: "Job Title",
      company: "Company Name, Location",
      bullets: [""],
    };
    setResumeData((prev: any) => ({
      ...prev,
      experience: [newJob, ...prev.experience],
    }));
  };

  const handleRemoveExperience = (index: number) => {
    const updated = resumeData.experience.filter((_: any, i: number) => i !== index);
    setResumeData((prev: any) => ({ ...prev, experience: updated }));
  };

  const handleSaveVersion = async () => {
    if (!currentUser) {
      setShowSaveModal(false);
      setShowAuthModal(true);
      return;
    }

    setSavingLoading(true);
    const versionName = versionNameInput.trim() || `v${savedDbResumes.length + 1}`;
    const title = `${resumeData.title || "Resume"} (${versionName})`;

    const contentStr = JSON.stringify(resumeData);
    const res = await saveResumeVersion(null, title, versionName, contentStr);

    setSavingLoading(false);
    if (res.success) {
      setVersionNameInput("");
      setShowSaveModal(false);
      fetchUserResumes();
      setSaveNotification(`Successfully saved "${title}"!`);
      setTimeout(() => setSaveNotification(""), 4000);
    } else {
      alert(res.error || "Failed to save resume version");
    }
  };

  const handleLoadVersion = (rawContent: string) => {
    try {
      const parsed = JSON.parse(rawContent);
      if (parsed.name || parsed.experience || parsed.originalContent) {
        setResumeData(parsed);
        if (parsed.originalContent) {
          setActiveTemplate("original");
        }
        setSaveNotification("Loaded saved resume version!");
        setTimeout(() => setSaveNotification(""), 4000);
      }
    } catch (e) {
      console.error("Error parsing resume JSON:", e);
    }
  };

  const handleDeleteVersion = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this resume version?")) {
      const res = await deleteResumeVersion(id);
      if (res.success) {
        fetchUserResumes();
        setSaveNotification("Deleted resume version.");
        setTimeout(() => setSaveNotification(""), 4000);
      }
    }
  };

  const handleParseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExts = [".pdf", ".docx"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExts.includes(ext)) {
      alert("Unsupported file format! Please upload a PDF (.pdf) or Word document (.docx).");
      return;
    }

    setUploading(true);
    setUploadFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.text) {
        throw new Error(data.error || "Failed to parse file content.");
      }

      // Parse full raw text preserving original layout
      const parsedFullResume = parseRawTextToResumeFull(data.text, file.name);
      setResumeData(parsedFullResume);

      // Automatically switch layout view to Original Layout
      setActiveTemplate("original");

      setSaveNotification(`Successfully parsed original layout from "${file.name}"!`);
      setTimeout(() => setSaveNotification(""), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to upload and parse file.");
    } finally {
      setUploading(false);
      setUploadFileName("");
      e.target.value = "";
    }
  };

  const splitOriginalContentIntoSections = (text: string) => {
    const rawLines = text.split(/\r?\n/);

    const sections: { header: string; lines: string[] }[] = [];
    let currentSection = { header: "Top Content", lines: [] as string[] };

    rawLines.forEach((rawLine) => {
      const trimmed = rawLine.trim();
      const isHeader = sectionHeaderRegex.test(trimmed);

      if (isHeader) {
        if (currentSection.lines.length > 0 || currentSection.header !== "Top Content") {
          sections.push(currentSection);
        }
        currentSection = { header: trimmed, lines: [] };
      } else {
        currentSection.lines.push(rawLine);
      }
    });

    sections.push(currentSection);
    return sections.filter((section, idx) => section.lines.length > 0 || idx === 0);
  };

  const rebuildOriginalContentFromSections = (sections: { header: string; lines: string[] }[]) => {
    return sections
      .map((section) => {
        if (section.header === "Top Content") {
          return section.lines.join("\n");
        }
        return [section.header, ...section.lines].join("\n");
      })
      .join("\n\n");
  };

  const handleOriginalSectionChange = (index: number, updatedText: string) => {
    const sections = splitOriginalContentIntoSections(resumeData.originalContent || "");
    const updatedLines = updatedText.split(/\r?\n/);
    sections[index] = { ...sections[index], lines: updatedLines };
    setResumeData((prev: any) => ({ ...prev, originalContent: rebuildOriginalContentFromSections(sections) }));
  };

  // Helper to render high-fidelity original layout line by line
  const renderOriginalLayoutLines = (text: string) => {
    if (!text) return null;
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    const dateRegex = /\b(?:19|20)\d{2}(?:\s*[-–—/]\s*(?:(?:19|20)\d{2}|Current|Present|Now))?\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*(?:19|20)\d{2}\b/i;

    return (
      <div className="space-y-2 font-sans">
        {lines.map((line, idx) => {
          const isSectionHeader = sectionHeaderRegex.test(line);
          const hasDate = dateRegex.test(line);
          const isBullet = line.startsWith("•") || line.startsWith("-") || line.startsWith("*");

          if (idx === 0) {
            // Document Title / Full Name Line
            return (
              <h1 key={idx} className="text-3xl font-extrabold text-slate-900 border-b-2 border-slate-900 pb-2 mb-3">
                {line}
              </h1>
            );
          }

          if (idx === 1 && line.length < 70 && !line.includes("@")) {
            // Candidate Role / Subtitle
            return (
              <h2 key={idx} className="text-lg font-semibold text-slate-700 mb-2">
                {line}
              </h2>
            );
          }

          if (isSectionHeader) {
            // Section Heading
            return (
              <h3 key={idx} className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-300 pb-1 mt-6 mb-2">
                {line}
              </h3>
            );
          }

          if (hasDate) {
            // Date / Role Line
            const dateMatch = line.match(dateRegex);
            const dateText = dateMatch ? dateMatch[0] : "";
            const titleText = line.replace(dateText, "").replace(/^[|\-–—,\s]+|[|\-–—,\s]+$/g, "").trim();

            return (
              <div key={idx} className="flex justify-between items-baseline font-bold text-xs sm:text-sm text-slate-900 mt-3">
                <span>{titleText || line}</span>
                {dateText && <span className="font-mono text-xs text-slate-600 ml-4">{dateText}</span>}
              </div>
            );
          }

          if (isBullet) {
            const cleanBullet = line.replace(/^[-•*]\s*/, "");
            return (
              <div key={idx} className="flex items-start space-x-2 pl-4 py-0.5 text-xs sm:text-sm text-slate-800 leading-relaxed">
                <span className="text-indigo-600 font-bold select-none">•</span>
                <span>{cleanBullet}</span>
              </div>
            );
          }

          return (
            <p key={idx} className="text-xs sm:text-sm text-slate-800 leading-relaxed">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative">
      {/* Toast Notification Banner */}
      {saveNotification && (
        <div className="fixed top-20 right-6 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold border border-indigo-500 transition animate-bounce flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>{saveNotification}</span>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Save Version Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Save Current Resume Version
            </h3>
            <p className="text-xs text-slate-400">
              Give this version a custom name/label so you can reference or reload it later.
            </p>
            <input
              type="text"
              placeholder="e.g., SRE Target Role v2"
              value={versionNameInput}
              onChange={(e) => setVersionNameInput(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVersion}
                disabled={savingLoading}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow flex items-center space-x-1"
              >
                {savingLoading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
                <span>Confirm & Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
              R
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Resume Studio</h1>
          </div>
          <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/30 font-semibold">
            Pro Multi-User
          </span>

          {/* Navigation Views */}
          <div className="ml-4 flex bg-slate-950 p-1 rounded-xl border border-slate-800 space-x-1">
            <button
              onClick={() => setActiveTab("editor")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === "editor"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Resume Editor
            </button>
            {currentUser?.role === "ADMIN" && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 ${
                  activeTab === "admin"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-amber-400 hover:text-amber-300"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </button>
            )}
          </div>
        </div>

        {/* User Auth & Top Action Controls */}
        <div className="flex items-center space-x-3">
          {activeTab === "editor" && (
            <>
              {/* Top Upload Resume Button */}
              <div>
                <input
                  type="file"
                  id="top-resume-upload"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={handleParseUpload}
                  disabled={uploading}
                />
                <label
                  htmlFor="top-resume-upload"
                  className={`cursor-pointer flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition ${
                    uploading
                      ? "bg-slate-800 text-slate-400 border-slate-700"
                      : "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow-sm"
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      <span>Parsing Layout...</span>
                    </>
                  ) : (
                    <>
                      <FileUp className="w-3.5 h-3.5" />
                      <span>Upload PDF / DOCX</span>
                    </>
                  )}
                </label>
              </div>

              {/* Layout Templates Selection */}
              <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex space-x-1">
                <button
                  onClick={() => setActiveTemplate("original")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center space-x-1 ${
                    activeTemplate === "original"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <LayoutTemplate className="w-3 h-3" />
                  <span>Original Layout</span>
                </button>
                <button
                  onClick={() => setActiveTemplate("ats")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                    activeTemplate === "ats" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  ATS Minimalist
                </button>
                <button
                  onClick={() => setActiveTemplate("modern")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                    activeTemplate === "modern" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Modern Executive
                </button>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition ${
                  isEditing
                    ? "bg-emerald-600 text-white hover:bg-emerald-500"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
                }`}
              >
                {isEditing ? "Preview Mode" : "Edit Resume"}
              </button>

              <button
                onClick={() => {
                  if (!currentUser) {
                    setShowAuthModal(true);
                  } else {
                    setShowSaveModal(true);
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 text-xs font-semibold rounded-xl shadow transition"
              >
                Save Version
              </button>
            </>
          )}

          <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />

          {/* User Account Controls */}
          {currentUser ? (
            <div className="flex items-center space-x-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs">
                  {currentUser.email[0].toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                    {currentUser.name || currentUser.email.split("@")[0]}
                  </p>
                  <p className="text-[10px] text-indigo-400 font-mono leading-none">
                    {currentUser.role}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                title="Log Out"
                className="text-slate-400 hover:text-red-400 p-1 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-4 py-1.5 text-xs font-semibold rounded-xl shadow-lg transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      {activeTab === "admin" && currentUser?.role === "ADMIN" ? (
        <AdminDashboard />
      ) : (
        <div className="flex-1 grid grid-cols-12 gap-6 p-6 w-full items-start max-w-7xl mx-auto">
          {/* Left Sidebar */}
          <aside className="col-span-12 md:col-span-3 space-y-6">
            {/* Upload PDF/DOCX Resume Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center space-x-2 text-indigo-400">
                <Upload className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Upload Original Layout
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Import PDF or Word (.docx) files to render and preserve the exact original layout and text flow.
              </p>

              <input
                type="file"
                id="sidebar-resume-upload"
                accept=".pdf,.docx"
                className="hidden"
                onChange={handleParseUpload}
                disabled={uploading}
              />
              <label
                htmlFor="sidebar-resume-upload"
                className={`border-2 border-dashed rounded-xl p-5 text-center transition block cursor-pointer ${
                  uploading
                    ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                    : "border-slate-800 hover:border-indigo-500/50 bg-slate-950/60 hover:bg-slate-950 text-slate-400 hover:text-slate-200"
                }`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center justify-center space-y-2 py-1">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                    <p className="text-xs font-medium text-indigo-300 truncate max-w-full">
                      Parsing original layout of {uploadFileName}...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    <FileUp className="w-6 h-6 text-indigo-400" />
                    <p className="text-xs font-medium text-slate-200">
                      Click to browse or drop file
                    </p>
                    <span className="text-[10px] text-slate-500">
                      Preserves 100% Original Layout
                    </span>
                  </div>
                )}
              </label>
            </div>

            {/* User Status Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <UserIcon className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {currentUser ? "My Workspace" : "Guest Mode"}
                </h3>
              </div>
              {currentUser ? (
                <p className="text-xs text-slate-400">
                  Logged in as <strong className="text-slate-200">{currentUser.email}</strong>. Resumes saved here are private to your account.
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400">
                    Sign in to save and sync your resume versions securely across sessions.
                  </p>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="w-full text-xs font-semibold py-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-xl border border-slate-700 transition"
                  >
                    Log In / Register
                  </button>
                </div>
              )}
            </div>

            {/* Saved Resumes List */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>My Saved Versions ({savedDbResumes.length})</span>
                </h3>
              </div>

              {!currentUser ? (
                <p className="text-xs text-slate-500 italic">Please sign in to view your saved resume versions.</p>
              ) : savedDbResumes.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No custom versions saved yet. Click &quot;Save Version&quot; above.</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {savedDbResumes.map((ver) => (
                    <div
                      key={ver.id}
                      onClick={() => handleLoadVersion(ver.content)}
                      className="p-3 bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/40 rounded-xl cursor-pointer transition flex items-center justify-between group"
                    >
                      <div className="truncate mr-2">
                        <p className="text-xs font-semibold text-white truncate">{ver.title}</p>
                        <span className="text-[10px] text-slate-500 block">
                          {new Date(ver.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteVersion(e, ver.id)}
                        title="Delete Version"
                        className="text-slate-600 hover:text-red-400 p-1 rounded transition opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Main Document Canvas */}
          <main className="col-span-12 md:col-span-9 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                <span>Mode: {isEditing ? "Live Layout Editor" : "Live Layout Preview"}</span>
                {activeTemplate === "original" && (
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                    High-Fidelity Original Layout
                  </span>
                )}
              </span>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                100% Layout & Content Preserved
              </span>
            </div>

            <div className="flex-1 flex flex-col w-full">
              {activeTemplate === "original" ? (
                /* High-Fidelity Original Layout Template Canvas */
                <div className="bg-white text-slate-900 p-8 sm:p-14 rounded-xl shadow-2xl max-w-4xl mx-auto w-full font-sans border border-slate-200 space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                          Live Document Content Editor (Preserves original text flow)
                        </label>
                        <p className="text-[11px] text-slate-500">
                          Edit the resume in smaller sections to keep the format organized and avoid the full document becoming one large block.
                        </p>
                      </div>
                      <div className="space-y-4">
                        {splitOriginalContentIntoSections(resumeData.originalContent || "").map((section, sectionIndex) => (
                          <div
                            key={section.header + sectionIndex}
                            className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-3 gap-3">
                              <div>
                                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 font-semibold">
                                  {section.header === "Top Content" ? "General Section" : section.header}
                                </p>
                                {section.header !== "Top Content" && (
                                  <p className="text-[10px] text-slate-400 mt-1">
                                    Edits here update only this section of the resume.
                                  </p>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                                {section.lines.length} line{section.lines.length === 1 ? "" : "s"}
                              </span>
                            </div>
                            <textarea
                              rows={Math.min(Math.max(section.lines.length + 3, 8), 18)}
                              value={section.lines.join("\n")}
                              onChange={(e) => handleOriginalSectionChange(sectionIndex, e.target.value)}
                              className="w-full text-xs font-mono p-4 border border-slate-300 rounded-2xl focus:outline-none focus:border-indigo-600 leading-relaxed bg-white text-slate-900 shadow-inner"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {resumeData.originalContent ? (
                        renderOriginalLayoutLines(resumeData.originalContent)
                      ) : (
                        <div className="space-y-4 font-sans text-slate-900">
                          <h1 className="text-3xl font-extrabold border-b-2 border-slate-900 pb-2 mb-2">
                            {resumeData.name}
                          </h1>
                          <p className="text-base font-semibold text-slate-700">{resumeData.title}</p>
                          <p className="text-xs text-slate-600">
                            {resumeData.contact.address} • {resumeData.contact.phone} • {resumeData.contact.email}
                          </p>

                          <div className="space-y-3 pt-3">
                            <h3 className="text-sm font-bold uppercase tracking-wider border-b-2 border-slate-300 pb-1">
                              Professional Summary
                            </h3>
                            <p className="text-xs leading-relaxed">{resumeData.summary}</p>

                            <h3 className="text-sm font-bold uppercase tracking-wider border-b-2 border-slate-300 pb-1 pt-3">
                              Work Experience
                            </h3>
                            {resumeData.experience?.map((exp: any, i: number) => (
                              <div key={i} className="space-y-1">
                                <div className="font-bold text-xs flex justify-between">
                                  <span>{exp.role} - {exp.company}</span>
                                  <span className="font-mono">{exp.period}</span>
                                </div>
                                <ul className="list-disc list-inside text-xs pl-2 space-y-1">
                                  {exp.bullets?.map((b: string, bi: number) => (
                                    <li key={bi}>{b}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : activeTemplate === "ats" ? (
                /* ATS Minimalist Template */
                <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-lg max-w-4xl mx-auto w-full font-serif space-y-6">
                  {/* Name & Title */}
                  <div className="border-b pb-4 text-center sm:text-left">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={resumeData.name}
                          onChange={(e) => handleFieldChange("name", e.target.value)}
                          className="w-full text-2xl font-bold font-sans border-b border-slate-300 focus:outline-none focus:border-indigo-600 py-1"
                        />
                        <input
                          type="text"
                          value={resumeData.title}
                          onChange={(e) => handleFieldChange("title", e.target.value)}
                          className="w-full text-base text-slate-600 font-sans border-b border-slate-300 focus:outline-none focus:border-indigo-600 py-1"
                        />
                      </div>
                    ) : (
                      <>
                        <h2 className="text-3xl font-bold font-sans text-slate-900">{resumeData.name}</h2>
                        <p className="text-lg text-slate-700 font-sans font-medium">{resumeData.title}</p>
                      </>
                    )}

                    {/* Contact Details */}
                    <div className="text-xs font-sans text-slate-600 flex flex-wrap gap-x-4 gap-y-1 mt-2">
                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-2 w-full mt-2">
                          <input
                            type="text"
                            value={resumeData.contact.address}
                            onChange={(e) => handleContactChange("address", e.target.value)}
                            placeholder="Address"
                            className="text-xs p-1.5 border border-slate-300 rounded font-sans"
                          />
                          <input
                            type="text"
                            value={resumeData.contact.phone}
                            onChange={(e) => handleContactChange("phone", e.target.value)}
                            placeholder="Phone"
                            className="text-xs p-1.5 border border-slate-300 rounded font-sans"
                          />
                          <input
                            type="text"
                            value={resumeData.contact.email}
                            onChange={(e) => handleContactChange("email", e.target.value)}
                            placeholder="Email"
                            className="text-xs p-1.5 border border-slate-300 rounded font-sans"
                          />
                          <input
                            type="text"
                            value={resumeData.contact.website}
                            onChange={(e) => handleContactChange("website", e.target.value)}
                            placeholder="Website"
                            className="text-xs p-1.5 border border-slate-300 rounded font-sans"
                          />
                        </div>
                      ) : (
                        <>
                          <span>{resumeData.contact.address}</span>
                          <span>•</span>
                          <span>{resumeData.contact.phone}</span>
                          <span>•</span>
                          <span>{resumeData.contact.email}</span>
                          <span>•</span>
                          <a href={resumeData.contact.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                            {resumeData.contact.website}
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider font-sans border-b border-slate-300 pb-1 text-slate-900">
                      Professional Summary
                    </h3>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={resumeData.summary}
                        onChange={(e) => handleFieldChange("summary", e.target.value)}
                        className="w-full text-xs font-sans p-2 border border-slate-300 rounded focus:outline-none focus:border-indigo-600"
                      />
                    ) : (
                      <p className="text-xs leading-relaxed text-slate-800 font-sans whitespace-pre-line">{resumeData.summary}</p>
                    )}
                  </div>

                  {/* Experience */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-300 pb-1">
                      <h3 className="text-sm font-bold uppercase tracking-wider font-sans text-slate-900">
                        Professional Experience
                      </h3>
                      {isEditing && (
                        <button
                          onClick={handleAddExperience}
                          className="text-xs bg-indigo-600 text-white font-sans font-medium px-2.5 py-1 rounded hover:bg-indigo-500 flex items-center space-x-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Job</span>
                        </button>
                      )}
                    </div>

                    {resumeData.experience.map((exp: any, expIdx: number) => (
                      <div key={expIdx} className="space-y-2 relative group">
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveExperience(expIdx)}
                            className="absolute right-0 top-0 text-red-500 hover:text-red-700 text-xs font-sans border border-red-200 px-2 py-0.5 rounded bg-red-50"
                          >
                            Remove Job
                          </button>
                        )}
                        <div className="flex justify-between items-baseline font-sans">
                          {isEditing ? (
                            <div className="grid grid-cols-3 gap-2 w-full pr-20">
                              <input
                                type="text"
                                value={exp.role}
                                onChange={(e) => handleExperienceChange(expIdx, "role", e.target.value)}
                                placeholder="Role Title"
                                className="font-bold text-xs p-1 border border-slate-300 rounded"
                              />
                              <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => handleExperienceChange(expIdx, "company", e.target.value)}
                                placeholder="Company"
                                className="text-xs p-1 border border-slate-300 rounded"
                              />
                              <input
                                type="text"
                                value={exp.period}
                                onChange={(e) => handleExperienceChange(expIdx, "period", e.target.value)}
                                placeholder="Period"
                                className="text-xs p-1 border border-slate-300 rounded"
                              />
                            </div>
                          ) : (
                            <>
                              <div>
                                <span className="font-bold text-sm text-slate-900">{exp.role}</span>
                                {exp.company && <span className="text-xs text-slate-600 ml-2">| {exp.company}</span>}
                              </div>
                              <span className="text-xs text-slate-500 font-mono">{exp.period}</span>
                            </>
                          )}
                        </div>

                        {/* Bullets */}
                        <ul className="list-disc list-inside text-xs font-sans text-slate-800 space-y-1 pl-2">
                          {exp.bullets.map((bullet: string, bulletIdx: number) => (
                            <li key={bulletIdx} className="leading-relaxed">
                              {isEditing ? (
                                <div className="inline-flex items-center space-x-2 w-11/12 my-0.5">
                                  <input
                                    type="text"
                                    value={bullet}
                                    onChange={(e) => handleBulletChange(expIdx, bulletIdx, e.target.value)}
                                    className="w-full text-xs p-1 border border-slate-300 rounded"
                                  />
                                  <button
                                    onClick={() => handleRemoveBullet(expIdx, bulletIdx)}
                                    className="text-red-500 hover:text-red-700 text-xs px-1"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <span>{bullet}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                        {isEditing && (
                          <button
                            onClick={() => handleAddBullet(expIdx)}
                            className="text-[11px] text-indigo-600 hover:underline font-sans font-medium"
                          >
                            + Add bullet point
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Education */}
                  <div className="space-y-2 pt-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider font-sans border-b border-slate-300 pb-1 text-slate-900">
                      Education & Qualifications
                    </h3>
                    {resumeData.education.map((edu: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-baseline font-sans text-xs">
                        <div>
                          <span className="font-bold text-slate-900">{edu.degree}</span>
                          {edu.institution && <span className="text-slate-600 ml-2">— {edu.institution}</span>}
                        </div>
                        <span className="text-slate-500 font-mono">{edu.period}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Modern Executive Template */
                <div className="bg-slate-900 border border-slate-800 text-white p-8 sm:p-12 rounded-xl shadow-2xl max-w-4xl mx-auto w-full space-y-6">
                  <div className="border-b border-indigo-500/30 pb-4">
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                      {resumeData.name}
                    </h2>
                    <p className="text-base text-indigo-300 font-medium">{resumeData.title}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {resumeData.contact.address} • {resumeData.contact.phone} • {resumeData.contact.email}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      Executive Summary
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-line">{resumeData.summary}</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 border-b border-slate-800 pb-1">
                      Key Career Milestones
                    </h3>
                    {resumeData.experience.map((exp: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-white">{exp.role}</span>
                          <span className="text-indigo-400 font-mono">{exp.period}</span>
                        </div>
                        <p className="text-xs text-slate-400 italic">{exp.company}</p>
                        <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pt-1">
                          {exp.bullets.map((b: string, bIdx: number) => (
                            <li key={bIdx}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}