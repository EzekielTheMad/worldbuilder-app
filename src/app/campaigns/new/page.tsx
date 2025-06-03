/**
 * Campaign Creation Page
 * 
 * Allows users to create new D&D campaigns with basic information
 * and player-character mapping. All fields except name are optional.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/AuthButton'
import Link from 'next/link'

interface PlayerCharacterMapping {
  id: string
  playerName: string
  characterName: string
}

/**
 * Campaign creation form component
 * Handles campaign name, description, primer, and player-character mapping
 */
export default function NewCampaignPage() {
  const router = useRouter()
  
  // Form state
  const [campaignName, setCampaignName] = useState('')
  const [description, setDescription] = useState('')
  const [worldPrimer, setWorldPrimer] = useState('')
  const [settingNotes, setSettingNotes] = useState('')
  
  // Player-character mapping state (start with 5 slots)
  const [playerMappings, setPlayerMappings] = useState<PlayerCharacterMapping[]>([
    { id: '1', playerName: '', characterName: '' },
    { id: '2', playerName: '', characterName: '' },
    { id: '3', playerName: '', characterName: '' },
    { id: '4', playerName: '', characterName: '' },
    { id: '5', playerName: '', characterName: '' },
  ])
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  /**
   * Add a new player-character mapping slot (max 15)
   */
  const addPlayerSlot = () => {
    if (playerMappings.length < 15) {
      const newId = (playerMappings.length + 1).toString()
      setPlayerMappings([
        ...playerMappings,
        { id: newId, playerName: '', characterName: '' }
      ])
    }
  }

  /**
   * Remove a player-character mapping slot (min 1)
   */
  const removePlayerSlot = (id: string) => {
    if (playerMappings.length > 1) {
      setPlayerMappings(playerMappings.filter(mapping => mapping.id !== id))
    }
  }

  /**
   * Update a specific player-character mapping
   */
  const updatePlayerMapping = (id: string, field: 'playerName' | 'characterName', value: string) => {
    setPlayerMappings(playerMappings.map(mapping => 
      mapping.id === id 
        ? { ...mapping, [field]: value }
        : mapping
    ))
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Validate required fields
    if (!campaignName.trim()) {
      setError('Campaign name is required')
      setIsSubmitting(false)
      return
    }

    try {
      // Create player-character mapping object (only include non-empty mappings)
      const playerCharacterMapping: Record<string, string> = {}
      playerMappings.forEach(({ playerName, characterName }) => {
        if (playerName.trim() && characterName.trim()) {
          playerCharacterMapping[playerName.trim()] = characterName.trim()
        }
      })

      // Prepare campaign data
      const campaignData = {
        name: campaignName.trim(),
        description: description.trim() || null,
        worldPrimer: worldPrimer.trim() || '',
        settingNotes: settingNotes.trim() || null,
        playerCharacterMapping,
        isPublic: false // Default to private
      }

      // Submit to API
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to create campaign')
      }

      const { campaign } = await response.json()
      
      // Redirect to the new campaign or dashboard
      router.push(`/campaigns/${campaign.id}`)
      
    } catch (err) {
      console.error('Error creating campaign:', err)
      setError(err instanceof Error ? err.message : 'Failed to create campaign')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-dark">
        {/* Header */}
        <header className="glass-card border-0 fantasy-border">
          <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="text-secondary hover:text-accent-primary transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gradient">Create New Campaign</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="glass-card rounded-lg">
            <div className="p-6 sm:p-8">
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 status-error rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gradient">Basic Information</h2>
                  
                  {/* Campaign Name - Required */}
                  <div className="mb-6">
                    <label htmlFor="campaignName" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Campaign Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="campaignName"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      className="w-full px-3 py-2 input-field rounded-lg"
                      placeholder="Enter campaign name (e.g., Curse of Strahd, Shades of Magic)"
                      required
                    />
                  </div>

                  {/* Description - Optional */}
                  <div className="mb-6">
                    <label htmlFor="description" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Description <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
                    </label>
                    <input
                      type="text"
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 input-field rounded-lg"
                      placeholder="Brief description of your campaign"
                    />
                  </div>
                </div>

                {/* World & Setting */}
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gradient">World & Setting</h2>
                  
                  {/* World Primer - Optional */}
                  <div className="mb-6">
                    <label htmlFor="worldPrimer" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      World Primer <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
                    </label>
                    <textarea
                      id="worldPrimer"
                      value={worldPrimer}
                      onChange={(e) => setWorldPrimer(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 input-field rounded-lg"
                      placeholder="Describe your campaign world, setting, tone, and key themes. This helps the AI understand your campaign's style when generating summaries."
                    />
                  </div>

                  {/* Setting Notes - Optional */}
                  <div className="mb-6">
                    <label htmlFor="settingNotes" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Setting Notes <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
                    </label>
                    <textarea
                      id="settingNotes"
                      value={settingNotes}
                      onChange={(e) => setSettingNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 input-field rounded-lg"
                      placeholder="Additional notes about rules, house rules, or special campaign elements."
                    />
                  </div>
                </div>

                {/* Player-Character Mapping */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gradient">
                      Player-Character Mapping <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
                    </h2>
                    <button
                      type="button"
                      onClick={addPlayerSlot}
                      disabled={playerMappings.length >= 15}
                      className="btn-secondary inline-flex items-center gap-1 px-3 py-1 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Player
                    </button>
                  </div>
                  
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Map your players to their character names. This helps the AI identify who did what in session summaries.
                  </p>

                  <div className="space-y-3">
                    {playerMappings.map((mapping, index) => (
                      <div key={mapping.id} className="flex items-center gap-3">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={mapping.playerName}
                            onChange={(e) => updatePlayerMapping(mapping.id, 'playerName', e.target.value)}
                            className="px-3 py-2 input-field rounded-lg"
                            placeholder={`Player ${index + 1} name`}
                          />
                          <input
                            type="text"
                            value={mapping.characterName}
                            onChange={(e) => updatePlayerMapping(mapping.id, 'characterName', e.target.value)}
                            className="px-3 py-2 input-field rounded-lg"
                            placeholder="Character name"
                          />
                        </div>
                        
                        {playerMappings.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePlayerSlot(mapping.id)}
                            className="p-2 text-muted hover:text-red-400 transition-colors duration-200"
                            title="Remove player slot"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {playerMappings.length >= 15 && (
                    <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                      Maximum of 15 player slots reached.
                    </p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-6 fantasy-border">
                  <Link
                    href="/dashboard"
                    className="btn-secondary px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </Link>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || !campaignName.trim()}
                    className="btn-primary px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 loading-spinner rounded-full" />
                        Creating...
                      </>
                    ) : (
                      'Create Campaign'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}