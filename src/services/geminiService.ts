


import { GoogleGenAI } from "@google/genai";
import {
    CandidateAnalysisResult,
    InterviewPerformanceResult,
    RewrittenResumeResult,
    ChatTurn,
} from '../types';
import { LLMService, GeminiInput, buildContentPart } from './llmService';
import { 
    candidateAnalysisSchema,
    interviewPerformanceSchema,
    rewrittenResumeSchema 
} from './schemas';

export class GeminiService implements LLMService {
    private model: string;
    private ai: GoogleGenAI;

    constructor(model: string) {
        this.model = model;
        this.ai = new GoogleGenAI({apiKey: process.env.API_KEY});
    }

    async analyzeForCandidate(
        jobInput: GeminiInput,
        resumeInput: GeminiInput,
        language: string
    ): Promise<CandidateAnalysisResult> {

        const systemInstruction = `You are an expert AI Career Co-Pilot. Your goal is to help a job candidate understand how their resume stacks up against a job description. Provide encouraging, constructive, and actionable feedback. Your output must be in JSON and conform to the provided schema. The analysis language should be: ${language}.`;

        const jobPart = buildContentPart(jobInput);
        const resumePart = buildContentPart(resumeInput);

        const promptParts = [
            { text: `
**Analysis Task & Guidelines:**
- **Be Constructive:** Frame all feedback positively. Instead of "weaknesses," use "areas for improvement."
- **Identify Strengths:** Explicitly list the candidate's key strengths that align perfectly with the job description.
- **Action Plan:** Provide a clear, step-by-step action plan the candidate can follow to improve their resume for this specific job.
- **Scoring:** Scores must be based on explicit evidence in the resume. 'Match' requires clear evidence. 'Partial' means related experience is present. 'No Match' means the skill/responsibility is absent.
- **Areas for Improvement:** An area for improvement must be a significant, objective concern (e.g., major skill gaps for a core requirement). Do not list minor discrepancies.
- **Potential Interview Questions:** Generate questions an interviewer might ask the candidate based on their resume and the job description, helping them prepare.
` },
            { text: "Job Description:" },
            jobPart,
            { text: "Candidate's Resume:" },
            resumePart,
        ];

        const response = await this.ai.models.generateContent({
            model: this.model,
            contents: { parts: promptParts },
            config: {
                systemInstruction,
                temperature: 0.2,
                responseMimeType: "application/json",
                responseSchema: candidateAnalysisSchema,
            },
        });

        const result = JSON.parse(response.text.trim());
        return result as CandidateAnalysisResult;
    }

    async analyzeInterviewPerformance(
        jobInput: GeminiInput,
        resumeInput: GeminiInput,
        interviewTranscript: string,
        compatibilityGaps: string[],
        language: string
    ): Promise<InterviewPerformanceResult> {
        const systemInstruction = `You are an expert Interview Coach. Your task is to analyze a candidate's interview transcript and provide constructive feedback to help them improve. Your output must be in JSON and conform to the provided schema. The analysis language should be: ${language}.`;

        const jobPart = buildContentPart(jobInput);
        const resumePart = buildContentPart(resumeInput);

        const promptParts = [
            { text: `
**Analysis Task & Guidelines for Candidate Feedback:**
Your goal is to provide a complete performance review for the candidate based on their interview transcript, in the context of their resume and the job they are applying for. Your entire output must be a single JSON object that strictly adheres to the provided schema. Generate a complete report covering the following points:

1.  **Gap Resolutions**: Review the pre-identified 'Compatibility Gaps'. For each one, analyze the candidate's interview answers to see how well they addressed the concern.
2.  **Performance Score**: Calculate a percentage (0-100) that measures how effectively the candidate communicated their skills and aligned with the job requirements during the interview.
3.  **Areas to Improve Clarity**: Identify any answers that were vague, inconsistent with the resume, or could be strengthened. Provide specific examples.
4.  **Soft Skills Analysis**: Based on the candidate's language, evaluate the soft skills demonstrated (e.g., communication, problem-solving, attitude).
5.  **Demonstrated Strengths**: List any skills, experiences, or qualities the candidate highlighted effectively during the interview, especially those not prominent on the resume.
6.  **Resume Points Not Discussed**: Identify important information from the resume that was not discussed, which could be a missed opportunity for the candidate to emphasize.
7.  **Post-Interview Fit Score**: Recalculate the initial compatibility score (0-100), factoring in the candidate's interview performance.
8.  **Overall Feedback**: Provide a final, clear performance feedback: 'Excellent', 'Good', or 'Needs Improvement'.
` },
            { text: "Job Description:" },
            jobPart,
            { text: "Candidate's Resume:" },
            resumePart,
            { text: `Interview Transcript:\n${interviewTranscript}` },
            { text: `Previously identified compatibility gaps:\n- ${compatibilityGaps.join('\n- ')}` },
        ];

        const response = await this.ai.models.generateContent({
            model: this.model,
            contents: { parts: promptParts },
            config: {
                systemInstruction,
                temperature: 0.2,
                responseMimeType: "application/json",
                responseSchema: interviewPerformanceSchema,
            },
        });

        const result = JSON.parse(response.text.trim());
        return result as InterviewPerformanceResult;
    }

    async rewriteResumeForJob(
        jobInput: GeminiInput,
        resumeInput: GeminiInput,
        language: string,
        chatHistory: ChatTurn[]
    ): Promise<RewrittenResumeResult> {
        const systemInstruction = `You are an expert resume writer. Your task is to rewrite a resume to better align with a specific job description, potentially based on a user's conversational instructions. Your output must be in JSON and conform to the provided schema. The output language should be: ${language}.`;

        const jobPart = buildContentPart(jobInput);
        const resumePart = buildContentPart(resumeInput);

        const historyText = chatHistory.map(turn => 
            `${turn.role === 'user' ? 'User' : 'AI'}: ${turn.text}`
        ).join('\n');

        const promptParts = [
            { text: "Original Resume (Source of Truth):" },
            resumePart,
            { text: "Target Job Description:" },
            jobPart,
// FIX: Escaped the backticks inside the template literal to prevent syntax errors.
            { text: `
**Task: Rewrite the Resume**

Your main goal is to rewrite the **Original Resume** to emphasize skills and experiences most relevant to the **Target Job Description**. 
Follow these strict rules:

**Formatting Rules:**
- Use Markdown headings (e.g., '## Professional Experience').
- Use bold for job titles (e.g., '**Senior Project Manager**').
- Use italics for company names and dates (e.g., '*Some Company | Jan 2020 - Present*').
- Use bullet points ('-') for responsibilities.

**Content Rules:**
- **CRITICAL: You MUST NOT add any new skills or experiences that are not present in the Original Resume. All information must be sourced from the Original Resume.**
- Use keywords from the job description where appropriate and accurate.
- Rephrase bullet points to highlight achievements and impact.

**Conversational History (if any):**
${historyText.length > 0 ? historyText : "No previous conversation."}

**Your Instructions:**
- If there is a conversation history, address the user's latest instruction. Your \`chatResponse\` should directly acknowledge their request. Then, generate the complete, updated resume in the \`rewrittenResume\` field.
- If there is no history, this is the first rewrite. Your \`chatResponse\` should be a brief, welcoming sentence. Then, generate the rewritten resume.
- The output must be the complete, rewritten resume text in a single Markdown string in the \`rewrittenResume\` field of the JSON.`}
        ];

        const response = await this.ai.models.generateContent({
            model: this.model,
            contents: { parts: promptParts },
            config: {
                systemInstruction,
                temperature: 0.2,
                responseMimeType: "application/json",
                responseSchema: rewrittenResumeSchema,
            },
        });

        const result = JSON.parse(response.text.trim());
        return result as RewrittenResumeResult;
    }
}
