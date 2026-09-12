"use client";

import * as React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Hero3DCanvas } from "@/components/hero-3d-canvas";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "cn";
import {
  Bot,
  ShieldCheck,
  Cpu,
  Zap,
  HardDrive,
  MessageSquare,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-semibold shadow-xs">
              <Bot className="h-5 w-5" />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight">Loci</span>

              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Local AI
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
            <a
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </a>

            <a
              href="#architecture"
              className="hover:text-foreground transition-colors"
            >
              Architecture
            </a>

            <a
              href="#privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-xs font-medium"
              )}
            >
              Sign In
            </Link>

            <Link
              href="/signup"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "text-xs font-medium shadow-xs gap-1"
              )}
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-visible pt-16 pb-20 md:pt-24 md:pb-28">
        {/* Subtle background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium animate-in fade-in duration-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>100% Private Local Intelligence</span>
          </div>

          {/* Hero Heading */}
          <div className="space-y-4 max-w-4xl mx-auto relative z-20">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15] pb-2">
              Your own{" "}
              <span className="bg-gradient-to-r from-primary via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                local intelligence
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Run state-of-the-art AI models directly on your device. Zero
              cloud dependencies, zero data tracking, and hardware-aware model
              recommendations tailored to your machine.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "w-full sm:w-auto h-11 px-8 text-sm font-semibold shadow-md gap-2"
              )}
            >
              <span>Start Chatting Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full sm:w-auto h-11 px-8 text-sm font-semibold border-border/60"
              )}
            >
              Sign In to Workspace
            </Link>
          </div>

          {/* 3D Hero Centerpiece */}
          <div className="pt-6 pb-2">
            <Hero3DCanvas />
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section
        id="features"
        className="py-20 border-t border-border/40 bg-muted/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Engineered for absolute privacy and performance
            </h2>

            <p className="text-sm text-muted-foreground">
              Everything you need for an intelligent local workspace without
              cloud compromises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="border-border/60 shadow-xs bg-card/80 transition-all hover:border-primary/50">
              <CardContent className="p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <h3 className="text-base font-semibold">
                  100% Private & Local
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your prompts, files, and conversation history never touch
                  external servers. Complete privacy guaranteed by design.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-border/60 shadow-xs bg-card/80 transition-all hover:border-primary/50">
              <CardContent className="p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Cpu className="h-5 w-5" />
                </div>

                <h3 className="text-base font-semibold">
                  Hardware-Aware Recommendations
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Loci detects your RAM, CPU cores, and GPU VRAM to suggest
                  optimal models like Qwen and Llama that run smoothly on your
                  setup.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-border/60 shadow-xs bg-card/80 transition-all hover:border-primary/50">
              <CardContent className="p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Zap className="h-5 w-5" />
                </div>

                <h3 className="text-base font-semibold">
                  Zero-Jargon Setup
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  No complex CLI commands or configuration files. Install
                  models with a single click and track pull progress with
                  background tasks.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-border/60 shadow-xs bg-card/80 transition-all hover:border-primary/50">
              <CardContent className="p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <HardDrive className="h-5 w-5" />
                </div>

                <h3 className="text-base font-semibold">
                  Self-Hosted & Offline Ready
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Direct integration with Ollama allows you to run your models
                  offline in airplane mode with zero external subscriptions.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="border-border/60 shadow-xs bg-card/80 transition-all hover:border-primary/50">
              <CardContent className="p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <MessageSquare className="h-5 w-5" />
                </div>

                <h3 className="text-base font-semibold">
                  Real-Time Token Streaming
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Low-latency Server-Sent Events (SSE) stream model output
                  character-by-character. Stop or switch generations
                  instantly.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="border-border/60 shadow-xs bg-card/80 transition-all hover:border-primary/50">
              <CardContent className="p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Lock className="h-5 w-5" />
                </div>

                <h3 className="text-base font-semibold">
                  Secure Local Auth & Sessions
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  JWT authentication with HTTP-only cookies, argon2 password
                  hashing, and Google OAuth support for seamless workspace
                  access.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Architecture & Comparison Section */}
      <section
        id="architecture"
        className="py-20 border-t border-border/40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why switch to local AI?
            </h2>

            <p className="text-sm text-muted-foreground">
              Compare traditional cloud AI providers with Loci&apos;s
              self-hosted architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Cloud AI Box */}
            <Card className="border-border/50 bg-card/40 p-6 space-y-4 opacity-75">
              <div className="flex items-center gap-2 font-bold text-destructive">
                <span>Cloud AI Vendors</span>
              </div>

              <ul className="space-y-3 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">×</span>
                  <span>
                    Prompts and data sent to third-party data centers
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">×</span>
                  <span>Monthly recurring subscription costs</span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">×</span>
                  <span>Requires persistent internet connection</span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">×</span>
                  <span>Rate limits and vendor lock-in</span>
                </li>
              </ul>
            </Card>

            {/* Loci Box */}
            <Card className="border-primary/50 bg-primary/5 p-6 space-y-4 relative shadow-lg">
              <div className="flex items-center gap-2 font-bold text-primary">
                <Bot className="h-5 w-5 text-primary" />
                <span>Loci Local AI</span>
              </div>

              <ul className="space-y-3 text-xs font-medium">
                <li className="flex items-start gap-2 text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    100% private — data stays on your local disk
                  </span>
                </li>

                <li className="flex items-start gap-2 text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Free and open-source self-hosted runtime</span>
                </li>

                <li className="flex items-start gap-2 text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Operates completely offline anywhere</span>
                </li>

                <li className="flex items-start gap-2 text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Hardware-optimized for your exact specs</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Site Footer */}
      <SiteFooter />
    </div>
  );
}