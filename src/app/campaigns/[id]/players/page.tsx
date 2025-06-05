'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { api, ApiError } from '@/lib/api'

interface ManagePlayersPageProps {
  params: {
    id: string
  }
}

interface PlayerMapping {
  [playerName: string]: string
}

/**
 * Manage players page - allows campaign owners to manage player-character mappings
 */
export default function ManagePlayersPage({ params }: ManagePlayersPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [campaignName, setCampaignName] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  // Player/character state
  const [players, setPlayers] = useState<Array<{ name: string; character: string }>>([])
  const [newPlayer, setNewPlayer] = useState({ name: '', character: '' })

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
      setCampaignName(campaign.name)
      setInviteCode(campaign.inviteCode || '')
      
      // Convert playerCharacterMapping to array format
      const mapping = campaign.playerCharacterMapping as PlayerMapping || {}
      const playerArray = Object.entries(mapping).map(([name, character]) => ({
        name,
        character
      }))
      setPlayers(playerArray)
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
   * Add a new player
   */
  const handleAddPlayer = () => {
    if (!newPlayer.name || !newPlayer.character) {
      setError('Both player name and character name are required')
      return
    }

    // Check for duplicate player names
    if (players.some(p => p.name.toLowerCase() === newPlayer.name.toLowerCase())) {
      setError('A player with this name already exists')
      return
    }

    setPlayers([...players, newPlayer])
    setNewPlayer({ name: '', character: '' })
    setError(null)
  }

  /**
   * Remove a player
   */
  const handleRemovePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index))
  }

  /**
   * Update a player's information
   */
  const handleUpdatePlayer = (index: number, field: 'name' | 'character', value: string) => {
    setPlayers(players.map((player, i) => 
      i === index ? { ...player, [field]: value } : player
    ))
  }

  /**
   * Save changes to the campaign
   */
  const handleSave = async () => {
    setError(null)
    setSuccess(false)
    setIsSubmitting(true)

    // Convert array back to mapping object
    const playerCharacterMapping = players.reduce((acc, player) => {
      if (player.name && player.character) {
        acc[player.name] = player.character
      }
      return acc
    }, {} as PlayerMapping)

    try {
      await api.campaigns.update(params.id, { playerCharacterMapping })
      setSuccess(true)
      // Redirect after showing success
      setTimeout(() => {
        router.push(`/campaigns/${params.id}`)
      }, 1500)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Something went wrong')
      }
      setIsSubmitting(false)
    }
  }

  /**
   * Generate a new invite code
   */
  const handleGenerateInviteCode = async () => {
    try {
      const { inviteCode } = await api.campaigns.generateInviteCode(params.id)
      setInviteCode(inviteCode)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to generate invite code')
      }
    }
  }

  /**
   * Copy invite link to clipboard
   */
  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/campaigns/join/${inviteCode}`
    navigator.clipboard.writeText(inviteLink)
    // You could add a toast notification here
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
                {campaignName || 'Campaign'}
              </Link>
              <span className="text-text-muted">/</span>
              <span className="text-text-primary">Manage Players</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-4xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="heading-1 mb-2">Manage Players</h1>
          <p className="text-text-secondary">
            Add players and their characters for better AI transcription
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
              Players updated successfully! Redirecting...
            </AlertDescription>
          </Alert>
        )}

        {/* Current Players */}
        <Card className="mb-6 animate-slide-up">
          <CardHeader>
            <CardTitle>Current Players</CardTitle>
            <CardDescription>
              These player-character mappings help the AI identify speakers during transcription
            </CardDescription>
          </CardHeader>
          <CardContent>
            {players.length === 0 ? (
              <p className="text-text-muted text-center py-4">
                No players added yet. Add your first player below.
              </p>
            ) : (
              <div className="space-y-3">
                {players.map((player, index) => (
                  <div key={index} className="flex gap-3 items-end animate-fade-in">
                    <div className="flex-1">
                      <Label htmlFor={`player-${index}`} className="text-xs">
                        Player Name
                      </Label>
                      <Input
                        id={`player-${index}`}
                        value={player.name}
                        onChange={(e) => handleUpdatePlayer(index, 'name', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`character-${index}`} className="text-xs">
                        Character Name
                      </Label>
                      <Input
                        id={`character-${index}`}
                        value={player.character}
                        onChange={(e) => handleUpdatePlayer(index, 'character', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePlayer(index)}
                      disabled={isSubmitting}
                      className="shrink-0"
                    >
                      ❌
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add New Player */}
        <Card className="mb-6 animate-slide-up animation-delay-100">
          <CardHeader>
            <CardTitle>Add New Player</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Label htmlFor="new-player-name">Player Name</Label>
                <Input
                  id="new-player-name"
                  placeholder="Victor"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="new-player-character">Character Name</Label>
                <Input
                  id="new-player-character"
                  placeholder="Voltee the Paladin"
                  value={newPlayer.character}
                  onChange={(e) => setNewPlayer(prev => ({ ...prev, character: e.target.value }))}
                  disabled={isSubmitting}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddPlayer}
                disabled={isSubmitting || !newPlayer.name || !newPlayer.character}
                className="shrink-0"
              >
                <span className="mr-2">➕</span>
                Add Player
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Invite Players */}
        <Card className="mb-6 animate-slide-up animation-delay-200">
          <CardHeader>
            <CardTitle>Invite Players</CardTitle>
            <CardDescription>
              Share this code or link with players to invite them to the campaign
            </CardDescription>
          </CardHeader>
          <CardContent>
            {inviteCode ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Input
                    value={inviteCode}
                    readOnly
                    className="font-mono text-lg"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCopyInviteLink}
                  >
                    📋 Copy Link
                  </Button>
                </div>
                <p className="text-sm text-text-muted">
                  Invite link: {window.location.origin}/campaigns/join/{inviteCode}
                </p>
              </div>
            ) : (
              <Button
                type="button"
                variant="secondary"
                onClick={handleGenerateInviteCode}
                disabled={isSubmitting}
              >
                Generate Invite Code
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end animate-slide-up animation-delay-300">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(`/campaigns/${params.id}`)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            disabled={isSubmitting || players.length === 0}
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
                Save Players
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  )
}