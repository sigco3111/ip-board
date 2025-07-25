
import React, { useState, useCallback } from 'react';
import { CloudflareTraceData, PrivacyAnalysisResult, TipSeverity } from '../types';
import { generatePrivacyAnalysis } from '../services/geminiService';
import LoadingSpinner from './ui/LoadingSpinner';
import Button from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface PrivacyAnalyzerProps {
  traceData?: CloudflareTraceData;
  apiKey: string | null;
}

const severityStyles: Record<TipSeverity, { bg: string; text: string; icon: React.ReactNode }> = {
    info: { bg: 'bg-sky-800/50', text: 'text-sky-300', icon: <span role="img" aria-label="정보">ℹ️</span> },
    warning: { bg: 'bg-yellow-800/50', text: 'text-yellow-300', icon: <span role="img" aria-label="경고">⚠️</span> },
    critical: { bg: 'bg-red-800/50', text: 'text-red-300', icon: <span role="img" aria-label="위험">🚨</span> },
};


const PrivacyAnalyzer: React.FC<PrivacyAnalyzerProps> = ({ traceData, apiKey }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PrivacyAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!traceData) {
        setError("분석할 상세 연결 정보가 없습니다.");
        return;
    }
    if (!apiKey) {
      setError("Gemini API 키가 설정되어 있지 않습니다.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await generatePrivacyAnalysis(traceData, apiKey);
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [traceData, apiKey]);
  
  if (!traceData) {
    return (
        <div className="animate-fade-in max-w-4xl mx-auto text-center flex flex-col items-center justify-center h-64 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-lg p-4">
            <div className="text-6xl mx-auto text-slate-500" role="img" aria-label="자물쇠">🔒</div>
            <h2 className="mt-4 text-xl font-semibold">심층 분석은 '내 IP로 분석' 시에만 가능합니다.</h2>
            <p className="mt-1 text-slate-400 max-w-md">AI 진단은 TLS/HTTP 버전과 같은 실제 연결 데이터가 필요하므로, 외부 IP 주소에 대해서는 실행할 수 없습니다.</p>
        </div>
    )
  }

  const renderContent = () => {
    if (isAnalyzing) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <LoadingSpinner />
                <p className="mt-4 text-slate-300">AI가 당신의 디지털 발자국을 분석 중입니다...</p>
                <p className="text-sm text-slate-500">잠시만 기다려주세요.</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="text-center bg-red-900/20 border border-red-500/50 p-6 rounded-lg max-w-2xl mx-auto">
                <div className="text-5xl mx-auto text-red-400" role="img" aria-label="오류">❗️</div>
                <h2 className="mt-4 text-xl font-bold text-red-300">분석 실패</h2>
                <p className="mt-2 text-slate-300">{error}</p>
            </div>
        );
    }

    if (analysisResult) {
        const { personality, tips } = analysisResult;
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>나의 인터넷 성향은?</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="text-center py-4">
                           <div className="text-6xl mb-4">{personality.emoji}</div>
                           <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{personality.title}</h3>
                           <p className="mt-2 text-slate-300 max-w-xl mx-auto">{personality.description}</p>
                       </div>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>AI 분석 및 제안</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                        {tips.map((tip, index) => (
                           <div key={index} className={`p-4 rounded-lg flex gap-4 ${severityStyles[tip.severity]?.bg || 'bg-slate-700'}`}>
                               <div className={`flex-shrink-0 mt-1 text-xl ${severityStyles[tip.severity]?.text || 'text-slate-300'}`}>
                                   {severityStyles[tip.severity]?.icon}
                               </div>
                               <div>
                                   <h4 className={`font-semibold ${severityStyles[tip.severity]?.text || 'text-slate-100'}`}>{tip.title}</h4>
                                   <p className="text-sm text-slate-300 mt-1">{tip.description}</p>
                               </div>
                           </div>
                        ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="text-center flex flex-col items-center justify-center h-64 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-lg p-4">
            <div className="text-6xl mx-auto text-slate-500" role="img" aria-label="보호막">🛡️</div>
            <h2 className="mt-4 text-xl font-semibold">AI 연결 진단</h2>
            <p className="mt-1 text-slate-400 max-w-md">버튼을 눌러 당신의 연결 정보를 기반으로 한 AI 분석 리포트와 재미있는 인터넷 성향을 확인해보세요.</p>
             <div className="mt-6">
                 <Button onClick={handleAnalyze} disabled={isAnalyzing || !apiKey}>
                    <span className="mr-2" role="img" aria-label="반짝임">✨</span>
                    진단 시작하기
                </Button>
                {!apiKey && <p className="text-yellow-400/80 text-sm mt-2">이 기능을 사용하려면 Gemini API 키가 필요합니다.</p>}
            </div>
        </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {renderContent()}
    </div>
  );
};

export default PrivacyAnalyzer;
