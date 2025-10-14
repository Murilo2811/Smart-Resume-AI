
export type MatchStatus = 'Match' | 'Partial' | 'No Match';

export type MatchedItem = {
  item: string;
  status: MatchStatus;
  explanation: string;
};

export type SectionMatch<T> = {
  items: T[];
  score: number;
};

export type AnalysisWithScore = {
  analysis: string;
  score: number;
};

export type CandidateAnalysisResult = {
  jobTitle: string;
  summary: string;
  keyResponsibilitiesMatch: SectionMatch<MatchedItem>;
  requiredSkillsMatch: SectionMatch<MatchedItem>;
  niceToHaveSkillsMatch: SectionMatch<MatchedItem>;
  companyCultureFit: AnalysisWithScore;
  salaryAndBenefits: string;
  areasForImprovement: string[];
  potentialInterviewQuestions: string[];
  overallFitScore: number;
  fitExplanation: string;
  compatibilityGaps: string[];
  strengths: string[];
  actionPlan: string[];
};

export type ConsistencySection<T> = {
  items: T;
  score: number;
};

export type GapResolutionItem = {
    gap: string;
    resolution: string;
    isResolved: boolean;
};

export type InterviewPerformanceResult = {
  performanceScore: number;
  summary: string;
  overallFeedback: 'Excellent' | 'Good' | 'Needs Improvement';
  softSkillsAnalysis: ConsistencySection<string>;
  areasToImproveClarity: ConsistencySection<string[]>;
  missingFromInterview: ConsistencySection<string[]>;
  demonstratedStrengths: ConsistencySection<string[]>;
  gapResolutions: ConsistencySection<GapResolutionItem[]>;
  postInterviewFitScore: number;
};

export type RewrittenResumeResult = {
  rewrittenResume: string;
};

// --- New Types for Multi-LLM Support ---

export type LlmProvider = 'gemini' | 'openai' | 'anthropic' | 'groq';

export type LlmConfig = {
    provider: LlmProvider;
    model: string;
    apiKeys: {
        openai?: string;
        anthropic?: string;
        groq?: string;
    };
};
