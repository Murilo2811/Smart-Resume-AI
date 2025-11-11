

import React, { useState } from 'react';
import { useTranslations } from '../../contexts/LanguageContext';
import {
  CandidateAnalysisResult,
  InterviewPerformanceResult,
  RewrittenResumeResult,
  MatchStatus,
  MatchedItem,
  ChatTurn,
} from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { AwardIcon, DownloadIcon, CheckCircle2Icon, XCircleIcon, FileTextIcon, InfoIcon, MicIcon, PdfIcon, ZapIcon, TrendingUpIcon } from '../icons';
import { downloadFile } from '../../utils/parsers';
import { Textarea } from '../ui/Textarea';
import { Label } from '../ui/Label';
import ConsistencyInfoModal from '../ConsistencyInfoModal';
import Tooltip from '../ui/Tooltip';
import ResumeChat from '../ResumeChat';

interface ResultsSectionProps {
  analysisResult: CandidateAnalysisResult;
  interviewPerformance: InterviewPerformanceResult | null;
  rewrittenResume: RewrittenResumeResult | null;
  onRewriteResume: () => void;
  onAnalyzeInterviewPerformance: () => void;
  onDownloadPdf: () => void;
  isDownloadingPdf: boolean;
  interviewTranscript: string;
  setInterviewTranscript: (value: string) => void;
  isLoading: boolean;
  activeAnalysis: string | null;
  chatHistory: ChatTurn[];
  onSendChatMessage: (message: string) => void;
}

// Helper component for section titles
const ResultSection: React.FC<{ title: string; score?: number; tooltipText?: string; children: React.ReactNode }> = ({ title, score, tooltipText, children }) => (
    <div className="py-4 first:pt-0 last:pb-0">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
                <h4 className="text-lg font-semibold">{title}</h4>
                {tooltipText && (
                    <Tooltip content={tooltipText}>
                        <InfoIcon className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </Tooltip>
                )}
            </div>
            {score !== undefined && <Badge variant="secondary">{score}%</Badge>}
        </div>
        <div className="text-sm">{children}</div>
    </div>
);

// Helper component for matched items
const MatchedItemsList: React.FC<{ items: MatchedItem[] }> = ({ items }) => {
    const { t } = useTranslations();
    
    const MatchStatusBadge: React.FC<{ status: MatchStatus }> = ({ status }) => {
        const variants: {[key in MatchStatus]: 'success' | 'warning' | 'danger'} = {
            'Match': 'success',
            'Partial': 'warning',
            'No Match': 'danger',
        };
        const statusKey = `status.${status.toLowerCase().replace(' ', '')}`;
        return <Badge variant={variants[status]}>{t(statusKey)}</Badge>
    };

    return (
        <ul className="space-y-4">
            {items.map((item, index) => (
                <li key={index} className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <MatchStatusBadge status={item.status} />
                        <span className="font-medium text-foreground">{item.item}</span>
                    </div>
                    <p className="pl-4 text-sm text-muted-foreground border-l-2 border-border ml-2">{item.explanation}</p>
                </li>
            ))}
        </ul>
    );
};


const ResultsSection: React.FC<ResultsSectionProps> = ({
  analysisResult,
  interviewPerformance,
  rewrittenResume,
  onRewriteResume,
  onAnalyzeInterviewPerformance,
  onDownloadPdf,
  isDownloadingPdf,
  interviewTranscript,
  setInterviewTranscript,
  isLoading,
  activeAnalysis,
  chatHistory,
  onSendChatMessage,
}) => {
  const { t } = useTranslations();
  const [isConsistencyInfoModalOpen, setIsConsistencyInfoModalOpen] = useState(false);

  const formatScore = (score: number) => {
    if (score > 0 && score <= 1) {
        return Math.round(score * 100);
    }
    return Math.round(score);
  };

  const getScoreColorClass = (score: number) => {
    const formattedScore = formatScore(score);
    if (formattedScore >= 80) return 'text-green-500';
    if (formattedScore >= 60) return 'text-yellow-500';
    return 'text-destructive';
  };
  
  const getCompatibilityLabel = (score: number) => {
    if (score >= 80) return t('results.score.high');
    if (score >= 60) return t('results.score.medium');
    return t('results.score.low');
  }
  
  const handleDownloadResume = () => {
    if(rewrittenResume) {
        downloadFile(rewrittenResume.rewrittenResume, 'Rewritten-Resume.txt', 'text/plain;charset=utf-8');
    }
  }

  const getRecommendationStyle = (recommendation: string): 'success' | 'warning' | 'danger' => {
    switch (recommendation) {
        case 'Excellent': return 'success';
        case 'Good': return 'warning';
        case 'Needs Improvement': return 'danger';
        default: return 'warning';
    }
  };
  
  const getTranslatedFeedback = (feedback: string) => {
    if (feedback === 'Excellent') return t('interview.feedback.excellent');
    if (feedback === 'Good') return t('interview.feedback.good');
    if (feedback === 'Needs Improvement') return t('interview.feedback.improvement');
    return feedback;
  };

  return (
    <section className="py-20 sm:py-32 animate-fade-in">
      <div className="container mx-auto px-4 max-w-5xl space-y-8">
        {/* Overall Score Card */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>{t('results.overallScore.title')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="relative flex items-center justify-center h-32 w-32 mx-auto">
              <svg className="absolute inset-0" viewBox="0 0 36 36">
                <path className="text-secondary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
                <path className={`${getScoreColorClass(analysisResult.overallFitScore)} transition-all duration-500`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray={`${analysisResult.overallFitScore}, 100`} />
              </svg>
              <div className={`text-4xl font-bold ${getScoreColorClass(analysisResult.overallFitScore)}`}>
                {analysisResult.overallFitScore}
              </div>
            </div>
            <div className="md:col-span-2">
              <p className={`font-semibold text-lg ${getScoreColorClass(analysisResult.overallFitScore)}`}>
                  {getCompatibilityLabel(analysisResult.overallFitScore)}
              </p>
              <p className="text-muted-foreground mt-2">{analysisResult.summary}</p>
              <Progress value={analysisResult.overallFitScore} className="mt-4" />
            </div>
          </CardContent>
        </Card>
        
        {/* Action Button: Rewrite Resume */}
        <Card className="animate-fade-in">
            <CardHeader>
                <CardTitle>{t('rewrite.title')}</CardTitle>
                <CardDescription>{t('rewrite.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
                {rewrittenResume ? (
                     <>
                        <div className="flex justify-end mb-2">
                             <Button variant="outline" size="sm" onClick={handleDownloadResume}>
                                <DownloadIcon className="mr-2 h-4 w-4" />
                                {t('buttons.downloadResume')}
                            </Button>
                        </div>
                        <pre className="whitespace-pre-wrap font-sans text-sm bg-muted/50 p-4 rounded-md border max-h-96 overflow-y-auto">
                            {rewrittenResume.rewrittenResume}
                        </pre>
                        <div className="mt-4 border-t pt-4">
                            <ResumeChat 
                                history={chatHistory}
                                onSendMessage={onSendChatMessage}
                                isLoading={isLoading && activeAnalysis === 'sendChatMessage'}
                            />
                        </div>
                    </>
                ) : (
                    <Button size="lg" variant="default" onClick={onRewriteResume} disabled={isLoading} className="w-full">
                        {isLoading && activeAnalysis === 'rewriteResume' ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div> : <FileTextIcon className="mr-2 h-5 w-5" />}
                        {t('results.actions.rewrite')}
                    </Button>
                )}
            </CardContent>
        </Card>
        
        {/* Interview Performance Analysis Section */}
        <Card className="animate-fade-in">
            <CardHeader>
                <CardTitle>{t('interview.title')}</CardTitle>
                <CardDescription>{t('interview.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="space-y-2">
                    <div className="flex items-center gap-1">
                        <Label htmlFor="interview-transcript">{t('interview.transcriptLabel')}</Label>
                        <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground" onClick={() => setIsConsistencyInfoModalOpen(true)}>
                            <InfoIcon className="h-4 w-4" />
                        </Button>
                    </div>
                    <Textarea 
                        id="interview-transcript"
                        value={interviewTranscript}
                        onChange={(e) => setInterviewTranscript(e.target.value)}
                        placeholder={t('interview.transcriptPlaceholder')}
                        className="h-40"
                        disabled={isLoading}
                    />
                 </div>
                 <Button 
                    onClick={onAnalyzeInterviewPerformance}
                    disabled={isLoading || !interviewTranscript}
                    className="mt-4 w-full sm:w-auto"
                >
                    {isLoading && activeAnalysis === 'analyzeInterviewPerformance' 
                        ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>{t('interview.buttonLoading')}</>
                        : <><MicIcon className="mr-2 h-4 w-4" />{t('interview.button')}</>
                    }
                 </Button>

                 {interviewPerformance && (
                    <div className="mt-6 border-t pt-6 space-y-4 divide-y divide-border">
                        <ResultSection title={t('interview.summary')}>
                            <p className="text-muted-foreground">{interviewPerformance.summary}</p>
                        </ResultSection>

                        <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                            <Tooltip content={t('tooltips.postInterviewFitScore')} className="flex-1">
                                <div className="bg-muted/50 p-3 rounded-lg h-full">
                                    <p className="text-xs font-semibold text-muted-foreground">{t('interview.postInterviewFitScore')}</p>
                                    <p className={`text-2xl font-bold ${getScoreColorClass(interviewPerformance.postInterviewFitScore)}`}>{formatScore(interviewPerformance.postInterviewFitScore)}%</p>
                                </div>
                            </Tooltip>
                            <Tooltip content={t('tooltips.performanceScore')} className="flex-1">
                                <div className="bg-muted/50 p-3 rounded-lg h-full">
                                    <p className="text-xs font-semibold text-muted-foreground">{t('interview.performanceScore')}</p>
                                    <p className={`text-2xl font-bold ${getScoreColorClass(interviewPerformance.performanceScore)}`}>{formatScore(interviewPerformance.performanceScore)}%</p>
                                </div>
                            </Tooltip>
                             <Tooltip content={t('tooltips.overallFeedback')} className="flex-1">
                                <div className="bg-muted/50 p-3 rounded-lg flex flex-col justify-center h-full">
                                    <p className="text-xs font-semibold text-muted-foreground mb-1">{t('interview.overallFeedback')}</p>
                                    <Badge variant={getRecommendationStyle(interviewPerformance.overallFeedback)} className="self-center">
                                        {getTranslatedFeedback(interviewPerformance.overallFeedback)}
                                    </Badge>
                                </div>
                            </Tooltip>
                        </div>

                        <ResultSection title={t('interview.gapResolutions')} score={interviewPerformance.gapResolutions.score}>
                            {interviewPerformance.gapResolutions.items.length > 0 ? (
                                <ul className="space-y-4">
                                    {interviewPerformance.gapResolutions.items.map((item, index) => (
                                        <li key={index} className="p-3 bg-muted/50 rounded-lg">
                                            <p className="font-medium text-muted-foreground mb-2">{t('interview.gapLabel')}: <span className="font-normal text-foreground">{item.gap}</span></p>
                                            <div className={`flex items-start gap-2 text-sm pl-3 border-l-2 ${item.isResolved ? 'border-green-500' : 'border-destructive'}`}>
                                                {item.isResolved 
                                                    ? <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /> 
                                                    : <XCircleIcon className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />}
                                                <p>{item.resolution}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-muted-foreground">{t('analysis.none')}</p>}
                        </ResultSection>

                        <ResultSection title={t('interview.softSkillsAnalysis')} score={interviewPerformance.softSkillsAnalysis.score}>
                            <p className="text-muted-foreground">{interviewPerformance.softSkillsAnalysis.items}</p>
                        </ResultSection>

                        <ResultSection title={t('interview.areasToImproveClarity')} score={interviewPerformance.areasToImproveClarity.score}>
                            {interviewPerformance.areasToImproveClarity.items.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1 text-destructive">
                                    {interviewPerformance.areasToImproveClarity.items.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            ) : <p className="text-muted-foreground">{t('analysis.none')}</p>}
                        </ResultSection>

                        <ResultSection title={t('interview.demonstratedStrengths')} score={interviewPerformance.demonstratedStrengths.score}>
                            {interviewPerformance.demonstratedStrengths.items.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1 text-green-600 dark:text-green-400">
                                    {interviewPerformance.demonstratedStrengths.items.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            ) : <p className="text-muted-foreground">{t('analysis.none')}</p>}
                        </ResultSection>

                        <ResultSection title={t('interview.missingFromInterview')} score={interviewPerformance.missingFromInterview.score}>
                            {interviewPerformance.missingFromInterview.items.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1 text-yellow-600 dark:text-yellow-400">
                                    {interviewPerformance.missingFromInterview.items.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            ) : <p className="text-muted-foreground">{t('analysis.none')}</p>}
                        </ResultSection>
                    </div>
                 )}
            </CardContent>
        </Card>
        <ConsistencyInfoModal isOpen={isConsistencyInfoModalOpen} onClose={() => setIsConsistencyInfoModalOpen(false)} />

        {/* DETAILED ANALYSIS REPORT */}
        <Card>
          <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{t('analysis.title')}</CardTitle>
                <Button variant="outline" size="sm" onClick={onDownloadPdf} disabled={isDownloadingPdf}>
                    {isDownloadingPdf ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    ) : (
                        <PdfIcon className="mr-2 h-4 w-4" />
                    )}
                    {t('buttons.downloadPdf')}
                </Button>
              </div>
          </CardHeader>
          <CardContent className="divide-y divide-border">
              <ResultSection title={t('analysis.strengths')}>
                  {analysisResult.strengths.length > 0 ? (
                      <ul className="space-y-2">
                          {analysisResult.strengths.map((strength, i) => <li key={i} className="flex items-start gap-2"><CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>{strength}</span></li>)}
                      </ul>
                  ) : <p className="text-muted-foreground">{t('analysis.none')}</p>}
              </ResultSection>

              <ResultSection title={t('analysis.areasForImprovement')}>
                  {analysisResult.areasForImprovement.length > 0 ? (
                      <ul className="space-y-2">
                          {analysisResult.areasForImprovement.map((area, i) => <li key={i} className="flex items-start gap-2"><XCircleIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" /><span>{area}</span></li>)}
                      </ul>
                  ) : <p className="text-muted-foreground">{t('analysis.none')}</p>}
              </ResultSection>
              
              <ResultSection title={t('analysis.actionPlan')}>
                  {analysisResult.actionPlan.length > 0 ? (
                      <ol className="list-decimal list-inside space-y-2">
                          {analysisResult.actionPlan.map((step, i) => <li key={i}><span className="font-semibold">Step {i+1}:</span> {step}</li>)}
                      </ol>
                  ) : <p className="text-muted-foreground">{t('analysis.none')}</p>}
              </ResultSection>

              <ResultSection title={t('analysis.fitExplanation')}>
                  <p className="text-muted-foreground">{analysisResult.fitExplanation}</p>
              </ResultSection>

              <ResultSection title={t('analysis.keyResponsibilities')} score={analysisResult.keyResponsibilitiesMatch.score}>
                  <MatchedItemsList items={analysisResult.keyResponsibilitiesMatch.items} />
              </ResultSection>

              <ResultSection title={t('analysis.requiredSkills')} score={analysisResult.requiredSkillsMatch.score}>
                  <MatchedItemsList items={analysisResult.requiredSkillsMatch.items} />
              </ResultSection>

              {analysisResult.niceToHaveSkillsMatch?.items?.length > 0 && (
                  <ResultSection title={t('analysis.niceToHaveSkills')} score={analysisResult.niceToHaveSkillsMatch.score}>
                      <MatchedItemsList items={analysisResult.niceToHaveSkillsMatch.items} />
                  </ResultSection>
              )}

              {analysisResult.companyCultureFit?.analysis && (
                  <ResultSection title={t('analysis.companyCulture')} score={analysisResult.companyCultureFit.score}>
                      <p className="text-muted-foreground">{analysisResult.companyCultureFit.analysis}</p>
                  </ResultSection>
              )}

              {analysisResult.salaryAndBenefits && (
                   <ResultSection title={t('analysis.salaryAndBenefits')}>
                      <p className="text-muted-foreground">{analysisResult.salaryAndBenefits}</p>
                  </ResultSection>
              )}

              <ResultSection title={t('analysis.potentialInterviewQuestions')}>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      {analysisResult.potentialInterviewQuestions.map((q, i) => <li key={i}>{q}</li>)}
                  </ol>
              </ResultSection>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ResultsSection;