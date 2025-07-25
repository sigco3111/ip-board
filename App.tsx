
import React, { useState, useCallback, useEffect } from 'react';
import { fetchTraceData } from './services/traceService';
import { fetchIPInfo } from './services/ipApiService';
import { AnalysisResult, IPGeoData, CloudflareTraceData } from './types';
import Dashboard from './components/Dashboard';
import PostcardCreator from './components/PostcardCreator';
import PrivacyAnalyzer from './components/PrivacyAnalyzer';
import HistoryLog from './components/HistoryLog';
import LoadingSpinner from './components/ui/LoadingSpinner';
import AnalysisInputForm from './components/AnalysisInputForm';
import { calculateSecurityScore } from './utils/securityScore';
import { saveLog } from './services/logService';
import { validateApiKey } from './services/geminiService';
import { HelpIcon, InfoIcon } from './components/ui/Icons';

// --- API Key Service (LocalStorage) ---
const API_KEY_STORAGE_KEY = 'geminiApiKey';

const saveApiKey = (key: string): void => {
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  } catch (error) {
    console.error("Failed to save API key to localStorage", error);
  }
};

const getApiKey = (): string | null => {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to get API key from localStorage", error);
    return null;
  }
};

const clearApiKey = (): void => {
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear API key from localStorage", error);
  }
};
// --- End API Key Service ---

// --- Modal Component ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
        <div 
            className="relative w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-lg shadow-xl m-4"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-start justify-between p-4 border-b border-slate-700">
                <h3 className="text-xl font-semibold text-slate-100">{title}</h3>
                <button 
                    onClick={onClose}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                    aria-label="닫기"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    </div>
  );
};


type View = 'dashboard' | 'postcard' | 'privacy' | 'log';
type ApiKeyStatus = 'missing' | 'valid' | 'invalid' | 'checking' | 'from_env';

// --- ApiKeyManager Component ---
interface ApiKeyManagerProps {
  status: ApiKeyStatus;
  apiKey: string | null;
  onSave: (key: string) => Promise<void>;
  onClear: () => void;
  onHelpClick: () => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ status, apiKey, onSave, onClear, onHelpClick }) => {
  const [inputKey, setInputKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status !== 'checking') {
        setIsSaving(false);
    }
    if (status === 'valid' || status === 'from_env') {
        setInputKey('');
    }
  }, [status]);
  
  const handleSaveClick = async () => {
    if (!inputKey.trim() || isSaving) return;
    setIsSaving(true);
    await onSave(inputKey.trim());
  };

  const StatusIndicator = () => {
      let colorClass = '';
      let text = '';
      switch (status) {
          case 'from_env':
              colorClass = 'bg-sky-500';
              text = 'API 키가 환경 변수에서 설정됨';
              break;
          case 'valid':
              colorClass = 'bg-green-500';
              text = 'Gemini API 활성화됨';
              break;
          case 'checking':
              colorClass = 'bg-yellow-500';
              text = 'API 키 확인 중...';
              break;
          case 'missing':
              colorClass = 'bg-slate-500';
              text = 'Gemini API 비활성화됨';
              break;
          case 'invalid':
              colorClass = 'bg-red-500';
              text = '유효하지 않은 API 키';
              break;
      }

      return (
          <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${colorClass} transition-colors`}></span>
              <span className="font-semibold text-slate-200 text-sm">{text}</span>
          </div>
      );
  };
  
  const placeholderText = (status === 'valid' || status === 'from_env')
    ? "새 키를 입력하여 교체" 
    : "Gemini API 키 입력";

  return (
    <div className="max-w-4xl mx-auto mb-8 p-4 bg-slate-800/60 border border-slate-700 rounded-lg animate-fade-in">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <StatusIndicator />
                <button onClick={onHelpClick} className="text-slate-400 hover:text-white transition-colors" aria-label="API 키 도움말">
                    <HelpIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="flex items-stretch gap-2 w-full sm:w-auto">
                <input
                    type="password"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveClick()}
                    placeholder={placeholderText}
                    className="flex-grow px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    disabled={isSaving || status === 'checking'}
                    aria-label="Gemini API 키 입력"
                />
                <button onClick={handleSaveClick} disabled={isSaving || status === 'checking' || !inputKey.trim()} className="px-4 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-md font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
                    {isSaving || status === 'checking' ? '확인 중...' : '저장'}
                </button>
                {status === 'valid' && apiKey && (
                     <button onClick={onClear} className="px-4 py-2 bg-slate-600 hover:bg-red-600 text-white rounded-md font-semibold text-sm transition-colors whitespace-nowrap">
                        삭제
                    </button>
                )}
            </div>
        </div>
        {status === 'from_env' && (
            <p className="text-slate-400 text-xs mt-3 text-center sm:text-right">
                환경 변수 키가 우선 적용됩니다. 새 키를 저장하면 현재 세션에서만 일시적으로 덮어쓸 수 있습니다.
            </p>
        )}
        {(status === 'invalid' || status === 'missing') && (
            <p className="text-slate-400 text-xs mt-3 text-center sm:text-left">
                AI 기반 기능 (진단, 디지털 엽서 생성)을 사용하려면 Gemini API 키가 필요합니다. 
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline ml-1">
                    여기서 키를 발급받으세요.
                </a>
                키는 브라우저의 로컬 스토리지에만 저장됩니다.
            </p>
        )}
    </div>
  );
};
// --- End ApiKeyManager Component ---


const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>('checking');
  const [isApiKeyHelpModalOpen, setApiKeyHelpModalOpen] = useState(false);
  const [isGeneralHelpModalOpen, setGeneralHelpModalOpen] = useState(false);


  useEffect(() => {
    const checkApiKey = async () => {
        const envKey = process.env.API_KEY;
        if (envKey) {
            setApiKey(envKey);
            setApiKeyStatus('from_env');
            return;
        }

        const storedKey = getApiKey();
        if (storedKey) {
            setApiKeyStatus('checking');
            const isValid = await validateApiKey(storedKey);
            if (isValid) {
                setApiKey(storedKey);
                setApiKeyStatus('valid');
            } else {
                setApiKey(null);
                setApiKeyStatus('invalid');
                clearApiKey(); 
            }
        } else {
            setApiKeyStatus('missing');
        }
    };
    checkApiKey();
  }, []);

  const handleSaveKey = async (key: string) => {
    setApiKeyStatus('checking');
    const isValid = await validateApiKey(key);
    if (isValid) {
        saveApiKey(key);
        setApiKey(key);
        setApiKeyStatus('valid');
    } else {
        setApiKey(null);
        setApiKeyStatus('invalid');
    }
  };
  
  const handleClearKey = () => {
      clearApiKey();
      setApiKey(null);
      setApiKeyStatus('missing');
  };

  const handleAnalysis = useCallback(async (ip?: string) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
        let traceData: CloudflareTraceData | undefined = undefined;
        let geoData: IPGeoData;
        let targetIpForGeo = ip || '';

        if (!ip) {
            try {
                traceData = await fetchTraceData();
                if (traceData.ip) {
                    targetIpForGeo = traceData.ip;
                }
            } catch (traceError) {
                console.warn("Cloudflare trace data 조회 실패. 기본 IP 분석을 계속합니다.", traceError);
            }
        }

        geoData = await fetchIPInfo(targetIpForGeo);

        if (geoData.status === 'fail') {
            const displayIp = targetIpForGeo || (ip ? ip : '내 IP');
            throw new Error(`IP 정보(${displayIp}) 조회 실패: ${geoData.message || '알 수 없는 오류'}`);
        }

        if (traceData) {
            traceData.ip = geoData.query;
        }

        const result: AnalysisResult = { geoData, traceData };
        setAnalysisResult(result);

        const securityScore = result.traceData ? calculateSecurityScore(result.traceData) : undefined;
        saveLog({ id: Date.now(), timestamp: new Date().toLocaleString('ko-KR'), result, securityScore });

    } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
    setView('dashboard');
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>;
    }

    if (error) {
      return (
        <div className="mt-8 text-center bg-red-900/20 border border-red-500/50 p-6 rounded-lg max-w-2xl mx-auto animate-fade-in">
          <div className="text-6xl mb-4" role="img" aria-label="오류">❗️</div>
          <h2 className="mt-4 text-2xl font-bold text-red-300">오류가 발생했습니다</h2>
          <p className="mt-2 text-slate-300">{error}</p>
          <button
            onClick={handleReset}
            className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            새 분석
          </button>
        </div>
      );
    }
    
    if (!analysisResult) {
        return <AnalysisInputForm onAnalyze={handleAnalysis} />;
    }

    switch (view) {
      case 'dashboard':
        return <Dashboard analysisResult={analysisResult} />;
      case 'postcard':
        return <PostcardCreator geoData={analysisResult.geoData} apiKey={apiKey} />;
      case 'privacy':
        return <PrivacyAnalyzer traceData={analysisResult.traceData} apiKey={apiKey} />;
      case 'log':
        return <HistoryLog />;
      default:
        return null;
    }
  };
  
  const isGeminiReady = apiKeyStatus === 'valid' || apiKeyStatus === 'from_env';
  const isPrivacyTabDisabled = !analysisResult?.traceData || !isGeminiReady;
  const isPostcardTabDisabled = analysisResult?.geoData.status !== 'success' || !analysisResult?.geoData.country || !isGeminiReady;

  const getPrivacyTabTitle = () => {
    if (!analysisResult?.traceData) return "'내 IP로 분석' 시에만 사용 가능합니다.";
    if (!isGeminiReady) return "Gemini API 키가 필요합니다.";
    return "연결 상태를 AI로 진단합니다.";
  }
  
  const getPostcardTabTitle = () => {
    if (isPostcardTabDisabled && !isGeminiReady) return "Gemini API 키가 필요합니다.";
    if (analysisResult?.geoData.status !== 'success' || !analysisResult?.geoData.country) return "엽서를 생성할 수 없는 위치입니다.";
    return "현재 위치 기반 디지털 엽서를 생성합니다.";
  }


  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
            <div className="flex justify-center items-center relative">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                IP 대시보드
                </h1>
                <button 
                    onClick={() => setGeneralHelpModalOpen(true)}
                    className="ml-4 text-slate-400 hover:text-white transition-colors"
                    aria-label="애플리케이션 도움말"
                >
                    <InfoIcon className="w-7 h-7" />
                </button>
                {analysisResult && (
                <button onClick={handleReset} className="absolute right-0 top-1/2 -translate-y-1/2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors text-sm flex items-center gap-2">
                    <span role="img" aria-label="새 분석">🔍</span>
                    새 분석
                </button>
                )}
            </div>
            <p className="mt-3 text-lg text-slate-400 max-w-3xl mx-auto">
                IP 주소를 분석하고, 연결 상태를 점검하며, 위치 기반 디지털 엽서를 만들어 보세요.
            </p>
        </header>

        <ApiKeyManager 
            status={apiKeyStatus}
            apiKey={apiKey}
            onSave={handleSaveKey}
            onClear={handleClearKey}
            onHelpClick={() => setApiKeyHelpModalOpen(true)}
        />

        {analysisResult && (
            <nav className="flex justify-center mb-8 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 w-full max-w-xl mx-auto">
                <button onClick={() => setView('dashboard')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-all duration-200 ${ view === 'dashboard' ? 'bg-brand-blue/80 text-white' : 'text-slate-300 hover:bg-slate-700/50' }`}>
                    <span role="img" aria-label="대시보드">🌍</span>
                    대시보드
                </button>
                <button onClick={() => !isPrivacyTabDisabled && setView('privacy')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-all duration-200 ${ view === 'privacy' ? 'bg-purple-600/80 text-white' : 'text-slate-300 hover:bg-slate-700/50' } ${isPrivacyTabDisabled ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isPrivacyTabDisabled} title={getPrivacyTabTitle()}>
                    <span role="img" aria-label="진단">🛡️</span>
                    진단
                </button>
                <button onClick={() => setView('log')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-all duration-200 ${ view === 'log' ? 'bg-amber-600/80 text-white' : 'text-slate-300 hover:bg-slate-700/50' }`}>
                    <span role="img" aria-label="분석 기록">💾</span>
                    분석 기록
                </button>
                <button onClick={() => !isPostcardTabDisabled && setView('postcard')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-all duration-200 ${ view === 'postcard' ? 'bg-brand-cyan/80 text-white' : 'text-slate-300 hover:bg-slate-700/50' } ${isPostcardTabDisabled ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isPostcardTabDisabled} title={getPostcardTabTitle()}>
                    <span role="img" aria-label="디지털 엽서">🖼️</span>
                    디지털 엽서
                </button>
            </nav>
        )}

        <main>{renderContent()}</main>
        
        <footer className="text-center mt-12 text-slate-500 text-sm">
            <p>이 서비스는 Cloudflare Trace, ipinfo.io, Google Gemini를 기반으로 동작합니다. 분석 기록은 브라우저의 로컬 스토리지에 저장되며, 서버에 별도로 기록되지 않습니다.</p>
        </footer>
      </div>
       <Modal 
            isOpen={isApiKeyHelpModalOpen} 
            onClose={() => setApiKeyHelpModalOpen(false)}
            title="Gemini API 키 정보"
        >
            <div className="space-y-4 text-slate-300 text-sm">
                <p>이 웹 애플리케이션의 AI 기반 기능(보안 진단, 디지털 엽서 생성)을 사용하려면 Google Gemini API 키가 필요합니다.</p>
                
                <div className="p-3 bg-slate-700/50 rounded-lg">
                    <h4 className="font-semibold text-slate-100 mb-1">API 키는 어디서 받나요?</h4>
                    <p>Google AI Studio에서 무료로 API 키를 발급받을 수 있습니다. Google 계정으로 로그인하고 간단한 절차를 통해 키를 생성하세요.</p>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-cyan-400 hover:underline">
                        Google AI Studio로 이동하기 &rarr;
                    </a>
                </div>
                
                <div className="p-3 bg-slate-700/50 rounded-lg">
                    <h4 className="font-semibold text-slate-100 mb-1">키는 어떻게 저장되나요?</h4>
                    <p>입력하신 API 키는 사용자의 웹 브라우저 내 로컬 스토리지(localStorage)에만 안전하게 저장됩니다. 이 정보는 외부 서버로 전송되거나 기록되지 않습니다.</p>
                </div>

                <div className="p-3 bg-slate-700/50 rounded-lg">
                    <h4 className="font-semibold text-slate-100 mb-1">환경 변수 키 vs. 저장된 키</h4>
                    <p>'환경 변수에서 키가 설정됨'이라고 표시되는 경우, 이는 애플리케이션이 실행 환경에 미리 구성된 키를 사용하고 있음을 의미합니다. 이 키가 우선적으로 사용됩니다.</p>
                    <p className="mt-2">새로운 키를 입력하여 저장하면, 현재 브라우저 세션 동안에는 새로 저장한 키가 환경 변수 키를 덮어쓰고 사용됩니다. 브라우저를 닫으면 다시 환경 변수 키를 사용하게 됩니다.</p>
                </div>

                <p className="text-xs text-slate-400 pt-2 border-t border-slate-700">보안을 위해 API 키를 공개적인 장소(예: GitHub)에 노출하지 않도록 주의하세요.</p>
            </div>
        </Modal>
        <Modal 
            isOpen={isGeneralHelpModalOpen} 
            onClose={() => setGeneralHelpModalOpen(false)}
            title="IP 대시보드 도움말"
        >
            <div className="space-y-6 text-slate-300 text-sm max-h-[70vh] overflow-y-auto pr-2">
                <section>
                    <h4 className="font-semibold text-lg text-cyan-400 mb-2">🚀 시작하기</h4>
                    <p>'IP 대시보드'는 여러분의 디지털 발자국을 탐험하고 이해하는 데 도움을 주는 종합 도구입니다. IP 주소를 입력하거나 '내 IP로 분석하기' 버튼을 클릭하여 분석을 시작할 수 있습니다.</p>
                </section>
                
                <section>
                    <h4 className="font-semibold text-lg text-cyan-400 mb-2">✨ 주요 기능</h4>
                    <ul className="list-disc list-inside space-y-3">
                        <li>
                            <strong className="text-slate-100">🌍 대시보드:</strong> 분석된 IP의 위치(국가, 도시), ISP(인터넷 서비스 제공업체), 소속 기관 등 핵심 정보를 한눈에 보여줍니다. '내 IP'를 분석할 경우, 현재 연결의 보안 상태(HTTP/TLS 버전)도 함께 점검합니다.
                        </li>
                        <li>
                            <strong className="text-slate-100">🛡️ 진단 (AI):</strong> '내 IP' 분석 시에만 활성화됩니다. Google Gemini AI가 여러분의 연결 데이터를 심층 분석하여, 재치 있는 '인터넷 성향'을 알려주고 프라이버시 보호를 위한 맞춤형 팁을 제공합니다. <span className="text-yellow-400/80">이 기능은 Gemini API 키가 필요합니다.</span>
                        </li>
                        <li>
                            <strong className="text-slate-100">💾 분석 기록:</strong> 지금까지 분석했던 IP들의 기록을 보여줍니다. 각 기록의 상세 정보를 확인하거나 전체 기록을 삭제할 수 있습니다. 모든 기록은 여러분의 브라우저에만 저장됩니다.
                        </li>
                        <li>
                            <strong className="text-slate-100">🖼️ 디지털 엽서 (AI):</strong> 분석된 IP의 국가를 기반으로, Gemini AI가 세상에 하나뿐인 멋진 디지털 엽서를 생성해줍니다. 생성된 엽서는 다운로드하여 공유할 수 있습니다. <span className="text-yellow-400/80">이 기능은 Gemini API 키가 필요합니다.</span>
                        </li>
                    </ul>
                </section>
                
                <section>
                    <h4 className="font-semibold text-lg text-cyan-400 mb-2">🔑 Gemini API 키</h4>
                    <p>AI 기반 기능(진단, 디지털 엽서)을 사용하려면 Google Gemini API 키가 필요합니다. 헤더 아래의 API 키 관리 섹션에서 키를 입력하고 저장할 수 있습니다. 키 관련 자세한 정보는 해당 섹션의 물음표(?) 아이콘을 클릭하여 확인하세요.</p>
                </section>

                <section>
                    <h4 className="font-semibold text-lg text-cyan-400 mb-2">🔒 프라이버시 및 보안</h4>
                    <p>여러분의 프라이버시는 매우 중요합니다. 이 애플리케이션은 분석 기록과 API 키를 서버에 저장하지 않으며, 모든 데이터는 사용자의 브라우저 내 로컬 스토리지(localStorage)에만 안전하게 보관됩니다. 이는 여러분의 정보가 외부에 노출될 걱정 없이 안심하고 서비스를 이용할 수 있음을 의미합니다.</p>
                </section>
            </div>
        </Modal>
    </div>
  );
};

export default App;
