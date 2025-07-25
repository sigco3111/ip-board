
import { IPGeoData } from '../types';
import { getCountryNameByCode } from '../utils/country';

// IP 조회 서비스를 안정적인 ipinfo.io으로 교체합니다.
// 이 서비스는 CORS를 지원하며 무료 티어에서 안정적으로 작동합니다.
const API_ENDPOINT = 'https://ipinfo.io/';

export const fetchIPInfo = async (ip: string): Promise<IPGeoData> => {
  try {
    // '내 IP' 분석을 위해 IP가 비어있으면 ip를 생략하여 호출합니다.
    const url = ip ? `${API_ENDPOINT}${ip}/json` : `${API_ENDPOINT}json`;
    const response = await fetch(url);

    if (!response.ok) {
      // 429 Too Many Requests 같은 오류를 포함하여 처리
      throw new Error(`IP 정보 조회 API 네트워크 응답이 올바르지 않습니다: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();

    // ipinfo.io가 반환하는 에러 또는 bogon(사설/예약) IP 처리
    if (data.bogon || data.error) {
      throw new Error(data.error?.message || '유효하지 않거나 예약된 IP 주소입니다.');
    }

    let as = '';
    let org = '';
    let isp = '';

    // "AS12345 Google LLC"와 같은 형식의 'org' 필드를 파싱합니다.
    if (data.org) {
      const orgParts = data.org.split(' ');
      if (orgParts[0].startsWith('AS')) {
        as = orgParts.shift()!; // AS번호 추출
        org = orgParts.join(' '); // 나머지 부분은 기관명
      } else {
        org = data.org;
      }
      // ipinfo.io에서는 ISP와 Org 정보가 함께 제공되므로 동일하게 사용합니다.
      isp = org;
    }
    
    // ipinfo.io 응답 형식을 앱의 IPGeoData 인터페이스에 맞게 매핑합니다.
    return {
      status: 'success',
      query: data.ip,
      country: getCountryNameByCode(data.country),
      countryCode: data.country,
      regionName: data.region,
      city: data.city,
      isp: isp,
      org: org,
      as: as,
    };

  } catch (error) {
    console.error("IP 정보 조회 실패:", error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    // App.tsx에서 처리할 수 있도록 일관된 실패 객체를 반환합니다.
    return { status: 'fail', query: ip, message: errorMessage };
  }
};
