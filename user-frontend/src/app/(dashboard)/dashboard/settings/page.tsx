'use client'
import { useState } from 'react'
import { useDashboard } from '@/components/dashboard/DashboardProvider'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Shield,
  TriangleAlert,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react'

function FormField({
  id,
  label,
  type = 'text',
  defaultValue = '',
  placeholder,
  hint,
}: {
  id: string
  label: string
  type?: string
  defaultValue?: string
  placeholder?: string
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="bg-background border-border h-10 transition-all duration-150 focus:border-primary"
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function PasswordField({ id, label, placeholder }: { id: string; label: string; placeholder?: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          className="bg-background border-border h-10 pr-10 transition-all duration-150 focus:border-primary"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150"
          onClick={() => setShow((v) => !v)}
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { user } = useDashboard()
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800)) // Simulated delay
    setSaving(false)
  }

  if (!user) return null

  return (
    <div className="space-y-6 max-w-2xl animate-fade-up">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account, security, and preferences.
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="bg-muted border border-border h-10 p-1">
          <TabsTrigger
            value="account"
            className="gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all duration-150"
          >
            <User className="h-3.5 w-3.5" />
            Account
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all duration-150"
          >
            <Shield className="h-3.5 w-3.5" />
            Security
          </TabsTrigger>
          <TabsTrigger
            value="danger"
            className="gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all duration-150"
          >
            <TriangleAlert className="h-3.5 w-3.5" />
            Danger Zone
          </TabsTrigger>
        </TabsList>

        {/* ── Account Tab ── */}
        <TabsContent value="account">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle className="text-sm font-semibold text-foreground">Account Information</CardTitle>
              <CardDescription className="text-xs">
                Update your username and email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <FormField
                id="username"
                label="Username"
                defaultValue={user.username}
                placeholder="johndoe"
                hint="Your public-facing handle used across profiles."
              />
              <FormField
                id="email"
                label="Email Address"
                type="email"
                defaultValue={user.email}
                placeholder="you@example.com"
              />
              <Separator className="my-4" />
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="gap-2 bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all duration-150"
                >
                  {saving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Security Tab ── */}
        <TabsContent value="security">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle className="text-sm font-semibold text-foreground">Change Password</CardTitle>
              <CardDescription className="text-xs">
                For your security, choose a strong, unique password.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <PasswordField id="current-password" label="Current Password" placeholder="Enter current password" />
              <PasswordField id="new-password" label="New Password" placeholder="Min. 8 characters" />
              <PasswordField id="confirm-password" label="Confirm New Password" placeholder="Repeat new password" />
              <Separator className="my-4" />
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="gap-2 bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all duration-150"
                >
                  {saving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Danger Zone Tab ── */}
        <TabsContent value="danger">
          <Card className="bg-card border-destructive/40 shadow-sm">
            <CardHeader className="pb-4 border-b border-destructive/20">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-destructive/10 p-1.5">
                  <TriangleAlert className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">Danger Zone</CardTitle>
                  <CardDescription className="text-xs">
                    These actions are permanent and cannot be undone.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Delete Account</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    Permanently delete your account and all associated profiles, links, and analytics data. This cannot be reversed.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  className="shrink-0 bg-destructive/90 hover:bg-destructive transition-all duration-150"
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
