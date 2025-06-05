'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { api, ApiError } from '@/lib/api'

interface EditCampaignPageProps {
  params: {
    id: string
  }
}

/**
 * Campaign edit page - allows owners to modify campaign details
 */
export default function EditCampaignPage({ params }: EditCampaignPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    worldPrimer: '',
    settingNotes: '',
    isPublic: false,
  })

  // Fetch campaign data on mount
  useEffect(() => {
    fetchCampaign()
  }, [params.id])

  /**
   * Fetch existing campaign data
   */
  const fetchCampaign = async () => {
    try {
      const campaign = await api.campaigns.get(params.id)
      setFormData({
        name: campaign.name || '',
        description: campaign.description || '',
        worldPrimer: campaign.worldPrimer || '',
        settingNotes: campaign.settingNotes || '',
        isPublic: campaign.isPublic || false,
      })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to load campaign')
      }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsSubmitting(true)

    try {
      await api.campaigns.update(params.id, formData)
      setSuccess(true)
      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push(`/campaigns/${params.id}`)
      }, 1500)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Something went wrong')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Handle campaign deletion
   */
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return
    }

    setIsSubmitting(true)
    try {
      await api.campaigns.delete(params.id)
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to delete campaign')
      }
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

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
              <Link href={`/campaigns/${params.id}`} className="text-text-secondary hover:text-primary-400">
                {formData.name || 'Campaign'}
              </Link>
              <span className="text-text-muted">/</span>
              <span className="text-text-primary">Edit</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-4xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="heading-1 mb-2">Edit Campaign</h1>
          <p className="text-text-secondary">
            Update your campaign details and settings
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 animate-fade-in">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6 animate-fade-in">
            <AlertDescription>
              Campaign updated successfully! Redirecting...
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Core details about your campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Campaign Name <span className="text-crimson">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="The Lost Mines of Phandelver"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="A group of adventurers seeks fortune in the legendary Wave Echo Cave..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-text-muted">
                  Brief overview of your campaign (optional)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* World Building */}
          <Card className="animate-slide-up animation-delay-100">
            <CardHeader>
              <CardTitle>World Building</CardTitle>
              <CardDescription>
                Details about your campaign setting and world
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="worldPrimer">World Primer</Label>
                <Textarea
                  id="worldPrimer"
                  placeholder="In the world of Faerûn, magic is commonplace and gods walk among mortals..."
                  value={formData.worldPrimer}
                  onChange={(e) => setFormData(prev => ({ ...prev, worldPrimer: e.target.value }))}
                  rows={6}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-text-muted">
                  General information about your campaign world
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="settingNotes">Setting Notes</Label>
                <Textarea
                  id="settingNotes"
                  placeholder="House rules, custom lore, important NPCs..."
                  value={formData.settingNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, settingNotes: e.target.value }))}
                  rows={4}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-text-muted">
                  Additional notes for the AI to consider during transcription
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Settings */}
          <Card className="animate-slide-up animation-delay-200">
            <CardHeader>
              <CardTitle>Campaign Settings</CardTitle>
              <CardDescription>
                Privacy and sharing options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <h4 className="font-medium">Public Campaign</h4>
                    <p className="text-sm text-text-secondary">
                      Allow others to view this campaign
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                      disabled={isSubmitting}
                    />
                    <div className="w-11 h-6 bg-surface-elevated rounded-full peer peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="animate-slide-up animation-delay-300 border-crimson/20">
            <CardHeader>
              <CardTitle className="text-crimson">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions - proceed with caution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border border-crimson/20 bg-crimson/5">
                <div>
                  <h4 className="font-medium">Delete Campaign</h4>
                  <p className="text-sm text-text-secondary">
                    Permanently remove this campaign and all its sessions
                  </p>
                </div>
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  Delete Campaign
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end animate-slide-up animation-delay-400">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(`/campaigns/${params.id}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !formData.name}
              magic
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <span className="mr-2">💾</span>
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}