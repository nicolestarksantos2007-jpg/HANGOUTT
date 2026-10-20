'use client';

import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  description,
  actionLabel,
  onAction,
}) => {
  const text = subtitle || description || '';

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-2.5">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-emerald-400/60 mb-1">
        <Inbox className="w-6 h-6" />
      </div>
      <div className="text-sm font-semibold text-white tracking-tight">{title}</div>
      {text && <div className="text-xs text-[#8E99AD] max-w-sm leading-relaxed">{text}</div>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
