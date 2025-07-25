
import React, { useState, useCallback, useRef } from 'react';
import { IPGeoData } from '../types';
import { generatePostcardImage } from '../services/geminiService';
import LoadingSpinner from './ui/LoadingSpinner';
import Button from './ui/Button';

interface PostcardCreatorProps {
  geoData: IPGeoData;
  apiKey: string | null;
}

const PostcardCreator: React.FC<PostcardCreatorProps> = ({ geoData, apiKey }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const imageRef = useRef<HTMLImageElement>(null);

  const countryName = geoData.country;

  const handleGenerate = useCallback(async () => {
    if (!countryName) {
      setError("국가 정보 없이는 엽서를 생성할 수 없습니다.");
      return;
    }
    if (!apiKey) {
      setError("Gemini API 키가 설정되어 있지 않습니다.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setImageUrl(null);

    const prompt = `${countryName}의 아름답고 예술적인 디지털 엽서. 멋진 풍경 또는 상징적인 랜드마크, 생생한 색감, 몽환적인 분위기, 광각 뷰.`;

    try {
      const generatedImageUrl = await generatePostcardImage(prompt, apiKey);
      setImageUrl(generatedImageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [countryName, apiKey]);

  const handleDownload = () => {
    if (!imageRef.current || !imageUrl || !countryName) return;

    const canvas = document.createElement('canvas');
    const image = imageRef.current;
    
    const scale = window.devicePixelRatio || 1;
    canvas.width = image.naturalWidth * scale;
    canvas.height = image.naturalHeight * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(scale, scale);
    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);

    // Style the text
    const textPadding = 40;
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    
    // Add a subtle shadow for better readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    const locationText = `${countryName} (${geoData.countryCode})`;
    const ipText = `IP: ${geoData.query}`;

    ctx.fillText(locationText, image.naturalWidth - textPadding, image.naturalHeight - textPadding);
    ctx.fillText(ipText, image.naturalWidth - textPadding, image.naturalHeight - textPadding - 40);

    // Trigger download
    const link = document.createElement('a');
    link.download = `엽서_from_${countryName.replace(/\s/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col items-center animate-fade-in">
        <div className="w-full max-w-4xl">
            <div className="relative aspect-video bg-slate-800 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center overflow-hidden transition-colors duration-300">
                {isGenerating && (
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                        <LoadingSpinner />
                        <p className="mt-4 text-slate-300">엽서를 생성하는 중...</p>
                    </div>
                )}
                {error && !isGenerating && (
                     <div className="absolute inset-0 bg-red-900/20 flex flex-col items-center justify-center p-4 z-10 text-center">
                        <div className="text-5xl text-red-400" role="img" aria-label="오류">❗️</div>
                        <p className="mt-2 font-semibold text-red-300">생성 실패</p>
                        <p className="text-sm text-slate-300 max-w-sm">{error}</p>
                    </div>
                )}
                {imageUrl && !isGenerating && (
                    <img ref={imageRef} src={imageUrl} alt={`${countryName}에서 보낸 엽서`} className="w-full h-full object-cover" crossOrigin="anonymous"/>
                )}
                 {!isGenerating && !imageUrl && !error && (
                    <div className="text-center text-slate-500 p-4">
                        <div className="text-6xl mx-auto" role="img" aria-label="사진">🖼️</div>
                        <p className="mt-2 font-semibold">디지털 엽서가 여기에 표시됩니다.</p>
                        <p className="text-sm">아래 버튼을 클릭하여 생성해보세요!</p>
                        {!apiKey && <p className="mt-2 text-yellow-400/80 text-xs">Gemini API 키가 활성화되어야 엽서 생성이 가능합니다.</p>}
                    </div>
                )}
                {imageUrl && !isGenerating && countryName && (
                    <div className="absolute bottom-4 right-4 text-right pointer-events-none">
                        <p className="text-white text-3xl font-bold" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>{countryName} ({geoData.countryCode})</p>
                        <p className="text-white text-lg" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>IP: {geoData.query}</p>
                    </div>
                )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button onClick={handleGenerate} disabled={isGenerating || !countryName || !apiKey}>
                    <span className="mr-2" role="img" aria-label="반짝임">✨</span>
                    {imageUrl ? '새 엽서 생성' : '엽서 생성'}
                </Button>
                {imageUrl && !isGenerating && (
                    <Button onClick={handleDownload} variant="secondary">
                        <span className="mr-2" role="img" aria-label="다운로드">💾</span>
                        다운로드
                    </Button>
                )}
            </div>
        </div>
    </div>
  );
};

export default PostcardCreator;
