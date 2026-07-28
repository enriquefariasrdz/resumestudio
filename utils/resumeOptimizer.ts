// utils/resumeOptimizer.ts
export interface AuditFeedback {
  id: string;
  type: "style" | "grammar" | "impact";
  message: string;
  suggestion?: string;
}

export function auditResumeContent(content: string): AuditFeedback[] {
  const feedback: AuditFeedback[] = [];

  // Example check for active voice / metrics
  if (!content.includes("%") && !content.includes("$")) {
    feedback.push({
      id: "1",
      type: "impact",
      message: "Strong use of active verbs, but consider quantifying your cloud infrastructure cost savings or operational scale.",
    });
  }

  if (content.toLowerCase().includes("responsable de")) {
    feedback.push({
      id: "2",
      type: "style",
      message: "Replace passive phrases like 'responsable de' with stronger action verbs (e.g., 'Architected', 'Spearheaded').",
    });
  }

  return feedback;
}