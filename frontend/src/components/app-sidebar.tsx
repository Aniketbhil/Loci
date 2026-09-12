"use client";

import * as React from "react";
import {
  MessageSquare,
  Plus,
  Bot,
  Settings,
  Cpu,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const sampleConversations = [
  { id: "1", title: "Project Architecture & Stack", date: "Just now" },
  { id: "2", title: "FastAPI & Alembic Setup", date: "Today" },
  { id: "3", title: "DeepSeek Reasoning Test", date: "Yesterday" },
  { id: "4", title: "Hardware Memory Optimization", date: "2 days ago" },
  { id: "5", title: "Qwen 2.5 7B Benchmarks", date: "3 days ago" },
];

export function AppSidebar() {
  const [activeId, setActiveId] = React.useState("1");

  return (
    <Sidebar className="border-r border-border/40 bg-sidebar">
      <SidebarHeader className="p-4 space-y-3">
        <div className="flex items-center gap-2.5 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold shadow-xs">
            <Bot className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-sm leading-none tracking-tight">
              Loci
            </span>
            <span className="text-[11px] text-muted-foreground leading-none">
              Local Intelligence
            </span>
          </div>
        </div>

        <Button className="w-full justify-start gap-2 shadow-xs" size="sm">
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </Button>
      </SidebarHeader>

      <Separator className="opacity-50" />

      <SidebarContent className="p-0">
        <SidebarGroup className="p-2">
          <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground">
            Recent Conversations
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100vh-14rem)] pr-1">
              <SidebarMenu className="space-y-1">
                {sampleConversations.map((conv) => {
                  const isActive = conv.id === activeId;
                  return (
                    <SidebarMenuItem key={conv.id}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => setActiveId(conv.id)}
                        className="w-full justify-between h-9 px-2.5 group"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                          <span className="text-xs truncate font-medium">
                            {conv.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground/70 shrink-0">
                          {conv.date}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <Separator className="opacity-50" />

      <SidebarFooter className="p-3 space-y-2">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-muted/40 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono text-[11px]">3.56GB RAM • 12 Cores</span>
          </div>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="sm" className="w-full justify-start gap-2 text-xs">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
