'use client';

import { Minus, Plus } from 'lucide-react';

interface ScoreStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export function ScoreStepper({ label, value, onChange }: ScoreStepperProps) {
  const decrement = () => onChange(Math.max(0, value - 1));
  const increment = () => onChange(value + 1);

  return (
    <div className="flex flex-col items-center">
      <div className="text-center text-xs text-white/50 mb-2">{label}</div>
      <div className="flex items-center gap-2 w-full">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= 0}
          className="w-12 h-12 shrink-0 rounded-xl palpite-modal-inner flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          aria-label={`Diminuir gols ${label}`}
        >
          <Minus size={20} />
        </button>

        <div className="flex-1 text-center text-5xl font-semibold tabular-nums py-4 rounded-2xl palpite-modal-inner text-white/90">
          {value}
        </div>

        <button
          type="button"
          onClick={increment}
          className="w-12 h-12 shrink-0 rounded-xl palpite-modal-inner flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={`Aumentar gols ${label}`}
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
}