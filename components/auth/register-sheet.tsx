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
      className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-md flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[440px] max-h-[88dvh] overflow-y-auto rounded-t-[28px] border-t border-white/35 shadow-[0_-12px_48px_rgba(0,0,0,0.28)] auth-glass-field"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative z-10 p-6 pb-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/85">Nova conta</div>
              <h2 className="text-xl font-bold tracking-tight mt-1 text-white">Criar Conta</h2>
              <p className="text-white/90 text-sm mt-1">Junte-se ao Bolão da Copa 2026</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-white/90 hover:text-white text-2xl leading-none -mt-1"
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