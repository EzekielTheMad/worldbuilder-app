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

interface Campaign {
  id: string
  name: string
  playerCharacterMapping: Record<string, string>
  inviteCode: string | null
}

interface Player {
  id: string
  playerName: string
  characterName: string
  race: string
  characterClass: string
}

interface ManagePlayersClientProps {
  campaign: Campaign
  userId: string
}

interface SaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error'
  message?: string
}

/**
 * Client component for managing players
 * Handles player-character mapping CRUD operations
 */
export default function ManagePlayersClient({ 
  campaign: initialCampaign, 
  userId 
}: ManagePlayersClientProps) {
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign>(initialCampaign)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ status: 'idle' })
  const [players, setPlayers] = useState<Player[]>([])
  const [mounted, setMounted] = useState(false)
  const [newPlayer, setNewPlayer] = useState({
    playerName: '',
    characterName: '',
    race: '',
    characterClass: ''
  })

  // Handle hydration mismatch by only showing certain content after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Convert playerCharacterMapping to player array on mount
  useEffect(() => {
    const mapping = campaign.playerCharacterMapping || {}
    const playerArray = Object.entries(mapping).map(([playerName, characterInfo], index) => {
      // Parse character info - could be "Character Name" or "Character Name (Race Class)"
      const characterMatch = characterInfo.match(/^([^(]+)(?:\s*\(([^)]+)\))?/)
      const characterName = characterMatch?.[1]?.trim() || characterInfo
      const characterDetails = characterMatch?.[2]?.trim() || ''
      
      // Parse race and class from details
      const detailsParts = characterDetails.split(/\s+/)
      const race = detailsParts[0] || ''
      const characterClass = detailsParts.slice(1).join(' ') || ''
      
      return {
        id: `player-${index}`,
        playerName,
        characterName,
        race,
        characterClass
      }
    })
    setPlayers(playerArray)
  }, [campaign.playerCharacterMapping])

  /**
   * Add a new player to the list
   */
  const handleAddPlayer = () => {
    if (!newPlayer.playerName.trim() || !newPlayer.characterName.trim()) {
      setSaveStatus({ 
        status: 'error', 
        message: 'Player name and character name are required' 
      })
      return
    }

    // Check for duplicate player names
    if (players.some(p => p.playerName.toLowerCase() === newPlayer.playerName.toLowerCase().trim())) {
      setSaveStatus({ 
        status: 'error', 
        message: 'A player with this name already exists' 
      })
      return
    }

    const player: Player = {
      id: `player-${Date.now()}`,
      playerName: newPlayer.playerName.trim(),
      characterName: newPlayer.characterName.trim(),
      race: newPlayer.race.trim(),
      characterClass: newPlayer.characterClass.trim()
    }

    setPlayers([...players, player])
    setNewPlayer({
      playerName: '',
      characterName: '',
      race: '',
      characterClass: ''
    })
    setSaveStatus({ status: 'idle' })
  }

  /**
   * Remove a player from the list
   */
  const handleRemovePlayer = (playerId: string) => {
    setPlayers(players.filter(p => p.id !== playerId))
    setSaveStatus({ status: 'idle' })
  }

  /**
   * Update player information
   */
  const handleUpdatePlayer = (
    playerId: string, 
    field: keyof Player, 
    value: string
  ) => {
    setPlayers(players.map(player => 
      player.id === playerId ? { ...player, [field]: value } : player
    ))
  }

  /**
   * Save changes to the campaign
   */
  const handleSave = async () => {
    setSaveStatus({ status: 'saving' })

    try {
      // Convert players array back to mapping object
      const playerCharacterMapping = players.reduce((acc, player) => {
        if (player.playerName && player.characterName) {
          // Build character string with race/class if available
          let characterString = player.characterName
          if (player.race || player.characterClass) {
            const details = [player.race, player.characterClass].filter(Boolean).join(' ')
            if (details) {
              characterString += ` (${details})`
            }
          }
          acc[player.playerName] = characterString
        }
        return acc
      }, {} as Record<string, string>)

      // Only send playerCharacterMapping - don't include other fields
      const requestBody = { playerCharacterMapping }
      
      console.log('Sending request:', requestBody) // Debug log

      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText) // Debug log
        
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: `HTTP ${response.status}: ${errorText || 'Unknown error'}` }
        }
        
        // Show more detailed error message
        if (errorData.details && Array.isArray(errorData.details)) {
          const errorMessages = errorData.details.map((detail: any) => 
            `${detail.field}: ${detail.message}`
          ).join(', ')
          throw new Error(`Validation failed: ${errorMessages}`)
        }
        
        throw new Error(errorData.error || `Failed to save players (${response.status})`)
      }

      const updatedCampaign = await response.json()
      setCampaign(prev => ({ 
        ...prev, 
        playerCharacterMapping: updatedCampaign.playerCharacterMapping 
      }))
      setSaveStatus({ status: 'saved' })
      
      // Redirect after showing success
      setTimeout(() => {
        router.push(`/campaigns/${campaign.id}`)
      }, 1500)

    } catch (error) {
      console.error('Save error:', error)
      setSaveStatus({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Failed to save changes'
      })
    }
  }

  /**
   * Generate a new invite code
   */
  const handleGenerateInviteCode = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}/invite`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to generate invite code')
      }

      const { inviteCode } = await response.json()
      setCampaign(prev => ({ ...prev, inviteCode }))
      
    } catch (error) {
      setSaveStatus({ 
        status: 'error', 
        message: 'Failed to generate invite code' 
      })
    }
  }

  /**
   * Copy invite link to clipboard
   */
  const handleCopyInviteLink = async () => {
    if (!campaign.inviteCode) return
    
    const inviteLink = `${window.location.origin}/campaigns/join/${campaign.inviteCode}`
    
    try {
      await navigator.clipboard.writeText(inviteLink)
      setSaveStatus({ status: 'saved', message: 'Invite link copied!' })
      setTimeout(() => setSaveStatus({ status: 'idle' }), 2000)
    } catch (error) {
      setSaveStatus({ 
        status: 'error', 
        message: 'Failed to copy to clipboard' 
      })
    }
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
              <Link href={`/campaigns/${campaign.id}`} className="text-text-secondary hover:text-primary-400">
                {campaign.name}
              </Link>
              <span className="text-text-muted">/</span>
              <span className="text-text-primary">Manage Players</span>
            </nav>
            
            <div className="flex items-center gap-3">
              {/* Save Status Indicator */}
              {saveStatus.status !== 'idle' && (
                <div className="flex items-center gap-2 text-sm">
                  {saveStatus.status === 'saving' && (
                    <>
                      <Spinner size="sm" />
                      <span className="text-text-muted">Saving...</span>
                    </>
                  )}
                  {saveStatus.status === 'saved' && (
                    <>
                      <span className="text-emerald-400">✓</span>
                      <span className="text-emerald-400">
                        {saveStatus.message || 'Saved'}
                      </span>
                    </>
                  )}
                  {saveStatus.status === 'error' && (
                    <>
                      <span className="text-red-400">⚠</span>
                      <span className="text-red-400 max-w-[200px] truncate">
                        {saveStatus.message}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-4xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="heading-1 mb-2">Manage Players</h1>
          <p className="text-text-secondary">
            Add players and their characters for better AI transcription and summaries
          </p>
        </div>

        {/* Current Players */}
        <Card className="mb-6 animate-slide-up">
          <CardHeader>
            <CardTitle>Current Players ({players.length})</CardTitle>
            <CardDescription>
              Player-character mappings help the AI identify speakers and understand character actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {players.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="font-display text-xl mb-2">No players added yet</h3>
                <p className="text-text-secondary mb-4">
                  Add your first player below to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {players.map((player) => (
                  <div key={player.id} className="p-4 border border-border rounded-lg animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor={`player-name-${player.id}`} className="text-sm font-medium">
                          Player Name <span className="text-crimson">*</span>
                        </Label>
                        <Input
                          id={`player-name-${player.id}`}
                          value={player.playerName}
                          onChange={(e) => handleUpdatePlayer(player.id, 'playerName', e.target.value)}
                          disabled={saveStatus.status === 'saving'}
                          placeholder="Sarah, Mike, Alex..."
                        />
                      </div>
                      <div>
                        <Label htmlFor={`character-name-${player.id}`} className="text-sm font-medium">
                          Character Name <span className="text-crimson">*</span>
                        </Label>
                        <Input
                          id={`character-name-${player.id}`}
                          value={player.characterName}
                          onChange={(e) => handleUpdatePlayer(player.id, 'characterName', e.target.value)}
                          disabled={saveStatus.status === 'saving'}
                          placeholder="Thorin, Luna Starweaver..."
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor={`race-${player.id}`} className="text-sm font-medium">
                          Race
                        </Label>
                        <Input
                          id={`race-${player.id}`}
                          value={player.race}
                          onChange={(e) => handleUpdatePlayer(player.id, 'race', e.target.value)}
                          disabled={saveStatus.status === 'saving'}
                          placeholder="Elf, Dwarf, Human..."
                        />
                      </div>
                      <div>
                        <Label htmlFor={`class-${player.id}`} className="text-sm font-medium">
                          Class
                        </Label>
                        <Input
                          id={`class-${player.id}`}
                          value={player.characterClass}
                          onChange={(e) => handleUpdatePlayer(player.id, 'characterClass', e.target.value)}
                          disabled={saveStatus.status === 'saving'}
                          placeholder="Paladin, Fighter, Wizard..."
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePlayer(player.id)}
                        disabled={saveStatus.status === 'saving'}
                        className="text-red-400 hover:text-red-300"
                      >
                        <span className="mr-1">🗑️</span>
                        Remove Player
                      </Button>
                    </div>
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
            <CardDescription>
              Start with just player and character names - you can add details later
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="new-player-name" className="text-sm font-medium">
                  Player Name <span className="text-crimson">*</span>
                </Label>
                <Input
                  id="new-player-name"
                  placeholder="Real player name"
                  value={newPlayer.playerName}
                  onChange={(e) => setNewPlayer(prev => ({ ...prev, playerName: e.target.value }))}
                  disabled={saveStatus.status === 'saving'}
                />
              </div>
              <div>
                <Label htmlFor="new-character-name" className="text-sm font-medium">
                  Character Name <span className="text-crimson">*</span>
                </Label>
                <Input
                  id="new-character-name"
                  placeholder="In-game character name"
                  value={newPlayer.characterName}
                  onChange={(e) => setNewPlayer(prev => ({ ...prev, characterName: e.target.value }))}
                  disabled={saveStatus.status === 'saving'}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="new-race" className="text-sm font-medium">
                  Race <span className="text-text-muted">(Optional)</span>
                </Label>
                <Input
                  id="new-race"
                  placeholder="Elf, Dwarf, Human..."
                  value={newPlayer.race}
                  onChange={(e) => setNewPlayer(prev => ({ ...prev, race: e.target.value }))}
                  disabled={saveStatus.status === 'saving'}
                />
              </div>
              <div>
                <Label htmlFor="new-class" className="text-sm font-medium">
                  Class <span className="text-text-muted">(Optional)</span>
                </Label>
                <Input
                  id="new-class"
                  placeholder="Paladin, Fighter, Wizard..."
                  value={newPlayer.characterClass}
                  onChange={(e) => setNewPlayer(prev => ({ ...prev, characterClass: e.target.value }))}
                  disabled={saveStatus.status === 'saving'}
                />
              </div>
            </div>
            
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddPlayer}
              disabled={saveStatus.status === 'saving' || !newPlayer.playerName.trim() || !newPlayer.characterName.trim()}
              className="w-full"
            >
              <span className="mr-2">➕</span>
              Add Player
            </Button>
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
            {campaign.inviteCode ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Input
                    value={campaign.inviteCode}
                    readOnly
                    className="font-mono text-lg"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCopyInviteLink}
                    disabled={saveStatus.status === 'saving'}
                  >
                    📋 Copy Link
                  </Button>
                </div>
                <p className="text-sm text-text-muted">
                  Invite link: {mounted ? `${window.location.origin}/campaigns/join/${campaign.inviteCode}` : '/campaigns/join/[code]'}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateInviteCode}
                  disabled={saveStatus.status === 'saving'}
                >
                  🔄 Generate New Code
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="secondary"
                onClick={handleGenerateInviteCode}
                disabled={saveStatus.status === 'saving'}
              >
                Generate Invite Code
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end animate-slide-up animation-delay-300">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(`/campaigns/${campaign.id}`)}
            disabled={saveStatus.status === 'saving'}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            disabled={saveStatus.status === 'saving' || players.length === 0}
            magic
          >
            {saveStatus.status === 'saving' ? (
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