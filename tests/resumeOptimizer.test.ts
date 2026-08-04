import { describe, it, expect } from 'vitest';
import { auditResumeContent } from '../utils/resumeOptimizer';

describe('Resume Optimizer & Audit Tests', () => {
  it('should flag content lacking quantified metrics (% or $)', () => {
    const resumeText = 'Architected cloud infrastructure and managed Kubernetes clusters.';
    const feedback = auditResumeContent(resumeText);

    const impactIssue = feedback.find((f) => f.type === 'impact');
    expect(impactIssue).toBeDefined();
    expect(impactIssue?.message).toContain('quantifying your cloud infrastructure');
  });

  it('should not flag impact when metrics exist (% or $)', () => {
    const resumeText = 'Reduced deployment time by 45% and saved $120,000 in GCP infrastructure costs.';
    const feedback = auditResumeContent(resumeText);

    const impactIssue = feedback.find((f) => f.type === 'impact');
    expect(impactIssue).toBeUndefined();
  });

  it('should flag passive spanish phrases like "responsable de"', () => {
    const resumeText = 'Responsable de la migración de microservicios en AWS.';
    const feedback = auditResumeContent(resumeText);

    const styleIssue = feedback.find((f) => f.type === 'style');
    expect(styleIssue).toBeDefined();
    expect(styleIssue?.message).toContain('Replace passive phrases');
  });
});
