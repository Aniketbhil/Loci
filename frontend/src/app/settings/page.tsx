"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { changePasswordApi } from "@/lib/api";
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
  const [accountError, setAccountError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      setName(user.name || "");
    }
  }, [authLoading, user, router]);

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
