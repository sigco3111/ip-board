import React, { useState } from 'react';
import Button from './ui/Button';

interface AnalysisInputFormProps {
  onAnalyze: (ip?: string) => void;
}

const AnalysisInputForm: React.FC<AnalysisInputFormProps> = ({ onAnalyze }) => {
  const [ip, setIp] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isValidIp = (ipAddress: string) => {
    // Basic IPv4 validation regex. Does not cover all edge cases but is good enough.
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ipAddress);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ip) {
      setError('분석할 IP 주소를 입력해주세요.');
      return;
    }
    if (!isValidIp(ip)) {
      setError('유효한 IPv4 주소 형식이 아닙니다.');
      return;
    }
    setError(null);
    onAnalyze(ip);
  };
  
  const handleMyIpAnalyze = () => {
    setIp('');
    setError(null);
    onAnalyze(); // Pass no argument to signify self-analysis
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="w-full max-w-2xl text-center">
             <div className="text-6xl mx-auto text-slate-500 mb-6" role="img" aria-label="탐색">📡</div>
             <h2 className="text-3xl font-bold text-slate-100">분석할 IP 주소를 입력하세요</h2>
             <p className="mt-2 text-slate-400">IP 주소의 위치, ISP, 보안 정보 등을 확인해보세요.</p>
             
             <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-center gap-4">
                 <div className="w-full sm:w-auto flex-grow">
                    <input
                        type="text"
                        value={ip}
                        onChange={(e) => setIp(e.target.value)}
                        placeholder="예: 8.8.8.8"
                        className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-600 rounded-md text-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition"
                        aria-label="IP 주소 입력"
                    />
                    {error && <p className="text-red-400 text-sm mt-2 text-left">{error}</p>}
                 </div>
                 <Button type="submit" className="w-full sm:w-auto">
                    분석하기
                </Button>
             </form>
             
             <div className="mt-6 flex items-center justify-center">
                 <div className="flex-grow border-t border-slate-700"></div>
                 <span className="flex-shrink mx-4 text-slate-500">또는</span>
                 <div className="flex-grow border-t border-slate-700"></div>
            </div>
            
            <div className="mt-6">
                 <Button onClick={handleMyIpAnalyze} variant="secondary">
                     <span className="mr-2" role="img" aria-label="내 위치">📍</span>
                    내 IP로 분석하기
                </Button>
            </div>
        </div>
    </div>
  );
};

export default AnalysisInputForm;
