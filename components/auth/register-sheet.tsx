'use client';

import { RegisterForm } from '@/components/auth/register-form';

interface RegisterSheetProps {
  open: boolean;
  onClose: () => void;
}

export function RegisterSheet({ open, onClose }: RegisterSheetProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/25 backdrop-blur-md flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[440px] max-h-[88dvh] overflow-y-auto rounded-t-[28px] border-t border-white/30 shadow-[0_-12px_48px_rgba(0,0,0,0.28)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute inset-0 bg-white/14 backdrop-blur-3xl rounded-t-[28px]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-linear-to-b from-white/22 via-white/12 to-white/8 pointer-events-none rounded-t-[28px]"
          aria-hidden
        />

        <div className="relative z-10 p-6 pb-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/60">Nova conta</div>
              <h2 className="text-xl font-bold tracking-tight mt-1">Criar Conta</h2>
              <p className="text-white/85 text-sm mt-1">Junte-se ao Bolão da Copa 2026</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl leading-none -mt-1"
              aria-label="Fechar"
            >
              ×
            </button>
          </div>

          <RegisterForm idPrefix="register-modal" />
        </div>
      </div>
    </div>
  );
}