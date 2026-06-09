'use client';

import { cn } from '@/lib/utils';

interface UnderlineFieldProps {
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

export function UnderlineField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  minLength,
  autoComplete,
}: UnderlineFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] uppercase tracking-[0.18em] text-white mb-2">
        {label}
      </label>
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
          'w-full bg-transparent border-0 border-b-2 border-white',
          'px-0 py-2.5 text-white text-[15px] placeholder-white/80',
          'focus:outline-none focus:border-white focus:ring-0',
          'rounded-none transition-colors caret-white'
        )}
      />
    </div>
  );
}