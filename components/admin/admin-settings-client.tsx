"use client"

// components/admin/admin-settings-client.tsx
// Client component for managing admin settings (profile, security, platform).

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { signOut } from "next-auth/react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

interface AdminSettingsClientProps {
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
  stats: {
    totalUsers: number
    totalCars: number
    totalDealers: number
    platformVersion: string
  }
}

export function AdminSettingsClient({ user, stats }: AdminSettingsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "account"

  // Profile State
  const [profileName, setProfileName] = useState(user.name)
  const [profileEmail, setProfileEmail] = useState(user.email)
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Security State
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  // Platform Toggles State (localStorage)
  const [showPioneerBadge, setShowPioneerBadge] = useState(true)
  const [enableAIFeatures, setEnableAIFeatures] = useState(true)

  useEffect(() => {
    // Load local storage preferences on mount
    const savedPioneer = localStorage.getItem("show_pioneer_badge")
    if (savedPioneer !== null) setShowPioneerBadge(savedPioneer === "true")

    const savedAI = localStorage.getItem("ai_features_enabled")
    if (savedAI !== null) setEnableAIFeatures(savedAI === "true")
  }, [])

  const handleTogglePioneerBadge = (checked: boolean) => {
    setShowPioneerBadge(checked)
    localStorage.setItem("show_pioneer_badge", String(checked))
    toast.success(`Pioneer badges are now ${checked ? "visible" : "hidden"}.`)
  }

  const handleToggleAIFeatures = (checked: boolean) => {
    setEnableAIFeatures(checked)
    localStorage.setItem("ai_features_enabled", String(checked))
    toast.success(`AI features are now ${checked ? "enabled" : "disabled"}.`)
  }

  const handleTabChange = (value: string) => {
    router.replace(`?tab=${value}`, { scroll: false })
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingProfile(true)
    try {
      const res = await fetch("/api/admin/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName, email: profileEmail }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        toast.error(data.error || "Failed to update profile")
        return
      }

      toast.success("Profile updated")
      router.refresh()

      if (profileEmail !== user.email) {
        toast.info("Email changed. Please log in again.")
        setTimeout(() => signOut({ callbackUrl: "/auth/login" }), 1500)
      }
    } catch (error: unknown) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters")
      return
    }

    setIsSavingPassword(true)
    try {
      const res = await fetch("/api/admin/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        toast.error(data.error || "Failed to change password")
        return
      }

      toast.success("Password changed. Please log in again.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => signOut({ callbackUrl: "/auth/login" }), 1500)
    } catch (error: unknown) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="platform">Platform</TabsTrigger>
      </TabsList>

      {/* ACCOUNT TAB */}
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>
              Update your administrative profile information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-xl font-medium border">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt={user.name} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">Profile Photo</p>
                  <p className="text-xs text-muted-foreground">
                    // TODO: Cloudinary avatar upload
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Changing your email will require you to log in again.
                </p>
              </div>

              <Button type="submit" disabled={isSavingProfile}>
                {isSavingProfile ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* SECURITY TAB */}
      <TabsContent value="security">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your account password securely.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" disabled={isSavingPassword}>
                  {isSavingPassword ? "Changing Password..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-muted/50 bg-muted/20">
            <CardHeader>
              <CardTitle className="text-muted-foreground text-sm font-medium">Account Deletion</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Admin accounts cannot be self-deleted for platform integrity.
                Contact the system administrator to remove this account.
              </p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* PLATFORM TAB */}
      <TabsContent value="platform">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Statistics</CardTitle>
              <CardDescription>
                Overview of platform data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-1">Total Cars</p>
                  <p className="text-2xl font-bold">{stats.totalCars}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-1">Total Dealers</p>
                  <p className="text-2xl font-bold">{stats.totalDealers}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-1">Version</p>
                  <p className="text-lg font-medium mt-1">{stats.platformVersion}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Configurations</CardTitle>
              <CardDescription>
                These settings apply to your browser session.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Pioneer Badge</Label>
                  <p className="text-sm text-muted-foreground">
                    Display the pioneer badge on dealer cards and listings.
                  </p>
                </div>
                <Switch
                  checked={showPioneerBadge}
                  onCheckedChange={handleTogglePioneerBadge}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable AI Features</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable AI-driven verification and writing tools.
                  </p>
                </div>
                <Switch
                  checked={enableAIFeatures}
                  onCheckedChange={handleToggleAIFeatures}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}
