"use client"

// components/dashboard/dealer-settings-client.tsx
// Client component for managing dealer settings (profile, business, security).

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DealerSettingsClientProps {
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
  dealer: {
    id: string
    businessName: string
    phoneNumber: string
    location: string
    description: string
    isVerified: boolean
    isPioneer: boolean
  }
}

export function DealerSettingsClient({ user, dealer }: DealerSettingsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "profile"

  // Profile State
  const [profileName, setProfileName] = useState(user.name)
  const [profileEmail, setProfileEmail] = useState(user.email)
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Business State
  const [businessName, setBusinessName] = useState(dealer.businessName)
  const [phoneNumber, setPhoneNumber] = useState(dealer.phoneNumber)
  const [location, setLocation] = useState(dealer.location)
  const [description, setDescription] = useState(dealer.description)
  const [isSavingBusiness, setIsSavingBusiness] = useState(false)

  // Security State
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  // Danger Zone State
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const handleTabChange = (value: string) => {
    router.replace(`?tab=${value}`, { scroll: false })
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingProfile(true)
    try {
      const res = await fetch("/api/dealer/settings/profile", {
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

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingBusiness(true)
    try {
      const res = await fetch("/api/dealer/settings/business", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, phoneNumber, location, description }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        toast.error(data.error || "Failed to update business profile")
        return
      }

      toast.success("Business profile updated")
      router.refresh()
    } catch (error: unknown) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSavingBusiness(false)
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
      const res = await fetch("/api/dealer/settings/password", {
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

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return
    
    setIsDeleting(true)
    try {
      const res = await fetch("/api/dealer/settings/account", {
        method: "DELETE",
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        toast.error(data.error || "Failed to delete account")
        setIsDeleting(false)
        return
      }

      toast.success("Account deleted successfully")
      setTimeout(() => signOut({ callbackUrl: "/" }), 1000)
    } catch (error: unknown) {
      toast.error("An unexpected error occurred")
      setIsDeleting(false)
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="business">Business</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      {/* PROFILE TAB */}
      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>
              Update your personal account information.
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

      {/* BUSINESS TAB */}
      <TabsContent value="business">
        <Card>
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
            <CardDescription>
              Manage how your dealership appears to buyers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveBusiness} className="space-y-4">
              <div className="flex items-center gap-2 mb-4 p-3 bg-muted/50 rounded-lg border">
                <div className="text-sm flex-1">
                  <p className="font-medium">Verification Status</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    To update your verification status, contact the AIM team via Messages.
                  </p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  {dealer.isVerified ? (
                    <Badge className="bg-green-600 hover:bg-green-700">Verified Dealer</Badge>
                  ) : (
                    <Badge variant="secondary">Unverified</Badge>
                  )}
                  {dealer.isPioneer && (
                    <Badge variant="outline" className="text-amber-600 border-amber-600">Pioneer</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your dealership name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0712 345 678"
                />
                <p className="text-xs text-muted-foreground">
                  Used for buyer enquiries. E.g. 0712 345 678
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location / Yard Address</Label>
                <Textarea
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="E.g. Ganjoni, near Shell petrol station, Mombasa"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">About Your Dealership</Label>
                  <span className="text-xs text-muted-foreground">{description.length}/500</span>
                </div>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                  placeholder="Tell buyers about your dealership..."
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={isSavingBusiness}>
                {isSavingBusiness ? "Saving..." : "Save Business Profile"}
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

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Permanently remove your account and all associated data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 text-red-900 p-3 rounded-md text-sm border border-red-100">
                This will permanently delete your account, your dealer profile, and all your vehicle listings.
                Type <strong>DELETE</strong> to confirm.
              </div>
              
              <div className="space-y-2">
                <Input
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="border-red-200 focus-visible:ring-red-500"
                />
              </div>

              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== "DELETE" || isDeleting}
              >
                {isDeleting ? "Deleting Account..." : "Delete My Account"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}
