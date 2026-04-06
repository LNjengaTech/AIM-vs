/**
 * app/admin/settings/page.tsx
 * Admin settings page for platform-wide configuration.
 * Currently a placeholder for future implementation.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Settings } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground">Manage system-wide configurations and preferences</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Coming Soon</CardTitle>
          </div>
          <CardDescription>
            System configuration options will appear here in the next update.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Planned settings include:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>Notification templates and triggers</li>
              <li>Marketplace commission rules</li>
              <li>AI verification sensitivity levels</li>
              <li>API third-party integrations (Cloudinary, WhatsApp)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
