'use client';

import React from 'react';

interface BadgeProps {
  variant: 'teal' | 'brick' | 'gold' | 'blue' | 'gray';
  children: React.ReactNode;
  withDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, withDot = false }) => {
  const variantStyles = {
    teal: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    brick: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    gold: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    blue: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    gray: 'bg-white/[0.06] text-[#A1ABBD] border border-white/[0.08]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold leading-normal tracking-wide ${variantStyles[variant]}`}
    >
      {withDot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
};
