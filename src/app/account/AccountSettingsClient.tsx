'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { Toggle } from '@/components/ui/Toggle'
import { cn } from '@/lib/utils'

interface User {
  id: string
  username: string
  displayName: string | null
  email: string | null
  image: string | null
  contactEmail: string
  contactEmailVerified: boolean
  emailNotifications: boolean
  discordNotifications: boolean
  marketingEmails: boolean
  platformAnnouncements: boolean
  notifySessionComplete: boolean
  notifySessionFailed: boolean
  createdAt: string
  lastLogin: string
}

interface AccountSettingsClientProps {
  user: User
  oauthEmail: string | null
}

interface SaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error'
  message?: string
}

/**
 * Client component for account settings with tabbed interface
 * Handles all user account management functionality
 */
export default function AccountSettingsClient({ 
  user: initialUser, 
  oauthEmail 
}: AccountSettingsClientProps) {
  const [activeTab, setActiveTab] = useState('profile')
  const [user, setUser] = useState<User>(initialUser)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ status: 'idle' })
  const [verificationSent, setVerificationSent] = useState(false)

  // Form state for profile settings
  const [profileData, setProfileData] = useState({
    displayName: user.displayName || '',
    contactEmail: user.contactEmail,
  })

  // Form state for notification settings
  const [notificationData, setNotificationData] = useState({
    emailNotifications: user.emailNotifications,
    discordNotifications: user.discordNotifications,
    marketingEmails: user.marketingEmails,
    platformAnnouncements: user.platformAnnouncements,
    notifySessionComplete: user.notifySessionComplete,
    notifySessionFailed: user.notifySessionFailed,
  })

  /**
   * Save profile settings
   */
  const handleSaveProfile = async () => {
    setSaveStatus({ status: 'saving' })
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save profile')
      }

      const updatedUser = await response.json()
      setUser(updatedUser)
      setSaveStatus({ status: 'saved', message: 'Profile updated successfully!' })
      
      // Clear success status after 3 seconds
      setTimeout(() => {
        setSaveStatus({ status: 'idle' })
      }, 3000)

    } catch (error) {
      console.error('Profile save error:', error)
      setSaveStatus({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Failed to save profile'
      })
      
      // Revert form data on error
      setProfileData({
        displayName: user.displayName || '',
        contactEmail: user.contactEmail,
      })
      
      // Clear error status after 5 seconds
      setTimeout(() => {
        setSaveStatus({ status: 'idle' })
      }, 5000)
    }
  }

  /**
   * Save notification settings
   */
  const handleSaveNotifications = async () => {
    setSaveStatus({ status: 'saving' })
    
    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save notifications')
      }

      const updatedUser = await response.json()
      setUser(updatedUser)
      setSaveStatus({ status: 'saved', message: 'Notification preferences saved!' })
      
      // Clear success status after 3 seconds
      setTimeout(() => {
        setSaveStatus({ status: 'idle' })
      }, 3000)

    } catch (error) {
      console.error('Notifications save error:', error)
      setSaveStatus({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Failed to save notifications'
      })
      
      // Clear error status after 5 seconds
      setTimeout(() => {
        setSaveStatus({ status: 'idle' })
      }, 5000)
    }
  }

  /**
   * Send email verification
   */
  const handleSendVerification = async () => {
    try {
      const response = await fetch('/api/user/verify-email', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to send verification email')
      }

      setVerificationSent(true)
      setSaveStatus({ 
        status: 'saved', 
        message: 'Verification email sent! Check your inbox.' 
      })

    } catch (error) {
      setSaveStatus({ 
        status: 'error', 
        message: 'Failed to send verification email' 
      })
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'data', label: 'Data', icon: '📊' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm">
        <div className="container">
          <div className="flex h-16 items-center justify-between">
            <nav className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <span className="font-display text-2xl text-primary-400">⚔️</span>
                <span className="font-display text-xl">Worldbuilder</span>
              </Link>
              <span className="text-text-muted">/</span>
              <Link href="/dashboard" className="text-text-secondary hover:text-primary-400">
                Dashboard
              </Link>
              <span className="text-text-muted">/</span>
              <span className="text-text-primary">Account Settings</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-4xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="heading-1 mb-2">Account Settings</h1>
          <p className="text-text-secondary">
            Manage your profile, notifications, and account preferences
          </p>
        </div>

        {/* Status Messages */}
        {saveStatus.status === 'saved' && (
          <Alert variant="success" className="mb-6 animate-fade-in">
            <AlertDescription>{saveStatus.message}</AlertDescription>
          </Alert>
        )}

        {saveStatus.status === 'error' && (
          <Alert variant="destructive" className="mb-6 animate-fade-in">
            <AlertDescription>{saveStatus.message}</AlertDescription>
          </Alert>
        )}

        {/* Email Verification Warning */}
        {!user.contactEmailVerified && (
          <Alert variant="warning" className="mb-6 animate-fade-in">
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong>Email verification required:</strong> Please verify your email address 
                  to upload session recordings.
                </div>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={handleSendVerification}
                  disabled={verificationSent}
                >
                  {verificationSent ? 'Sent!' : 'Send Verification'}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Tab Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors",
                    activeTab === tab.id
                      ? "bg-primary-600/20 text-primary-400 border border-primary-600/30"
                      : "hover:bg-surface-elevated text-text-secondary hover:text-text-primary"
                  )}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card className="animate-slide-up">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Display Name */}
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      placeholder="How you want to appear to other users"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData(prev => ({ 
                        ...prev, 
                        displayName: e.target.value 
                      }))}
                      disabled={saveStatus.status === 'saving'}
                    />
                    <p className="text-xs text-text-muted">
                      Leave blank to use your Discord username: {user.username}
                    </p>
                  </div>

                  {/* Contact Email */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="contactEmail">
                        Contact Email <span className="text-crimson">*</span>
                      </Label>
                      {user.contactEmailVerified ? (
                        <Badge variant="success">Verified</Badge>
                      ) : (
                        <Badge variant="warning">Unverified</Badge>
                      )}
                    </div>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="Email for platform notifications"
                      value={profileData.contactEmail}
                      onChange={(e) => setProfileData(prev => ({ 
                        ...prev, 
                        contactEmail: e.target.value 
                      }))}
                      disabled={saveStatus.status === 'saving'}
                      required
                    />
                    <p className="text-xs text-text-muted">
                      {oauthEmail && (
                        <>Discord email: {oauthEmail}<br /></>
                      )}
                      Required for session upload notifications. Changes require email verification.
                    </p>
                  </div>

                  {/* Account Info */}
                  <div className="pt-4 border-t border-border">
                    <h3 className="font-medium text-text-primary mb-3">Account Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-text-muted">Member since:</span>
                        <div className="text-text-secondary">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-text-muted">Last login:</span>
                        <div className="text-text-secondary">
                          {new Date(user.lastLogin).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={saveStatus.status === 'saving'}
                      variant="primary"
                    >
                      {saveStatus.status === 'saving' ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card className="animate-slide-up">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Master Email Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-text-secondary">
                        Receive notifications via email
                      </p>
                    </div>
                    <Toggle
                      checked={notificationData.emailNotifications}
                      onChange={(checked) => setNotificationData(prev => ({ 
                        ...prev, 
                        emailNotifications: checked 
                      }))}
                      disabled={saveStatus.status === 'saving'}
                      id="email-notifications"
                    />
                  </div>

                  {/* Discord Notifications */}
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <h4 className="font-medium">Discord Notifications</h4>
                      <p className="text-sm text-text-secondary">
                        Send notifications to your Discord DMs (coming soon)
                      </p>
                    </div>
                    <Toggle
                      checked={notificationData.discordNotifications}
                      onChange={(checked) => setNotificationData(prev => ({ 
                        ...prev, 
                        discordNotifications: checked 
                      }))}
                      disabled={true} // Disabled until implemented
                      id="discord-notifications"
                    />
                  </div>

                  {/* Session Notifications */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-text-primary">Session Processing</h3>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated">
                      <div className="flex-1">
                        <span className="text-sm font-medium">Session Complete</span>
                        <p className="text-xs text-text-muted">When your session processing finishes</p>
                      </div>
                      <Toggle
                        checked={notificationData.notifySessionComplete}
                        onChange={(checked) => setNotificationData(prev => ({ 
                          ...prev, 
                          notifySessionComplete: checked 
                        }))}
                        disabled={saveStatus.status === 'saving' || !notificationData.emailNotifications}
                        id="notify-session-complete"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated">
                      <div className="flex-1">
                        <span className="text-sm font-medium">Processing Failed</span>
                        <p className="text-xs text-text-muted">When session processing encounters errors</p>
                      </div>
                      <Toggle
                        checked={notificationData.notifySessionFailed}
                        onChange={(checked) => setNotificationData(prev => ({ 
                          ...prev, 
                          notifySessionFailed: checked 
                        }))}
                        disabled={saveStatus.status === 'saving' || !notificationData.emailNotifications}
                        id="notify-session-failed"
                      />
                    </div>
                  </div>

                  {/* Marketing Preferences */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-text-primary">Platform Communications</h3>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated">
                      <div className="flex-1">
                        <span className="text-sm font-medium">Platform Announcements</span>
                        <p className="text-xs text-text-muted">New features and important updates</p>
                      </div>
                      <Toggle
                        checked={notificationData.platformAnnouncements}
                        onChange={(checked) => setNotificationData(prev => ({ 
                          ...prev, 
                          platformAnnouncements: checked 
                        }))}
                        disabled={saveStatus.status === 'saving' || !notificationData.emailNotifications}
                        id="platform-announcements"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated">
                      <div className="flex-1">
                        <span className="text-sm font-medium">Marketing Emails</span>
                        <p className="text-xs text-text-muted">Tips, guides, and promotional content</p>
                      </div>
                      <Toggle
                        checked={notificationData.marketingEmails}
                        onChange={(checked) => setNotificationData(prev => ({ 
                          ...prev, 
                          marketingEmails: checked 
                        }))}
                        disabled={saveStatus.status === 'saving' || !notificationData.emailNotifications}
                        id="marketing-emails"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleSaveNotifications}
                      disabled={saveStatus.status === 'saving'}
                      variant="primary"
                    >
                      {saveStatus.status === 'saving' ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Saving...
                        </>
                      ) : (
                        'Save Preferences'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Privacy Tab (Placeholder) */}
            {activeTab === 'privacy' && (
              <Card className="animate-slide-up">
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🔒</div>
                    <h3 className="font-display text-xl mb-2">Privacy Controls</h3>
                    <p className="text-text-secondary mb-4">
                      Campaign visibility and data sharing settings coming soon
                    </p>
                    <Badge variant="warning">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Data Tab (Placeholder) */}
            {activeTab === 'data' && (
              <Card className="animate-slide-up">
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="font-display text-xl mb-2">Data Export & Deletion</h3>
                    <p className="text-text-secondary mb-4">
                      Download your data or delete your account
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button variant="secondary" disabled>
                        Export Data
                      </Button>
                      <Button variant="danger" disabled>
                        Delete Account
                      </Button>
                    </div>
                    <Badge variant="warning" className="mt-4">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}