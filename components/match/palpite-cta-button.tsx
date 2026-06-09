'use client';

import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PalpiteCtaButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

export function PalpiteCtaButton({
  children,
  onClick,
  className,
  type = 'button',
  disabled,
}: PalpiteCtaButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'py-3.5 rounded-xl backdrop-blur-md',
        'bg-linear-to-r from-[#182060]/95 via-[#1a247d]/95 to-[#1e2f7a]/95',
        'border border-white/18 hover:border-white/28',
        'hover:from-[#1e2a72] hover:via-[#2438a8] hover:to-[#2a4494]',
        'text-white font-semibold text-sm tracking-wide transition-all active:scale-[0.98]',
        'flex items-center justify-center gap-1',
        'shadow-[0_4px_20px_rgba(26,36,125,0.4)] hover:shadow-[0_6px_28px_rgba(36,56,168,0.5)]',
        'disabled:opacity-50 disabled:pointer-events-none',
        className
      )}
    >
      {children}
      <ChevronRight size={16} />
    </button>
  );
}