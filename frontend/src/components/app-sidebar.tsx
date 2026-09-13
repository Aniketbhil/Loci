"use client";

import * as React from "react";
import {
  MessageSquare,
  Plus,
  Bot,
  Settings,
  Cpu,
  LogOut,
  User,
  Trash2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
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
import {
  ConversationItem,
  HardwareResponse,
  deleteConversation,
  clearAllConversations,
} from "@/lib/api";

interface AppSidebarProps {
  conversations: ConversationItem[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation?: (id: string) => void;
  onClearAllConversations?: () => void;
  hardware: HardwareResponse | null;
}

export function AppSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onClearAllConversations,
  hardware,
}: AppSidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [deleteTargetId, setDeleteTargetId] = React.useState<string | null>(null);
  const [singleDeleteSubmitting, setSingleDeleteSubmitting] = React.useState(false);

  const [showClearAllModal, setShowClearAllModal] = React.useState(false);
  const [clearAllSubmitting, setClearAllSubmitting] = React.useState(false);

  const handleConfirmSingleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setSingleDeleteSubmitting(true);
      await deleteConversation(deleteTargetId);
      if (onDeleteConversation) {
        onDeleteConversation(deleteTargetId);
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    } finally {
      setSingleDeleteSubmitting(false);
      setDeleteTargetId(null);
    }
  };

  const handleConfirmClearAll = async () => {
    try {
      setClearAllSubmitting(true);
      await clearAllConversations();
      if (onClearAllConversations) {
        onClearAllConversations();
      }
    } catch (err) {
      console.error("Failed to clear all conversations:", err);
    } finally {
      setClearAllSubmitting(false);
      setShowClearAllModal(false);
    }
  };

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

        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2 shadow-xs"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </Button>
      </SidebarHeader>

      <Separator className="opacity-50" />

      <SidebarContent className="p-0">
        <SidebarGroup className="p-2">
          <div className="flex items-center justify-between px-2 py-1">
            <SidebarGroupLabel className="p-0 text-xs font-medium text-muted-foreground">
              Conversations
            </SidebarGroupLabel>

            {conversations.length > 0 && (
              <button
                type="button"
                onClick={() => setShowClearAllModal(true)}
                className="text-[10px] font-mono text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                title="Clear all conversation history"
              >
                Clear All
              </button>
            )}
          </div>

          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100vh-14rem)] pr-1">
              <SidebarMenu className="space-y-1">
                {conversations.length === 0 ? (
                  <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                    No conversations yet. Start a new chat!
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const isActive = conv.id === activeConversationId;
                    return (
                      <SidebarMenuItem key={conv.id} className="group/item relative">
                        <div className="flex items-center justify-between w-full rounded-md hover:bg-muted/50">
                          <SidebarMenuButton
                            isActive={isActive}
                            onClick={() => onSelectConversation(conv.id)}
                            className="flex-1 justify-between h-9 px-2.5 pr-8"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                              <span className="text-xs truncate font-medium">
                                {conv.title || "Untitled Conversation"}
                              </span>
                            </div>
                          </SidebarMenuButton>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTargetId(conv.id);
                            }}
                            className="absolute right-1 h-7 w-7 opacity-0 group-hover/item:opacity-100 hover:text-destructive shrink-0 transition-opacity"
                            title="Delete conversation"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </SidebarMenuItem>
                    );
                  })
                )}
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
            <span className="font-mono text-[11px]">
              {hardware
                ? `${hardware.ram.total_gb}GB RAM • ${hardware.cpu.logical_cores} Cores`
                : "Loading System..."}
            </span>
          </div>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {user && (
          <div className="flex items-center justify-between px-2 py-1.5 rounded-md border border-border/40 bg-muted/20 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate font-medium text-xs">{user.name || user.email}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logout()}
              title="Log out"
              className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="sm"
              onClick={() => router.push("/settings")}
              className="w-full justify-start gap-2 text-xs"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Single Conversation Delete Dialog Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-card border border-border/80 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 border border-destructive/20 shrink-0">
                <AlertTriangle className="h-4.5 w-4.5 text-destructive" />
              </div>
              <h3 className="text-base font-bold leading-tight">Delete Conversation?</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete this conversation and its message history? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <Button
                variant="outline"
                size="sm"
                disabled={singleDeleteSubmitting}
                onClick={() => setDeleteTargetId(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={singleDeleteSubmitting}
                onClick={handleConfirmSingleDelete}
                className="gap-2 text-xs"
              >
                {singleDeleteSubmitting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Conversations Dialog Modal */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-card border border-border/80 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 border border-destructive/20 shrink-0">
                <AlertTriangle className="h-4.5 w-4.5 text-destructive" />
              </div>
              <h3 className="text-base font-bold leading-tight">Clear All History?</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete ALL your conversations and chat history? This action is permanent and cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <Button
                variant="outline"
                size="sm"
                disabled={clearAllSubmitting}
                onClick={() => setShowClearAllModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={clearAllSubmitting}
                onClick={handleConfirmClearAll}
                className="gap-2 text-xs"
              >
                {clearAllSubmitting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Clearing...</span>
                  </>
                ) : (
                  <span>Clear All History</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
