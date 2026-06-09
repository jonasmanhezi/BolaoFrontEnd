"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type LiquidGlassTint = "default" | "emerald" | "sky";

interface LiquidGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tint?: LiquidGlassTint;
  children: React.ReactNode;
}

const tintClasses: Record<LiquidGlassTint, string> = {
  default: "liquid-glass",
  emerald: "liquid-glass liquid-glass-emerald",
  sky: "liquid-glass",
};

const LiquidGlassCard = React.forwardRef<HTMLDivElement, LiquidGlassCardProps>(
  ({ className, tint = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative group", className)}
        {...props}
      >
        <div
          className={cn(
            tintClasses[tint],
            "relative overflow-hidden rounded-[26px]",
            "transition-all duration-500 ease-out",
            "group-hover:scale-[1.015] group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.35)]"
          )}
        >
          <div className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-white/45 to-transparent pointer-events-none" />
          <div className="absolute -top-16 -right-10 w-36 h-36 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-8 w-28 h-28 rounded-full bg-cyan-300/8 blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-0 w-20 h-20 rounded-full bg-white/5 blur-2xl pointer-events-none" />

          <div className="relative z-10">{children}</div>
        </div>
      </div>
    );
  }
);
LiquidGlassCard.displayName = "LiquidGlassCard";

export { LiquidGlassCard };