'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'

/**
 * Campaign creation form page
 * Allows users to create new campaigns with all settings
 */
export default function NewCampaignPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    setting: 'FANTASY_5E',
    players: [{ name: '', character: '' }],
  })

  /**
   * Add a new player/character slot
   */
  const addPlayer = () => {
    setFormData(prev => ({
      ...prev,
      players: [...prev.players, { name: '', character: '' }]
    }))
  }

  /**
   * Remove a player/character slot
   */
  const removePlayer = (index: number) => {
    setFormData(prev => ({
      ...prev,
      players: prev.players.filter((_, i) => i !== index)
    }))
  }

  /**
   * Update player/character data
   */
  const updatePlayer = (index: number, field: 'name' | 'character', value: string) => {
    setFormData(prev => ({
      ...prev,
      players: prev.players.map((player, i) => 
        i === index ? { ...player, [field]: value } : player
      )
    }))
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          players: formData.players.filter(p => p.name || p.character)
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create campaign')
      }

      const campaign = await response.json()
      router.push(`/campaigns/${campaign.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm">
        <div className="container">
          <div className="flex h-16 items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="font-display text-2xl text-primary-400">⚔️</span>
              <span className="font-display text-xl">Worldbuilder</span>
            </Link>
            
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-4xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="heading-1 mb-2">Create New Campaign</h1>
          <p className="text-text-secondary">
            Set up your campaign details and add your players
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 animate-fade-in">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Give your campaign a name and description
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
                  className="magic-sparkle"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="setting">Campaign Setting</Label>
                <Select
                  id="setting"
                  value={formData.setting}
                  onChange={(e) => setFormData(prev => ({ ...prev, setting: e.target.value }))}
                >
                  <option value="FANTASY_5E">D&D 5th Edition</option>
                  <option value="PATHFINDER">Pathfinder</option>
                  <option value="CYBERPUNK">Cyberpunk</option>
                  <option value="CUSTOM">Custom Setting</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="A group of adventurers seeks fortune in the legendary Wave Echo Cave..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Players and Characters */}
          <Card className="animate-slide-up animation-delay-100">
            <CardHeader>
              <CardTitle>Players & Characters</CardTitle>
              <CardDescription>
                Add your players and their character names for better transcription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.players.map((player, index) => (
                  <div key={index} className="flex gap-4 items-start animate-fade-in">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`player-${index}`}>
                        Player Name
                      </Label>
                      <Input
                        id={`player-${index}`}
                        placeholder="Victor"
                        value={player.name}
                        onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`character-${index}`}>
                        Character Name
                      </Label>
                      <Input
                        id={`character-${index}`}
                        placeholder="Voltee the Paladin"
                        value={player.character}
                        onChange={(e) => updatePlayer(index, 'character', e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePlayer(index)}
                      className="mt-8"
                      disabled={formData.players.length === 1}
                    >
                      ❌
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="secondary"
                  onClick={addPlayer}
                  className="w-full"
                >
                  <span className="mr-2">➕</span>
                  Add Another Player
                </Button>
              </div>

              <Alert className="mt-4">
                <AlertDescription>
                  <strong>Tip:</strong> Adding player and character names helps our AI 
                  accurately identify speakers during transcription.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card className="animate-slide-up animation-delay-200">
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Optional settings for your campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <h4 className="font-medium">Discord Integration</h4>
                    <p className="text-sm text-text-secondary">
                      Post session summaries to Discord
                    </p>
                  </div>
                  <Badge variant="warning">Coming Soon</Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <h4 className="font-medium">Multi-DM Support</h4>
                    <p className="text-sm text-text-secondary">
                      Allow multiple DMs for this campaign
                    </p>
                  </div>
                  <Badge variant="warning">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end animate-slide-up animation-delay-300">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/dashboard')}
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
                  Creating Campaign...
                </>
              ) : (
                <>
                  <span className="mr-2">✨</span>
                  Create Campaign
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}