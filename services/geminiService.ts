
import { GoogleGenAI, Type } from "@google/genai";
import { PrivacyAnalysisResult, CloudflareTraceData } from "../types";

const getClient = (apiKey: string) => {
    if (!apiKey) {
        throw new Error("API 키가 제공되지 않았습니다. API 키를 설정해주세요.");
    }
    return new GoogleGenAI({ apiKey });
}

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
    if (!apiKey) return false;
    try {
        const ai = getClient(apiKey);
        // A lightweight call to check validity.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Hi",
            config: {
                maxOutputTokens: 1,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        // A valid key should return a response.
        return !!(response && response.text);
    } catch (error) {
        console.error("API Key validation failed:", error);
        return false;
    }
};

export const generatePostcardImage = async (prompt: string, apiKey: string): Promise<string> => {
   if (!apiKey) {
     throw new Error("Gemini API 키가 설정되지 않았습니다.");
   }
  try {
    const ai = getClient(apiKey);
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      throw new Error("API에서 이미지를 생성하지 못했습니다.");
    }
  } catch (error) {
    console.error("Error generating image with Gemini:", error);
    if (error instanceof Error && (error.message.includes("API key not valid") || error.message.includes("API_KEY_INVALID"))) {
        throw new Error("Gemini API 키가 유효하지 않습니다. 설정을 확인해주세요.");
    }
    throw new Error("엽서 이미지 생성에 실패했습니다. 서비스가 일시적으로 중단되었을 수 있습니다.");
  }
};

export const generatePrivacyAnalysis = async (traceData: CloudflareTraceData, apiKey: string): Promise<PrivacyAnalysisResult> => {
  if (!apiKey) {
    throw new Error("Gemini API 키가 설정되지 않았습니다.");
  }
  
  const analysisPrompt = `
    당신은 재치 있고 유능한 사이버 보안 전문가입니다. 사용자의 연결 데이터를 분석하여 프라이버시 팁과 재미있는 '인터넷 성향'을 진단해주세요. 모든 응답은 한국어로 작성해야 합니다.
    
    분석할 사용자 데이터:
    - IP 주소: ${traceData.ip || '알 수 없음'}
    - 국가: ${traceData.countryCode || '알 수 없음'}
    - 데이터 센터: ${traceData.dataCenter || '알 수 없음'}
    - HTTP 버전: ${traceData.httpVersion || '알 수 없음'}
    - TLS 버전: ${traceData.tlsVersion || '알 수 없음'}
    - User Agent: ${traceData.userAgent || '알 수 없음'}
    - WARP 사용 여부: ${traceData.warp || '알 수 없음'}

    출력 형식은 반드시 아래 JSON 스키마를 따라야 합니다.

    - **personality**: 사용자의 데이터를 기반으로 한 재미있고 창의적인 인터넷 성향 분석. (예: 안정적인 집콕형, 디지털 유목민, 최신 기술 얼리어답터 등)
    - **tips**: 각 데이터 포인트가 프라이버시 측면에서 어떤 의미를 갖는지 설명하고, 구체적인 개선 조언을 제공합니다. 위험도(severity)는 'info', 'warning', 'critical' 중 하나로 분류해주세요.
  `;

  try {
    const ai = getClient(apiKey);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: analysisPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personality: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "인터넷 성향의 이름" },
                description: { type: Type.STRING, description: "성향에 대한 재미있는 설명" },
                emoji: { type: Type.STRING, description: "성향을 나타내는 이모지" },
              },
              required: ["title", "description", "emoji"]
            },
            tips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "프라이버시 팁의 제목" },
                  description: { type: Type.STRING, description: "팁에 대한 상세 설명" },
                  severity: { type: Type.STRING, enum: ['info', 'warning', 'critical'], description: "팁의 중요도" },
                },
                required: ["title", "description", "severity"]
              }
            }
          },
          required: ["personality", "tips"]
        },
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as PrivacyAnalysisResult;

  } catch (error) {
    console.error("Error generating privacy analysis with Gemini:", error);
    if (error instanceof Error && (error.message.includes("API key not valid") || error.message.includes("API_KEY_INVALID"))) {
        throw new Error("Gemini API 키가 유효하지 않습니다. 설정을 확인해주세요.");
    }
    throw new Error("프라이버시 분석에 실패했습니다. 서비스가 일시적으로 중단되었거나 요청량이 많을 수 있습니다.");
  }
};
