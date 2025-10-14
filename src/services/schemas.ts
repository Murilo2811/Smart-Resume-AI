
import { Type } from "@google/genai";

export const matchedItemSchema = {
    type: Type.OBJECT,
    properties: {
        item: { type: Type.STRING, description: "The specific responsibility or skill from the job description." },
        status: { type: Type.STRING, enum: ['Match', 'Partial', 'No Match'], description: "The match status. 'Match' requires direct evidence. 'Partial' indicates related but not direct experience. 'No Match' means the skill is absent." },
        explanation: { type: Type.STRING, description: "A brief, factual explanation of why this status was given, referencing specific parts of the resume." },
    },
    required: ['item', 'status', 'explanation']
};

export const sectionMatchSchema = {
    type: Type.OBJECT,
    properties: {
        items: {
            type: Type.ARRAY,
            items: matchedItemSchema
        },
        score: { type: Type.NUMBER, description: "A score from 0 to 100 representing the match for this section, heavily weighted by 'Match' statuses on required items." },
    },
    required: ['items', 'score']
};

export const analysisWithScoreSchema = {
    type: Type.OBJECT,
    properties: {
        analysis: { type: Type.STRING, description: "The detailed analysis text." },
        score: { type: Type.NUMBER, description: "A score from 0 to 100 for this analysis." },
    },
    required: ['analysis', 'score']
};

export const candidateAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        jobTitle: { type: Type.STRING, description: "The job title from the job description." },
        summary: { type: Type.STRING, description: "A concise summary of the candidate's fit for the role, framed as advice to the candidate." },
        keyResponsibilitiesMatch: sectionMatchSchema,
        requiredSkillsMatch: sectionMatchSchema,
        niceToHaveSkillsMatch: sectionMatchSchema,
        companyCultureFit: analysisWithScoreSchema,
        salaryAndBenefits: { type: Type.STRING, description: "Analysis of salary expectations and benefits, only if explicitly mentioned in the resume." },
        areasForImprovement: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING }, 
            description: "A list of potential areas for improvement or concerns for the candidate to address."
        },
        potentialInterviewQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of potential interview questions the candidate might be asked, based on their resume and the job description." },
        overallFitScore: { type: Type.NUMBER, description: "An overall fit score from 0 to 100, weighting required skills and key responsibilities most heavily." },
        fitExplanation: { type: Type.STRING, description: "A detailed explanation for the overall fit score, justifying the number with concrete evidence from the analysis." },
        compatibilityGaps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of specific, crucial gaps between the resume and the job description's core requirements." },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of the candidate's strongest qualifications and experiences that directly match the job requirements." },
        actionPlan: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of concrete, actionable steps the candidate can take to improve their resume and application for this role." },
    },
    required: [
        'jobTitle', 'summary', 'keyResponsibilitiesMatch', 'requiredSkillsMatch',
        'niceToHaveSkillsMatch', 'companyCultureFit', 'salaryAndBenefits', 'areasForImprovement',
        'potentialInterviewQuestions', 'overallFitScore', 'fitExplanation', 'compatibilityGaps',
        'strengths', 'actionPlan'
    ]
};

export const consistencySectionStringSchema = {
    type: Type.OBJECT,
    properties: {
        items: { type: Type.STRING },
        score: { type: Type.NUMBER, description: "Score from 0 to 100 based on the analysis." },
    },
    required: ['items', 'score']
};

export const consistencySectionStringArraySchema = {
    type: Type.OBJECT,
    properties: {
        items: { type: Type.ARRAY, items: { type: Type.STRING } },
        score: { type: Type.NUMBER, description: "Score from 0 to 100. For areas to improve, a lower score is better." },
    },
    required: ['items', 'score']
};

export const gapResolutionItemSchema = {
    type: Type.OBJECT,
    properties: {
        gap: { type: Type.STRING, description: "The specific compatibility gap identified before the interview." },
        resolution: { type: Type.STRING, description: "The candidate's response or clarification from the interview transcript that addresses this gap. If the gap was not addressed, explain why." },
        isResolved: { type: Type.BOOLEAN, description: "Set to true only if the candidate's response fully and satisfactorily resolves the gap. Set to false if the response is insufficient, evasive, or if the gap was not addressed at all." }
    },
    required: ['gap', 'resolution', 'isResolved']
};

export const gapResolutionSectionSchema = {
    type: Type.OBJECT,
    properties: {
        items: { type: Type.ARRAY, items: gapResolutionItemSchema },
        score: { type: Type.NUMBER, description: "A score from 0-100 representing the percentage of gaps successfully resolved." },
    },
    required: ['items', 'score']
};

export const interviewPerformanceSchema = {
    type: Type.OBJECT,
    properties: {
        performanceScore: { type: Type.NUMBER, description: "A percentage (0-100) measuring how effectively the candidate performed in the interview." },
        summary: { type: Type.STRING, description: "A concise narrative summary of the candidate's interview performance." },
        overallFeedback: { type: Type.STRING, enum: ['Excellent', 'Good', 'Needs Improvement'], description: "A final, clear performance feedback for the candidate." },
        softSkillsAnalysis: {
            ...consistencySectionStringSchema,
            properties: {
                ...consistencySectionStringSchema.properties,
                items: { type: Type.STRING, description: "Based on language and responses, an analysis of soft skills demonstrated (communication, problem-solving, etc.)." }
            }
        },
        areasToImproveClarity: {
            ...consistencySectionStringArraySchema,
            properties: {
                ...consistencySectionStringArraySchema.properties,
                items: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of answers that were vague, inconsistent, or could be strengthened. Empty if none." }
            }
        },
        missingFromInterview: {
            ...consistencySectionStringArraySchema,
            properties: {
                ...consistencySectionStringArraySchema.properties,
                items: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of important points from the resume that were missed opportunities to discuss." }
            }
        },
        demonstratedStrengths: {
            ...consistencySectionStringArraySchema,
            properties: {
                ...consistencySectionStringArraySchema.properties,
                items: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of new, positive skills or experiences revealed in the interview that were not on the resume." }
            }
        },
        gapResolutions: {
            ...gapResolutionSectionSchema,
            description: "An analysis of how well the candidate addressed pre-identified compatibility gaps during the interview."
        },
        postInterviewFitScore: { type: Type.NUMBER, description: "The initial overall fit score, recalculated (0-100) to include interview performance." },
    },
    required: [
        'performanceScore', 'summary', 'overallFeedback', 'softSkillsAnalysis', 'areasToImproveClarity',
        'missingFromInterview', 'demonstratedStrengths', 'gapResolutions', 'postInterviewFitScore'
    ]
};

export const rewrittenResumeSchema = {
    type: Type.OBJECT,
    properties: {
        rewrittenResume: { type: Type.STRING, description: "The full text of the rewritten resume in Markdown format." }
    },
    required: ['rewrittenResume']
};
