import React from 'react';
import { AnalysisResult } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface DashboardProps {
  analysisResult: AnalysisResult;
}

const InfoItem: React.FC<{ label: string; value?: string; description: string; children?: React.ReactNode }> = ({ label, value, description, children }) => (
    <div className="py-3 sm:py-4">
        <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-400 flex items-center">
                {label}
                <span className="group relative ml-2">
                    <span className="cursor-pointer" role="img" aria-label="정보">ℹ️</span>
                    <span className="absolute bottom-full mb-2 w-64 p-2 bg-slate-800 border border-slate-600 text-slate-200 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {description}
                    </span>
                </span>
            </p>
            {value && <p className="text-sm font-semibold text-cyan-300 truncate">{value}</p>}
        </div>
        {children}
    </div>
);

const SecurityIndicator: React.FC<{ isSecure: boolean; text: string }> = ({ isSecure, text }) => (
  <span className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${
    isSecure ? 'bg-green-800/50 text-green-300' : 'bg-yellow-800/50 text-yellow-300'
  }`}>
    <div className={`w-2 h-2 rounded-full ${isSecure ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
    {text}
  </span>
);

const Dashboard: React.FC<DashboardProps> = ({ analysisResult }) => {
  const { geoData, traceData } = analysisResult;

  const isSecureHttp = traceData?.httpVersion?.startsWith('h3') || traceData?.httpVersion === 'http/2';
  const isSecureTls = traceData?.tlsVersion === 'TLSv1.3';
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
        <Card>
            <CardHeader>
                <CardTitle><span className="mr-2 text-xl" role="img" aria-label="ID">🆔</span>IP 정보</CardTitle>
            </CardHeader>
            <CardContent>
                <InfoItem
                    label="IP 주소"
                    value={geoData.query}
                    description="분석된 공용 인터넷 프로토콜(IP) 주소입니다."
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                 <CardTitle><span className="mr-2 text-xl" role="img" aria-label="지구">🌍</span>위치 정보</CardTitle>
            </CardHeader>
            <CardContent>
                <InfoItem
                    label="국가"
                    value={geoData.country ? `${geoData.country} (${geoData.countryCode})` : '알 수 없음'}
                    description="IP 주소와 연관된 국가입니다. 이 정보는 추정치이며 항상 정확하지는 않을 수 있습니다."
                />
                 <InfoItem
                    label="도시"
                    value={geoData.city ? `${geoData.city}, ${geoData.regionName}`: '알 수 없음'}
                    description="IP 주소가 등록된 도시 및 지역 정보입니다."
                />
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle><span className="mr-2 text-xl" role="img" aria-label="네트워크">🌐</span>ISP 정보</CardTitle>
            </CardHeader>
            <CardContent>
                <InfoItem
                    label="ISP"
                    value={geoData.isp}
                    description="인터넷 서비스 제공업체(ISP) 정보입니다."
                />
                 <InfoItem
                    label="소속 기관"
                    value={geoData.org}
                    description="IP 주소를 소유하고 있는 기관 또는 회사 정보입니다."
                />
            </CardContent>
        </Card>

        {traceData && (
            <Card>
                <CardHeader>
                    <CardTitle><span className="mr-2 text-xl" role="img" aria-label="방패">🛡️</span>연결 보안 (내 연결)</CardTitle>
                </CardHeader>
                <CardContent>
                    <InfoItem
                        label="HTTP 버전"
                        description="사용된 하이퍼텍스트 전송 프로토콜의 버전입니다. HTTP/2와 H3는 더 빠르고 안전한 최신 프로토콜입니다."
                    >
                        <div className="flex justify-end mt-1">
                            <SecurityIndicator isSecure={!!isSecureHttp} text={traceData.httpVersion || '알 수 없음'} />
                        </div>
                    </InfoItem>
                    <InfoItem
                        label="TLS 버전"
                        description="연결을 암호화하는 데 사용된 전송 계층 보안(TLS)의 버전입니다. TLS 1.3은 더 나은 보안과 성능을 제공하는 최신 표준입니다."
                    >
                        <div className="flex justify-end mt-1">
                            <SecurityIndicator isSecure={!!isSecureTls} text={traceData.tlsVersion || '알 수 없음'} />
                        </div>
                    </InfoItem>
                </CardContent>
            </Card>
        )}
    </div>
  );
};

export default Dashboard;