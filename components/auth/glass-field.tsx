'use client';

import { cn } from '@/lib/utils';

interface GlassFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
}

export function GlassField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  minLength,
  autoComplete,
}: GlassFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[11px] uppercase tracking-[0.16em] text-white/95 mb-2 px-1"
      >
        {label}
      </label>
      <div className={cn('auth-glass-field rounded-2xl px-4 transition-all duration-300')}>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={cn(
            'w-full bg-transparent border-0 py-3.5',
            'text-white text-[15px] font-medium placeholder:text-white/70',
            'focus:outline-none caret-white'
          )}
        />
      </div>
    </div>
  );
}