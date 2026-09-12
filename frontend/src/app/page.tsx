"use client";

import * as React from "react";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  Send,
  Sparkles,
  Paperclip,
  ChevronDown,
  MessageSquare,
} from "lucide-react";

export default function Home() {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />

        <SidebarInset className="flex flex-col flex-1 h-full overflow-hidden">
          <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 gap-2">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="h-4 w-[1px] bg-border" />
              <div className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span>Project Architecture & Stack</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-2 text-xs font-normal border-border/60 bg-muted/20"
              >
                <Bot className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono">qwen2.5:0.5b</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-hidden relative">
            <ScrollArea className="h-full px-4 py-6">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex flex-col items-center justify-center text-center py-12 space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h2 className="text-xl font-semibold tracking-tight">
                      Loci — Your Own Local Intelligence
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Running private, open-source AI models entirely on your hardware with Ollama.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3 justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-xs bg-primary text-primary-foreground px-4 py-2.5 text-sm">
                      Can you explain how Loci runs local AI models privately?
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border bg-muted text-foreground">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="max-w-[85%] space-y-2">
                      <div className="rounded-2xl rounded-tl-xs bg-muted/50 border border-border/50 px-4 py-3 text-sm leading-relaxed">
                        Loci runs entirely locally on your system using Docker and Ollama. All models, weights, conversations, and embeddings stay on your device without transmitting data to third-party servers.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>

          <div className="p-4 border-t bg-background/80 backdrop-blur-xs">
            <div className="max-w-3xl mx-auto relative rounded-2xl border border-border/60 bg-muted/20 p-2 shadow-xs focus-within:border-primary/50 transition-colors">
              <textarea
                placeholder="Ask Loci anything..."
                rows={2}
                className="w-full resize-none bg-transparent px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none"
              />

              <div className="flex items-center justify-between pt-2 border-t border-border/40 px-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" className="h-8 gap-1.5 px-3">
                    <span>Send</span>
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-center text-muted-foreground/60 mt-2">
              Loci processes queries using local hardware resources.
            </p>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
