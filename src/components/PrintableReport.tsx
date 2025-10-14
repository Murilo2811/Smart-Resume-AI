
import React from 'react';
import { CandidateAnalysisResult, InterviewPerformanceResult, RewrittenResumeResult, MatchStatus } from '../types';

interface PrintableReportProps {
    t: (key: string) => string;
    analysisResult: CandidateAnalysisResult;
    interviewPerformance: InterviewPerformanceResult | null;
    rewrittenResume: RewrittenResumeResult | null;
}

// Internal components simplified for static rendering
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6 break-inside-avoid">
        <h2 className="text-xl font-bold border-b-2 border-primary/50 pb-2 mb-3">{title}</h2>
        <div className="text-sm">{children}</div>
    </div>
);

const CheckIcon = () => <span className="text-green-600 mr-2">✓</span>;
const XIcon = () => <span className="text-red-600 mr-2">✗</span>;

const PrintableReport: React.FC<PrintableReportProps> = ({ t, analysisResult, interviewPerformance, rewrittenResume }) => {
    
    const MatchStatusBadge: React.FC<{ status: MatchStatus }> = ({ status }) => {
        const styles = {
            'Match': 'border border-green-500 text-green-700 bg-green-100',
            'Partial': 'border border-yellow-500 text-yellow-700 bg-yellow-100',
            'No Match': 'border border-red-500 text-red-700 bg-red-100',
        };
         const style = styles[status];
         const statusKey = `status.${status.toLowerCase().replace(' ', '')}`;
        return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${style}`}>{t(statusKey)}</span>;
    };

    return (
        <div className="p-8 bg-background text-foreground font-sans w-[1024px]">
            <header className="flex justify-between items-center border-b-4 border-primary pb-4 mb-8">
                <h1 className="text-4xl font-bold text-primary">{t('appTitle')}</h1>
                <div className="text-right">
                    <p className="text-xl font-semibold">{t('analysis.title')}</p>
                    <p className="text-muted-foreground">{analysisResult.jobTitle}</p>
                </div>
            </header>

            <main>
                <Section title={t('analysis.overallFit') + `: ${analysisResult.overallFitScore}%`}>
                    <p className="font-semibold text-base mb-2">{t('analysis.summary')}</p>
                    <p className="text-muted-foreground mb-4">{analysisResult.summary}</p>
                </Section>
                
                 <Section title={t('analysis.strengths')}>
                    <ul className="list-none space-y-1">
                        {analysisResult.strengths.map((item, i) => <li key={i} className="flex"><CheckIcon />{item}</li>)}
                    </ul>
                </Section>

                <Section title={t('analysis.areasForImprovement')}>
                    <ul className="list-none space-y-1">
                        {analysisResult.areasForImprovement.map((item, i) => <li key={i} className="flex"><XIcon />{item}</li>)}
                    </ul>
                </Section>
                
                <Section title={t('analysis.actionPlan')}>
                    <ol className="list-decimal list-inside space-y-1">
                        {analysisResult.actionPlan.map((item, i) => <li key={i}>{item}</li>)}
                    </ol>
                </Section>

                {interviewPerformance && (
                    <Section title={t('interview.title')}>
                        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                            <div className="bg-muted/50 p-2 rounded">
                                <p className="text-xs font-bold">{t('interview.postInterviewFitScore')}</p>
                                <p className="text-2xl font-bold">{interviewPerformance.postInterviewFitScore}%</p>
                            </div>
                             <div className="bg-muted/50 p-2 rounded">
                                <p className="text-xs font-bold">{t('interview.performanceScore')}</p>
                                <p className="text-2xl font-bold">{interviewPerformance.performanceScore}%</p>
                            </div>
                             <div className="bg-muted/50 p-2 rounded">
                                <p className="text-xs font-bold">{t('interview.overallFeedback')}</p>
                                <p className="text-lg font-bold">{interviewPerformance.overallFeedback}</p>
                            </div>
                        </div>
                         <p className="font-semibold mb-2">{t('interview.summary')}</p>
                         <p className="text-muted-foreground mb-4">{interviewPerformance.summary}</p>
                         
                        <div className="mt-4 break-inside-avoid">
                            <h3 className="font-semibold mb-2">{t('interview.softSkillsAnalysis')} - Score: {interviewPerformance.softSkillsAnalysis.score}%</h3>
                            <p className="text-muted-foreground">{interviewPerformance.softSkillsAnalysis.items}</p>
                        </div>
                        
                        {interviewPerformance.demonstratedStrengths.items.length > 0 && (
                            <div className="mt-4 break-inside-avoid">
                                <h3 className="font-semibold mb-2">{t('interview.demonstratedStrengths')}</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    {interviewPerformance.demonstratedStrengths.items.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        )}

                        {interviewPerformance.areasToImproveClarity.items.length > 0 && (
                            <div className="mt-4 break-inside-avoid">
                                <h3 className="font-semibold mb-2">{t('interview.areasToImproveClarity')}</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    {interviewPerformance.areasToImproveClarity.items.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        )}
                    </Section>
                )}

                <Section title={`${t('analysis.keyResponsibilities')} - Score: ${analysisResult.keyResponsibilitiesMatch.score}%`}>
                    <ul className="space-y-3">
                        {analysisResult.keyResponsibilitiesMatch.items.map((item, i) => (
                            <li key={i}>
                                <div className="flex items-center gap-2">
                                    <MatchStatusBadge status={item.status} />
                                    <span className="font-semibold">{item.item}</span>
                                </div>
                                <p className="text-xs text-muted-foreground pl-2 mt-1 border-l-2 ml-1">{item.explanation}</p>
                            </li>
                        ))}
                    </ul>
                </Section>
                
                 <Section title={`${t('analysis.requiredSkills')} - Score: ${analysisResult.requiredSkillsMatch.score}%`}>
                    <ul className="space-y-3">
                        {analysisResult.requiredSkillsMatch.items.map((item, i) => (
                            <li key={i}>
                                <div className="flex items-center gap-2">
                                    <MatchStatusBadge status={item.status} />
                                    <span className="font-semibold">{item.item}</span>
                                </div>
                                <p className="text-xs text-muted-foreground pl-2 mt-1 border-l-2 ml-1">{item.explanation}</p>
                            </li>
                        ))}
                    </ul>
                </Section>
                
                {rewrittenResume && (
                    <Section title={t('rewrite.title')}>
                        <pre className="whitespace-pre-wrap font-sans text-sm bg-muted/50 p-4 rounded-md border">
                            {rewrittenResume.rewrittenResume}
                        </pre>
                    </Section>
                )}

            </main>
        </div>
    );
};

export default PrintableReport;
