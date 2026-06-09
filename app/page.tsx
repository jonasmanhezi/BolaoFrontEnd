"use client";

import { GlassButton } from "@/components/ui/glass-button";
import { FaArrowRight } from "react-icons/fa";
import { useRouter } from 'next/navigation';

export default function BolaoSplash() {
  const router = useRouter();

  return (
    <div className="min-h-dvh bolao-splash-bg flex flex-col text-white overflow-hidden relative">
      <div className="bolao-splash-highlight absolute inset-0 pointer-events-none" />

      <div className="flex-1 min-h-0 flex items-center justify-center px-5 overflow-hidden relative z-10">
        <div className="flex flex-col items-center max-h-[52dvh]">
          <img
            src="/fifa.png"
            alt="Logo do Bolão"
            className="w-[80vw] max-w-[400px] h-auto max-h-[34dvh] object-contain"
          />
          <img
            src="/write.png"
            alt="bolaowrite"
            className="w-[70vw] max-w-[300px] h-auto max-h-[17dvh] object-contain -mt-1"
          />
        </div>
      </div>

      <div className="px-6 pb-9 pt-4 relative z-10 bg-gradient-to-t from-black/45 via-black/22 to-transparent backdrop-blur-2xl border-t border-white/10">
        <div className="w-full max-w-[300px] text-center mx-auto mb-5">
          <p className="text-[14px] leading-snug text-white/75 tracking-[-0.1px]">
            Faça suas apostas para a Copa do Mundo 2026 e divirta-se com seus amigos!<br /><br />
            Junte-se ao nosso bolão e mostre que você é o melhor palpiteiro do torneio.
          </p>
        </div>

        <div className="w-full flex justify-center">
          <div className="flex flex-col items-center">
            <GlassButton
              variant="default"
              size="icon"
              glowEffect={false}
              onClick={() => router.push('/login')}
              aria-label="Entrar no Bolão"
              className="w-20 h-20 rounded-full text-white touch-manipulation"
            >
              <FaArrowRight size={34} />
            </GlassButton>

            <span className="mt-2.5 text-[10px] font-medium tracking-[3px] text-white/55">ENTRAR</span>
          </div>
        </div>
      </div>
    </div>
  );
}