"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  changePasswordApi,
  clearAllConversations,
  getInstalledModels,
  deleteInstalledModel,
  InstalledModel,
} from "@/lib/api";
import { cn } from "cn";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User as UserIcon,
  Mail,
  Lock,
  LogOut,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Shield,
  AlertTriangle,
  Cpu,
  HardDrive,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, updateUser, logout, deleteAccount } = useAuth();

  // Profile section state
  const [name, setName] = React.useState("");
  const [profileSubmitting, setProfileSubmitting] = React.useState(false);
  const [profileSuccess, setProfileSuccess] = React.useState<string | null>(null);
  const [profileError, setProfileError] = React.useState<string | null>(null);

  // Password section state
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordSubmitting, setPasswordSubmitting] = React.useState(false);
  const [passwordSuccess, setPasswordSuccess] = React.useState<string | null>(null);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);

  // Account section state
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = React.useState(false);
  const [showClearHistoryModal, setShowClearHistoryModal] = React.useState(false);
  const [clearHistorySubmitting, setClearHistorySubmitting] = React.useState(false);
  const [accountSuccess, setAccountSuccess] = React.useState<string | null>(null);
  const [accountError, setAccountError] = React.useState<string | null>(null);

  // Installed Models section state
  const [installedModels, setInstalledModels] = React.useState<InstalledModel[]>([]);
  const [loadingModels, setLoadingModels] = React.useState(true);
  const [modelSuccess, setModelSuccess] = React.useState<string | null>(null);
  const [modelError, setModelError] = React.useState<string | null>(null);
  const [modelToDelete, setModelToDelete] = React.useState<InstalledModel | null>(null);
  const [deletingModel, setDeletingModel] = React.useState(false);

  const fetchInstalledModels = React.useCallback(async () => {
    try {
      setLoadingModels(true);
      const res = await getInstalledModels();
      setInstalledModels(res.models || []);
    } catch (err: any) {
      console.error("Failed to load installed models:", err);
      setModelError(err.message || "Failed to load installed models.");
    } finally {
      setLoadingModels(false);
    }
  }, []);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      setName(user.name || "");
      fetchInstalledModels();
    }
  }, [authLoading, user, router, fetchInstalledModels]);

  const formatSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return "Unknown size";
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleConfirmDeleteModel = async () => {
    if (!modelToDelete) return;
    setModelError(null);
    setModelSuccess(null);
    try {
      setDeletingModel(true);
      await deleteInstalledModel(modelToDelete.name);
      setModelSuccess(`Model "${modelToDelete.name}" was successfully deleted from Ollama storage.`);
      setInstalledModels((prev) => prev.filter((m) => m.name !== modelToDelete.name));
      setModelToDelete(null);
    } catch (err: any) {
      setModelError(err.message || `Failed to delete model ${modelToDelete.name}.`);
      setModelToDelete(null);
    } finally {
      setDeletingModel(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);

    if (!name.trim()) {
      setProfileError("Name cannot be empty.");
      return;
    }

    try {
      setProfileSubmitting(true);
      await updateUser(name.trim());
      setProfileSuccess("Profile updated successfully!");
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile.");
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setPasswordSubmitting(true);
      await changePasswordApi({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password.");
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleConfirmClearHistory = async () => {
    setAccountError(null);
    setAccountSuccess(null);
    try {
      setClearHistorySubmitting(true);
      await clearAllConversations();
      setAccountSuccess("All conversation history has been cleared successfully.");
      setShowClearHistoryModal(false);
    } catch (err: any) {
      setAccountError(err.message || "Failed to clear conversation history.");
      setShowClearHistoryModal(false);
    } finally {
      setClearHistorySubmitting(false);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    setAccountError(null);
    try {
      setDeleteSubmitting(true);
      await deleteAccount();
      router.push("/signup");
    } catch (err: any) {
      setAccountError(err.message || "Failed to delete account.");
      setShowDeleteModal(false);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <RefreshCw className="h-4 w-4 animate-spin text-primary" />
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-xs text-muted-foreground">
              Manage your personal profile, security options, and account status.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/")}
            className="gap-2 text-xs font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Chat</span>
          </Button>
        </div>

        {accountError && (
          <div className="flex items-center gap-2 p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{accountError}</span>
          </div>
        )}

        {/* Section 1: Profile */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-bold">Profile</CardTitle>
            </div>
            <CardDescription className="text-xs">
              View your account details and update your display name.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {profileSuccess && (
              <div className="flex items-center gap-2 p-3 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div className="flex items-center gap-2 p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email Address
                </label>
                <Input
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted/40 text-muted-foreground cursor-not-allowed"
                />
                <p className="text-[10px] text-muted-foreground">
                  Email address cannot be changed.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <UserIcon className="h-3.5 w-3.5" /> Full Name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={profileSubmitting}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <Button
                type="submit"
                size="sm"
                className="gap-2 shadow-xs"
                disabled={profileSubmitting || name.trim() === user.name}
              >
                {profileSubmitting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Section: Installed Models */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-bold">Installed Models</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchInstalledModels}
                disabled={loadingModels}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                title="Refresh installed models list"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", loadingModels && "animate-spin")} />
                <span>Refresh</span>
              </Button>
            </div>
            <CardDescription className="text-xs">
              Manage locally downloaded Ollama models and delete model weights from disk.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {modelSuccess && (
              <div className="flex items-center gap-2 p-3 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{modelSuccess}</span>
              </div>
            )}
            {modelError && (
              <div className="flex items-center gap-2 p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modelError}</span>
              </div>
            )}

            {loadingModels ? (
              <div className="flex items-center justify-center p-6 text-xs text-muted-foreground gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                <span>Loading installed models...</span>
              </div>
            ) : installedModels.length === 0 ? (
              <div className="p-6 text-center rounded-xl border border-dashed border-border/60 bg-muted/10 space-y-2">
                <HardDrive className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
                <p className="text-xs font-medium text-muted-foreground">No installed models found.</p>
                <p className="text-[11px] text-muted-foreground/80">
                  Head over to the onboarding tab in chat to install your first recommended model.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {installedModels.map((model) => (
                  <div
                    key={model.name}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/40 bg-muted/20 hover:border-border/80 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tracking-tight">{model.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {formatSize(model.size)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        {model.details?.parameter_size && (
                          <span>Params: {model.details.parameter_size}</span>
                        )}
                        {model.details?.quantization_level && (
                          <span>Quant: {model.details.quantization_level}</span>
                        )}
                        {model.details?.format && (
                          <span>Format: {model.details.format}</span>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setModelToDelete(model)}
                      className="gap-2 text-xs font-medium text-destructive hover:text-destructive shrink-0 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Change Password (Skipped if Google-only user with no password) */}
        {user.has_password !== false && (
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-bold">Change Password</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Update your account password to keep your session secure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              {passwordSuccess && (
                <div className="flex items-center gap-2 p-3 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}
              {passwordError && (
                <div className="flex items-center gap-2 p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" /> Current Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={passwordSubmitting}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" /> New Password (min. 8 characters)
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={passwordSubmitting}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" /> Confirm New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={passwordSubmitting}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="sm"
                  className="gap-2 shadow-xs"
                  disabled={passwordSubmitting}
                >
                  {passwordSubmitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Section 3: Account Actions */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-lg font-bold">Account</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Manage your session and permanent account deletion.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {accountSuccess && (
              <div className="flex items-center gap-2 p-3 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{accountSuccess}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/40 bg-muted/20">
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold">Sign Out</h4>
                <p className="text-xs text-muted-foreground">
                  Log out of your current session on this device.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                className="gap-2 text-xs font-medium shrink-0"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/40 bg-muted/20">
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold">Clear Conversation History</h4>
                <p className="text-xs text-muted-foreground">
                  Delete all your chat conversations and message history.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearHistoryModal(true)}
                className="gap-2 text-xs font-medium text-destructive hover:text-destructive shrink-0"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear History</span>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-destructive/30 bg-destructive/5">
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-destructive">Delete Account</h4>
                <p className="text-xs text-muted-foreground">
                  Permanently remove your profile and cascade all your conversations and data.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className="gap-2 text-xs font-medium shrink-0"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Account</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clear History Confirmation Dialog */}
      {showClearHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 border border-destructive/20 shrink-0">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <h3 className="text-lg font-bold leading-tight">Clear All Conversations?</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete all your conversations? This action cannot be undone and will erase all stored message history for your account.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={clearHistorySubmitting}
                onClick={() => setShowClearHistoryModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={clearHistorySubmitting}
                onClick={handleConfirmClearHistory}
                className="gap-2 text-xs"
              >
                {clearHistorySubmitting ? (
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

      {/* Delete Model Confirmation Dialog */}
      {modelToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 border border-destructive/20 shrink-0">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-bold leading-tight">Delete Installed Model?</h3>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">{modelToDelete.name}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete <strong className="text-foreground font-semibold">{modelToDelete.name}</strong> ({formatSize(modelToDelete.size)})? This will permanently remove the model weights and binary files from Ollama's local storage disk.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={deletingModel}
                onClick={() => setModelToDelete(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={deletingModel}
                onClick={handleConfirmDeleteModel}
                className="gap-2 text-xs"
              >
                {deletingModel ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Model</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Dialog */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 border border-destructive/20 shrink-0">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <h3 className="text-lg font-bold leading-tight">Delete Account?</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete your account? This action cannot be undone. All your profile information, conversation history, and local AI messages will be deleted immediately.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={deleteSubmitting}
                onClick={() => setShowDeleteModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={deleteSubmitting}
                onClick={handleConfirmDeleteAccount}
                className="gap-2 text-xs"
              >
                {deleteSubmitting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete My Account</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
