"use client";

import * as React from "react";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Onboarding } from "@/components/onboarding";
import {
  getInstalledModels,
  getHardware,
  listConversations,
  getConversation,
  createConversation,
  streamChat,
  InstalledModel,
  HardwareResponse,
  ConversationItem,
  ChatMessage,
} from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  Send,
  Sparkles,
  Paperclip,
  ChevronDown,
  MessageSquare,
  Square,
  RefreshCw,
  User,
} from "lucide-react";

import { LandingPage } from "@/components/landing-page";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [installedModels, setInstalledModels] = React.useState<InstalledModel[]>([]);
  const [selectedModel, setSelectedModel] = React.useState<string>("qwen2.5:0.5b");
  const [hardware, setHardware] = React.useState<HardwareResponse | null>(null);
  const [conversations, setConversations] = React.useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [checkingModels, setCheckingModels] = React.useState(true);
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const cancelStreamRef = React.useRef<(() => void) | null>(null);

  const scrollToBottom = React.useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const loadInitialData = React.useCallback(async () => {
    try {
      setCheckingModels(true);
      const [modelsRes, hwRes, convsRes] = await Promise.all([
        getInstalledModels(),
        getHardware().catch(() => null),
        listConversations().catch(() => []),
      ]);

      if (hwRes) setHardware(hwRes);
      if (convsRes) setConversations(convsRes);

      const modelsList = modelsRes.models || [];
      setInstalledModels(modelsList);

      if (modelsList.length > 0) {
        setSelectedModel(modelsList[0].name);
        setShowOnboarding(false);
      } else {
        setShowOnboarding(true);
      }
    } catch (err) {
      console.warn("Failed to check initial system state:", err);
      setShowOnboarding(true);
    } finally {
      setCheckingModels(false);
    }
  }, []);

  React.useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleSelectConversation = async (id: string) => {
    if (isStreaming && cancelStreamRef.current) {
      cancelStreamRef.current();
      setIsStreaming(false);
    }

    setActiveConversationId(id);
    try {
      const detail = await getConversation(id);
      setMessages(
        detail.messages.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        }))
      );
    } catch (err) {
      console.error("Failed to load conversation details:", err);
    }
  };

  const handleNewChat = () => {
    if (isStreaming && cancelStreamRef.current) {
      cancelStreamRef.current();
      setIsStreaming(false);
    }
    setActiveConversationId(null);
    setMessages([]);
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userText = input.trim();
    setInput("");

    let convId = activeConversationId;
    if (!convId) {
      try {
        const titleSnippet = userText.length > 30 ? userText.slice(0, 30) + "..." : userText;
        const newConv = await createConversation(titleSnippet);
        convId = newConv.id;
        setActiveConversationId(convId);
        setConversations((prev) => [newConv, ...prev]);
      } catch (err) {
        console.error("Failed to create conversation in DB:", err);
      }
    }

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: userText },
    ];
    setMessages(newMessages);

    // Append empty assistant message for token-by-token streaming
    const messagesWithAssistant: ChatMessage[] = [
      ...newMessages,
      { role: "assistant", content: "" },
    ];
    setMessages(messagesWithAssistant);
    setIsStreaming(true);

    const cancelFn = streamChat(
      {
        model: selectedModel,
        messages: newMessages,
        conversation_id: convId || undefined,
      },
      (tokenEvt) => {
        if (tokenEvt.content) {
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
              updated[lastIdx] = {
                ...updated[lastIdx],
                content: updated[lastIdx].content + tokenEvt.content,
              };
            }
            return updated;
          });
        }

        if (tokenEvt.done) {
          setIsStreaming(false);
          listConversations().then(setConversations).catch(() => {});
        }
      },
      (err) => {
        console.error("Stream error:", err);
        setIsStreaming(false);
      }
    );

    cancelStreamRef.current = cancelFn;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStopStream = () => {
    if (cancelStreamRef.current) {
      cancelStreamRef.current();
    }
    setIsStreaming(false);
  };

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <RefreshCw className="h-4 w-4 animate-spin text-primary" />
          <span>Loading session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  if (showOnboarding || (installedModels.length === 0 && !checkingModels)) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Onboarding
          onComplete={(newModelTag) => {
            setSelectedModel(newModelTag);
            loadInitialData();
          }}
          onBack={() => setShowOnboarding(false)}
        />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          hardware={hardware}
        />

        <SidebarInset className="flex flex-col flex-1 h-full overflow-hidden">
          {/* Header Bar */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 gap-2">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="h-4 w-[1px] bg-border" />
              <div className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span>
                  {activeConversationId
                    ? conversations.find((c) => c.id === activeConversationId)?.title ||
                      "Conversation"
                    : "New Chat"}
                </span>
              </div>
            </div>

            {/* Model Selector */}
            <div className="flex items-center gap-2">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="h-8 rounded-md border border-border/60 bg-muted/20 px-2.5 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {installedModels.map((m) => (
                  <option key={m.name} value={m.name} className="bg-background">
                    {m.name}
                  </option>
                ))}
              </select>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowOnboarding(true)}
                title="Model Catalog & Onboarding"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Main Message List Panel */}
          <div className="flex-1 overflow-hidden relative">
            <ScrollArea className="h-full px-4 py-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-20 space-y-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                      <Bot className="h-7 w-7" />
                    </div>
                    <div className="space-y-1 max-w-md">
                      <h2 className="text-xl font-semibold tracking-tight">
                        Loci Chat
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Connected to <span className="font-mono text-foreground font-medium">{selectedModel}</span>. Send a prompt to start chatting locally.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isUser = msg.role === "user";
                    return (
                      <div
                        key={idx}
                        className={`flex gap-3 ${
                          isUser ? "justify-end" : "items-start"
                        }`}
                      >
                        {!isUser && (
                          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border bg-muted text-foreground shadow-2xs">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}

                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                            isUser
                              ? "bg-primary text-primary-foreground rounded-tr-xs shadow-xs"
                              : "bg-muted/50 border border-border/50 rounded-tl-xs"
                          }`}
                        >
                          {msg.content || (
                            <span className="inline-flex items-center gap-1 text-muted-foreground text-xs animate-pulse font-mono">
                              <RefreshCw className="h-3 w-3 animate-spin" /> Thinking...
                            </span>
                          )}
                        </div>

                        {isUser && (
                          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="p-4 border-t bg-background/80 backdrop-blur-xs">
            <div className="max-w-3xl mx-auto relative rounded-2xl border border-border/60 bg-muted/20 p-2 shadow-xs focus-within:border-primary/50 transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${selectedModel} anything...`}
                rows={2}
                className="w-full resize-none bg-transparent px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none"
              />

              <div className="flex items-center justify-between pt-2 border-t border-border/40 px-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="font-mono text-[10px]">
                    Press Enter to send • Shift+Enter for new line
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isStreaming ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleStopStream}
                      className="h-8 gap-1.5 px-3"
                    >
                      <Square className="h-3.5 w-3.5 fill-current" />
                      <span>Stop</span>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      disabled={!input.trim()}
                      onClick={handleSend}
                      className="h-8 gap-1.5 px-3"
                    >
                      <span>Send</span>
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
