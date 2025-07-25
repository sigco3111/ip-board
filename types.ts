
export interface CloudflareTraceData {
  ip?: string;
  countryCode?: string;
  dataCenter?: string;
  httpVersion?: string;
  tlsVersion?: string;
  userAgent?: string;
  warp?: string;
  visitScheme?: string;
  sni?: string;
}

export interface IPGeoData {
  query: string; // ip
  status: 'success' | 'fail';
  message?: string;
  country?: string;
  countryCode?: string;
  regionName?: string;
  city?: string;
  isp?: string;
  org?: string;
  as?: string;
}

export interface AnalysisResult {
    geoData: IPGeoData;
    traceData?: CloudflareTraceData; // 자신의 IP를 분석할 때만 존재
}

export type TipSeverity = 'info' | 'warning' | 'critical';

export interface PrivacyTip {
  title: string;
  description: string;
  severity: TipSeverity;
}

export interface InternetPersonality {
  title:string;
  description: string;
  emoji: string;
}

export interface PrivacyAnalysisResult {
  personality: InternetPersonality;
  tips: PrivacyTip[];
}

export interface LogEntry {
  id: number;
  timestamp: string;
  result: AnalysisResult;
  securityScore?: number;
}