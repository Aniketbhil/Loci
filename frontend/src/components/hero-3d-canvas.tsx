"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Bot, Sparkles } from "lucide-react";

function Hero3DFallback() {
  return (
    <div className="w-full h-[400px] sm:h-[480px] flex flex-col items-center justify-center p-6 relative select-none">
      {/* Soft background glow */}
      <div className="absolute w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col items-center justify-center space-y-4 relative z-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs animate-pulse">
          <Bot className="h-7 w-7" />
        </div>

        <div className="space-y-1 max-w-xs">
          <p className="text-xs font-mono uppercase tracking-wider text-primary flex items-center justify-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Initializing 3D Canvas
          </p>

          <p className="text-[11px] text-muted-foreground">
            Loading local neural network visualization...
          </p>
        </div>
      </div>
    </div>
  );
}

const Hero3DScene = dynamic(
  () => import("./hero-3d-scene"),
  {
    ssr: false,
    loading: () => <Hero3DFallback />,
  }
);

export function Hero3DCanvas() {
  return (
    <div className="w-full max-w-4xl mx-auto relative">
      <Hero3DScene />
    </div>
  );
}