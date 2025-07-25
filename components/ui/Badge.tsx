import React from 'react';

interface BadgeProps {
  score: number;
  className?: string;
}

const ScoreBadge: React.FC<BadgeProps> = ({ score, className = '' }) => {
  const getBadgeStyles = () => {
    if (score >= 80) {
      return 'bg-green-800/50 text-green-300 border-green-500/50';
    }
    if (score >= 50) {
      return 'bg-yellow-800/50 text-yellow-300 border-yellow-500/50';
    }
    return 'bg-red-800/50 text-red-300 border-red-500/50';
  };

  return (
    <div className={`px-3 py-1 text-sm font-bold rounded-full border ${getBadgeStyles()} ${className}`}>
      보안 점수: {score} / 100
    </div>
  );
};

export default ScoreBadge;
