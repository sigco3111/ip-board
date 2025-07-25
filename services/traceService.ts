
import { CloudflareTraceData } from '../types';

export const fetchTraceData = async (): Promise<CloudflareTraceData> => {
  const response = await fetch('https://1.1.1.1/cdn-cgi/trace');
  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.statusText}`);
  }
  const text = await response.text();

  const lines = text.trim().split('\n');
  const data: { [key: string]: string } = {};
  lines.forEach(line => {
    const parts = line.split('=', 2);
    if (parts.length === 2) {
      const [key, value] = parts;
      data[key] = value;
    }
  });

  return {
    ip: data.ip,
    countryCode: data.loc,
    dataCenter: data.colo,
    httpVersion: data.http,
    tlsVersion: data.tls,
    userAgent: data.uag,
    warp: data.warp,
    visitScheme: data.visit_scheme,
    sni: data.sni,
  };
};