'use client';

import { cn } from '@/lib/utils';

interface AuthSubmitButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function AuthSubmitButton({ children, disabled, className }: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={cn(
        'w-full py-4 rounded-none bg-white text-black',
        'text-base font-bold uppercase tracking-[0.12em]',
        'transition-all hover:bg-white/95 active:scale-[0.99]',
        'disabled:opacity-50 disabled:pointer-events-none',
        'mt-4',
        className
      )}
    >
      {children}
    </button>
  );
}