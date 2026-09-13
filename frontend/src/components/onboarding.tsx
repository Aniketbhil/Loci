"use client";

import * as React from "react";
import {
  getHardware,
  getRecommendations,
  installModel,
  cancelModelInstall,
  getInstallStatuses,
  getInstalledModels,
  InstalledModel,
  HardwareResponse,
  ModelRecommendationsResponse,
  TierRecommendation,
  InstallProgressEvent,
} from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Zap,
  Scale,
  Sparkles,
  Download,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Info,
  X,
} from "lucide-react";

interface OnboardingProps {
  onComplete?: (installedModel: string) => void;
  onBack?: () => void;
}

export function Onboarding({ onComplete, onBack }: OnboardingProps) {
  const [hardware, setHardware] = React.useState<HardwareResponse | null>(null);
  const [recommendations, setRecommendations] =
    React.useState<ModelRecommendationsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [installState, setInstallState] = React.useState<{
    [tag: string]: {
      installing: boolean;
      status: string;
      percent: number;
      isDone: boolean;
    };
  }>({});

  const [expandedDetails, setExpandedDetails] = React.useState<{
    [tag: string]: boolean;
  }>({});
  const [installedModelsList, setInstalledModelsList] = React.useState<InstalledModel[]>([]);

  const cancelFnsRef = React.useRef<{ [tag: string]: () => void }>({});

  const refreshInstalledModels = React.useCallback(async () => {
    try {
      const res = await getInstalledModels();
      const models = res.models || [];
      setInstalledModelsList(models);
      return models;
    } catch (err) {
      console.warn("Failed to fetch installed models:", err);
      setInstalledModelsList([]);
      return [];
    }
  }, []);

  const attachInstallStream = React.useCallback(
    (tag: string) => {
      if (cancelFnsRef.current[tag]) return;

      const cancelFn = installModel(
        tag,
        (evt: InstallProgressEvent) => {
          if (evt.status === "success" || evt.status === "done") {
            setInstallState((prev) => ({
              ...prev,
              [tag]: {
                installing: false,
                status: "Installed & ready",
                percent: 100,
                isDone: true,
              },
            }));
            refreshInstalledModels();
            setTimeout(() => {
              if (onComplete) {
                onComplete(tag);
              }
            }, 800);
            return;
          }

          let pct = 0;
          if (evt.completed && evt.total) {
            pct = Math.round((evt.completed / evt.total) * 100);
          } else if (evt.percent !== undefined) {
            pct = evt.percent;
          }

          setInstallState((prev) => ({
            ...prev,
            [tag]: {
              installing: true,
              status: evt.status || "Downloading...",
              percent: pct,
              isDone: false,
            },
          }));
        },
        (err) => {
          setInstallState((prev) => ({
            ...prev,
            [tag]: {
              installing: false,
              status: `Error: ${err.message}`,
              percent: 0,
              isDone: false,
            },
          }));
        }
      );

      cancelFnsRef.current[tag] = cancelFn;
    },
    [onComplete, refreshInstalledModels]
  );

  React.useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [hwData, recData, activeStatuses] = await Promise.all([
          getHardware(),
          getRecommendations(),
          getInstallStatuses().catch(() => ({})),
        ]);
        setHardware(hwData);
        setRecommendations(recData);

        await refreshInstalledModels();

        if (activeStatuses) {
          Object.values(activeStatuses).forEach((task) => {
            if (task.state === "installing") {
              setInstallState((prev) => ({
                ...prev,
                [task.model_name]: {
                  installing: true,
                  status: task.status || "Downloading...",
                  percent: task.percent || 0,
                  isDone: false,
                },
              }));
              attachInstallStream(task.model_name);
            }
          });
        }
      } catch (err: any) {
        console.error("Failed to load onboarding recommendations:", err);
        setError("Unable to connect to Loci backend service.");
      } finally {
        setLoading(false);
      }
    }
    loadData();

    return () => {
      Object.values(cancelFnsRef.current).forEach((cancelFn) => cancelFn());
      cancelFnsRef.current = {};
    };
  }, [attachInstallStream, refreshInstalledModels]);

  const toggleDetails = (tag: string) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [tag]: !prev[tag],
    }));
  };

  const handleInstall = (tag: string) => {
    setInstallState((prev) => ({
      ...prev,
      [tag]: {
        installing: true,
        status: "Starting download...",
        percent: 0,
        isDone: false,
      },
    }));

    attachInstallStream(tag);
  };

  const handleCancel = async (tag: string) => {
    if (cancelFnsRef.current[tag]) {
      cancelFnsRef.current[tag]();
      delete cancelFnsRef.current[tag];
    }

    setInstallState((prev) => {
      const updated = { ...prev };
      delete updated[tag];
      return updated;
    });

    try {
      await cancelModelInstall(tag);
    } catch (err) {
      console.warn("Failed to cancel model install on backend:", err);
    } finally {
      await refreshInstalledModels();
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "Fast & light":
        return <Zap className="h-5 w-5 text-amber-500" />;
      case "Balanced":
        return <Scale className="h-5 w-5 text-blue-500" />;
      case "Most capable":
        return <Sparkles className="h-5 w-5 text-purple-500" />;
      default:
        return <Sparkles className="h-5 w-5 text-primary" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const showBackButton = installedModelsList.length > 0 && !!onBack;

  console.log("[Onboarding] Back to chat check:", {
    installedModelsCount: installedModelsList.length,
    installedModels: installedModelsList.map((m) => m.name),
    hasOnBack: !!onBack,
    showBackButton,
  });

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {showBackButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="fixed top-4 left-4 z-50 gap-2 shadow-xs bg-background/80 backdrop-blur-xs border-border/80 hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to chat</span>
        </Button>
      )}

      <div className="text-center space-y-3 max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Local Hardware Analysis Complete</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to Loci
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Select an AI model to power your private local intelligence. Recommendations are tailored to your hardware capabilities.
        </p>

        {hardware && (
          <div className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground/80 bg-muted/30 px-3 py-1 rounded-md border border-border/40">
            <Cpu className="h-3.5 w-3.5 text-primary" />
            <span>
              Detected: {hardware.ram.total_gb}GB RAM • {hardware.cpu.logical_cores} Cores
              {hardware.gpu.available ? ` • ${hardware.gpu.name}` : " • CPU Mode"}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/75 font-normal mb-">
        <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
        <span>
          Installing a model may take a few minutes depending on your internet speed and the model size.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {recommendations?.recommendations.map((rec: TierRecommendation) => {
          const { model, tier, meets_hardware_requirements, reason } = rec;
          const tag = model.ollama_tag;
          const currentInstall = installState[tag] || {
            installing: false,
            status: "",
            percent: 0,
            isDone: false,
          };
          const isExpanded = !!expandedDetails[tag];

          const isAlreadyInstalled =
            currentInstall.isDone ||
            installedModelsList.some(
              (m) => m.name === tag || m.name.startsWith(tag)
            );

          return (
            <Card
              key={model.id}
              className={`flex flex-col justify-between transition-all duration-200 border-border/60 hover:border-border relative ${
                meets_hardware_requirements
                  ? "bg-card shadow-xs"
                  : "bg-card/60 opacity-90"
              }`}
            >
              <div>
                <CardHeader className="pb-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTierIcon(tier)}
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {tier}
                      </span>
                    </div>

                    {meets_hardware_requirements && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Recommended
                      </span>
                    )}
                  </div>

                  <CardTitle className="text-lg font-bold">
                    {model.name}
                  </CardTitle>

                  <CardDescription className="text-xs leading-relaxed min-h-[3rem]">
                    {model.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pb-3">
                  {currentInstall.installing && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center text-[11px] font-mono text-muted-foreground">
                        <span className="truncate max-w-[65%]">{currentInstall.status}</span>
                        <span>{currentInstall.percent}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={currentInstall.percent} className="h-1.5 flex-1" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancel(tag)}
                          className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                          title="Cancel installation"
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          <span>Cancel</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-border/40">
                    <button
                      type="button"
                      onClick={() => toggleDetails(tag)}
                      className="flex items-center justify-between w-full text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
                    >
                      <span>Advanced details</span>
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-1.5 text-[11px] font-mono text-muted-foreground bg-muted/40 p-2.5 rounded-md border border-border/30 animate-in fade-in duration-150">
                        <div className="flex justify-between">
                          <span>Ollama Tag:</span>
                          <span className="text-foreground">{model.ollama_tag}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Parameters:</span>
                          <span className="text-foreground">{model.param_size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quantization:</span>
                          <span className="text-foreground">{model.recommended_quant}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Min RAM / VRAM:</span>
                          <span className="text-foreground">
                            {model.min_ram_gb}GB / {model.min_vram_gb}GB
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground/80 pt-1 font-sans border-t border-border/20">
                          {reason}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pt-2">
                {isAlreadyInstalled ? (
                  <Button
                    className="w-full gap-2 shadow-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/10 cursor-not-allowed font-medium opacity-90"
                    variant="outline"
                    disabled
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Installed</span>
                  </Button>
                ) : (
                  <Button
                    className="w-full gap-2 shadow-xs"
                    disabled={currentInstall.installing}
                    onClick={() => handleInstall(tag)}
                  >
                    {currentInstall.installing ? (
                      <>
                        <Download className="h-4 w-4 animate-bounce" />
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Install Model</span>
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
