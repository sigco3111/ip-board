import React, { useState, useEffect } from 'react';
import { LogEntry, IPGeoData, CloudflareTraceData } from '../types';
import { getLogs, clearLogs } from '../services/logService';
import { Card, CardContent, CardHeader } from './ui/Card';
import Button from './ui/Button';
import ScoreBadge from './ui/Badge';

const DetailItem: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="flex justify-between items-start py-2 text-sm">
    <span className="text-slate-400 flex-shrink-0 mr-4">{label}</span>
    <span className="font-mono text-slate-200 text-right break-all">{value || 'N/A'}</span>
  </div>
);

const LogItem: React.FC<{ log: LogEntry }> = ({ log }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const geo: IPGeoData = log.result.geoData;
    const trace: CloudflareTraceData | undefined = log.result.traceData;

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <p className="font-semibold text-slate-100 font-mono">{geo.query}</p>
                        <p className="text-sm text-slate-400">{log.timestamp}</p>
                    </div>
                    {log.securityScore !== undefined && <ScoreBadge score={log.securityScore} />}
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center py-3">
                    <div className="space-y-1">
                        <p className="font-medium text-slate-300">
                            <span role="img" aria-label="위치" className="mr-2">🌍</span>
                            {geo.country || '알 수 없음'}
                        </p>
                         <p className="font-medium text-slate-300 text-sm">
                            <span role="img" aria-label="ISP" className="mr-2">🌐</span>
                            {geo.isp || '알 수 없음'}
                        </p>
                    </div>
                    <Button variant="secondary" onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? '간략히 보기' : '자세히 보기'}
                    </Button>
                </div>
                {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50 animate-fade-in">
                        <h4 className="font-semibold mb-2 text-slate-200">상세 정보</h4>
                        <div className="space-y-1">
                            <DetailItem label="국가" value={geo.country ? `${geo.country} (${geo.countryCode})` : 'N/A'} />
                            <DetailItem label="도시" value={geo.city ? `${geo.city}, ${geo.regionName}` : 'N/A'} />
                            <DetailItem label="소속 기관" value={geo.org} />
                            <DetailItem label="ASN" value={geo.as} />
                            {trace && (
                                <>
                                    <DetailItem label="데이터 센터 (CF)" value={trace.dataCenter} />
                                    <DetailItem label="HTTP 버전" value={trace.httpVersion} />
                                    <DetailItem label="TLS 버전" value={trace.tlsVersion} />
                                    <DetailItem label="Cloudflare WARP" value={trace.warp} />
                                    <DetailItem label="사용자 에이전트" value={trace.userAgent} />
                                </>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

const HistoryLog: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    setLogs(getLogs());
  }, []);

  const handleClear = () => {
    if (window.confirm('정말로 모든 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      clearLogs();
      setLogs([]);
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-100">분석 기록</h2>
            {logs.length > 0 && (
                <Button onClick={handleClear} variant="secondary">
                     <span role="img" aria-label="삭제" className="mr-2">🗑️</span>
                    기록 전체 삭제
                </Button>
            )}
        </div>

      {logs.length === 0 ? (
        <div className="text-center flex flex-col items-center justify-center h-64 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-lg">
            <div className="text-6xl mx-auto text-slate-500" role="img" aria-label="발자국">🐾</div>
            <h2 className="mt-4 text-xl font-semibold">분석 기록이 없습니다.</h2>
            <p className="mt-1 text-slate-400 max-w-md">IP를 분석하여 첫 기록을 남겨보세요.</p>
        </div>
      ) : (
        <div className="space-y-4">
            {logs.map(log => (
                <LogItem key={log.id} log={log} />
            ))}
        </div>
      )}
    </div>
  );
};

export default HistoryLog;