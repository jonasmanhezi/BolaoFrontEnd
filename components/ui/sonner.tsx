"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "liquid-glass border border-white/20 text-white shadow-lg backdrop-blur-xl",
          title: "text-white font-medium",
          description: "text-white/70",
          success: "border-emerald-400/35",
          error: "border-red-400/35",
        },
      }}
      {...props}
    />
  );
}