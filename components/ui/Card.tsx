
import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-slate-800/50 border border-slate-700/50 rounded-lg shadow-lg overflow-hidden ${className}`}>
    {children}
  </div>
);

export const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-4 sm:p-5 border-b border-slate-700/50">
    {children}
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-lg font-semibold text-slate-100 flex items-center">
    {children}
  </h3>
);

export const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-4 sm:p-5 divide-y divide-slate-700/50">
    {children}
  </div>
);
