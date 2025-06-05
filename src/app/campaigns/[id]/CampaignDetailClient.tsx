'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'

interface Campaign {
  id: string
  name: string
  description: string | null
  worldPrimer: string
  settingNotes: string | null
  headerImagePath: string | null
  isPublic: boolean
  createdAt: string
  playerCharacterMapping: Record<string, string>
  inviteCode: string | null
  owner: {
    id: string
    username: string | null
    image: string | null
  }
  sessions: Array<{
    id: string
    title: string | null
    createdAt: string
    status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
    summaryJson: any
    notes: string | null
  }>
  _count: {
    sessions: number
    members: number
  }
}

interface EditableData {
  name: string
  description: string
  genre: string
  tone: string
  settingOverview: string
  magicTechnology: string
  factions: string
  locations: string
  sessionTags: string
  campaignNotes: string
  playerCharacterMapping: Record<string, string>
}

interface SaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error'
  message?: string
}

interface CampaignDetailClientProps {
  campaign: Campaign
  isOwner: boolean
  userId: string
}

/**
 * Client component for campaign detail page with inline editing
 * Handles all interactive functionality and auto-save
 */
export default function CampaignDetailClient({ 
  campaign: initialCampaign, 
  isOwner, 
  userId 
}: CampaignDetailClientProps) {
  // State management
  const [campaign, setCampaign] = useState<Campaign>(initialCampaign)
  const [isEditing, setIsEditing] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ status: 'idle' })
  const [sortField, setSortField] = useState<'player' | 'character'>('player')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [imageUploadStatus, setImageUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  
  // Parse world primer back into individual fields for editing
  const parseWorldPrimer = (worldPrimer: string) => {
    const sections = {
      genre: '',
      tone: '',
      settingOverview: '',
      magicTechnology: '',
      factions: '',
      locations: '',
      sessionTags: '',
      campaignNotes: '',
    }

    if (!worldPrimer) return sections

    // Simple parsing - extract content between section headers
    const extractSection = (header: string) => {
      const regex = new RegExp(`## ${header}\\n\\n([\\s\\S]*?)(?=\\n## |$)`)
      const match = worldPrimer.match(regex)
      return match ? match[1].trim() : ''
    }

    sections.settingOverview = extractSection('Setting Overview')
    sections.magicTechnology = extractSection('Magic & Technology')
    sections.factions = extractSection('Known Factions')
    sections.locations = extractSection('Key Locations')
    sections.sessionTags = extractSection('Session Tags')
    sections.campaignNotes = extractSection('Additional Notes')

    // Extract genre and tone from combined field
    const toneGenre = extractSection('Tone & Genre')
    if (toneGenre) {
      const parts = toneGenre.split(',').map(s => s.trim())
      sections.genre = parts[0] || ''
      sections.tone = parts[1] || ''
    }

    return sections
  }

  const [editData, setEditData] = useState<EditableData>(() => {
    const parsedFields = parseWorldPrimer(initialCampaign.worldPrimer || '')
    return {
      name: initialCampaign.name || '',
      description: initialCampaign.description || '',
      genre: parsedFields.genre,
      tone: parsedFields.tone,
      settingOverview: parsedFields.settingOverview,
      magicTechnology: parsedFields.magicTechnology,
      factions: parsedFields.factions,
      locations: parsedFields.locations,
      sessionTags: parsedFields.sessionTags,
      campaignNotes: parsedFields.campaignNotes,
      playerCharacterMapping: initialCampaign.playerCharacterMapping || {}
    }
  })

  // Update edit data when campaign changes
  useEffect(() => {
    const parsedFields = parseWorldPrimer(campaign.worldPrimer || '')
    setEditData({
      name: campaign.name || '',
      description: campaign.description || '',
      genre: parsedFields.genre,
      tone: parsedFields.tone,
      settingOverview: parsedFields.settingOverview,
      magicTechnology: parsedFields.magicTechnology,
      factions: parsedFields.factions,
      locations: parsedFields.locations,
      sessionTags: parsedFields.sessionTags,
      campaignNotes: parsedFields.campaignNotes,
      playerCharacterMapping: campaign.playerCharacterMapping || {}
    })
  }, [campaign])

  /**
   * Build the world primer from all inputs (matching creation flow)
   */
  const buildWorldPrimer = (data: EditableData) => {
    const sections = []
    
    // Add header
    sections.push(`# Campaign Primer: ${data.name || '[Campaign Name]'}\n`)
    
    // Only add sections with content
    if (data.tone || data.genre) {
      sections.push(`## Tone & Genre\n\n${[data.genre, data.tone].filter(Boolean).join(', ')}`)
    }
    
    if (data.settingOverview) {
      sections.push(`## Setting Overview\n\n${data.settingOverview}`)
    }
    
    if (data.magicTechnology) {
      sections.push(`## Magic & Technology\n\n${data.magicTechnology}`)
    }
    
    if (data.factions) {
      sections.push(`## Known Factions\n\n${data.factions}`)
    }
    
    if (data.locations) {
      sections.push(`## Key Locations\n\n${data.locations}`)
    }
    
    if (data.sessionTags) {
      sections.push(`## Session Tags\n\n${data.sessionTags}`)
    }
    
    const playersWithNames = Object.entries(data.playerCharacterMapping).filter(([player, character]) => player && character)
    if (playersWithNames.length > 0) {
      const playerSection = playersWithNames
        .map(([player, character]) => `* **${player}** → *${character}*`)
        .join('\n')
      sections.push(`## Player-Character Mapping\n\n${playerSection}`)
    }
    
    if (data.campaignNotes) {
      sections.push(`## Additional Notes\n\n${data.campaignNotes}`)
    }
    
    return sections.length > 1 ? sections.join('\n\n') : ''
  }

  /**
   * Debounced auto-save function
   * Saves changes 500ms after user stops typing
   */
  const debouncedSave = useCallback(
    debounce(async (data: EditableData) => {
      setSaveStatus({ status: 'saving' })
      
      try {
        // Build the world primer from separate fields
        const worldPrimer = buildWorldPrimer(data)
        
        const response = await fetch(`/api/campaigns/${campaign.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data.name,
            description: data.description,
            worldPrimer: worldPrimer,
            settingNotes: data.campaignNotes || null,
            playerCharacterMapping: data.playerCharacterMapping,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to save campaign')
        }

        const updatedCampaign = await response.json()
        setCampaign(updatedCampaign)
        setSaveStatus({ status: 'saved' })
        
        // Clear saved status after 2 seconds
        setTimeout(() => {
          setSaveStatus({ status: 'idle' })
        }, 2000)

      } catch (error) {
        console.error('Save error:', error)
        setSaveStatus({ 
          status: 'error', 
          message: error instanceof Error ? error.message : 'Failed to save changes'
        })
        
        // Clear error status after 5 seconds
        setTimeout(() => {
          setSaveStatus({ status: 'idle' })
        }, 5000)
      }
    }, 500),
    [campaign.id]
  )

  /**
   * Handle input changes and trigger auto-save
   */
  const handleChange = (field: keyof EditableData, value: string | Record<string, string>) => {
    const newData = { ...editData, [field]: value }
    setEditData(newData)
    
    if (isEditing) {
      debouncedSave(newData)
    }
  }

  /**
   * Toggle edit mode
   */
  const toggleEditMode = () => {
    if (isEditing) {
      // Exiting edit mode - ensure final save
      debouncedSave(editData)
    }
    setIsEditing(!isEditing)
  }

  /**
   * Cancel editing and revert changes
   */
  const cancelEditing = () => {
    const parsedFields = parseWorldPrimer(campaign.worldPrimer || '')
    setEditData({
      name: campaign.name || '',
      description: campaign.description || '',
      genre: parsedFields.genre,
      tone: parsedFields.tone,
      settingOverview: parsedFields.settingOverview,
      magicTechnology: parsedFields.magicTechnology,
      factions: parsedFields.factions,
      locations: parsedFields.locations,
      sessionTags: parsedFields.sessionTags,
      campaignNotes: parsedFields.campaignNotes,
      playerCharacterMapping: campaign.playerCharacterMapping || {}
    })
    setIsEditing(false)
    setSaveStatus({ status: 'idle' })
  }

  /**
   * Sort players by field
   */
  const handleSort = (field: 'player' | 'character') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  /**
   * Handle image upload
   */
  const handleImageUpload = async (file: File) => {
    setImageUploadStatus('uploading')
    
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await fetch(`/api/campaigns/${campaign.id}/upload-image`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }

      const result = await response.json()
      setCampaign(result.campaign)
      setImageUploadStatus('success')
      
      // Clear success status after 2 seconds
      setTimeout(() => {
        setImageUploadStatus('idle')
      }, 2000)

    } catch (error) {
      console.error('Image upload error:', error)
      setImageUploadStatus('error')
      
      // Clear error status after 5 seconds
      setTimeout(() => {
        setImageUploadStatus('idle')
      }, 5000)
    }
  }

  /**
   * Handle image removal
   */
  const handleImageRemove = async () => {
    setImageUploadStatus('uploading')
    
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}/upload-image`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove image')
      }

      const result = await response.json()
      setCampaign(result.campaign)
      setImageUploadStatus('success')
      
      // Clear success status after 2 seconds
      setTimeout(() => {
        setImageUploadStatus('idle')
      }, 2000)

    } catch (error) {
      console.error('Image removal error:', error)
      setImageUploadStatus('error')
      
      // Clear error status after 5 seconds
      setTimeout(() => {
        setImageUploadStatus('idle')
      }, 5000)
    }
  }

  /**
   * Generate fallback gradient based on campaign name
   */
  const generateFallbackGradient = (name: string) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple-Blue
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink-Red
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue-Cyan
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green-Teal
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Pink-Yellow
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Teal-Pink
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // Orange-Peach
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple Fantasy
    ]
    
    // Use campaign name to consistently pick the same gradient
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return gradients[hash % gradients.length]
  }

  /**
   * Get sorted player entries for table display
   */
  const getSortedPlayers = () => {
    const entries = Object.entries(editData.playerCharacterMapping)
    
    return entries.sort(([playerA, characterA], [playerB, characterB]) => {
      const valueA = sortField === 'player' ? playerA : characterA
      const valueB = sortField === 'player' ? playerB : characterB
      
      const comparison = valueA.localeCompare(valueB)
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }

  // Get player count from playerCharacterMapping
  const playerCount = Object.keys(editData.playerCharacterMapping).length

  return (
    <div className="min-h-screen">
      {/* Header Image Section */}
      <div 
        className="relative h-64 md:h-80 overflow-hidden"
        style={{
          background: campaign.headerImagePath 
            ? `url(${campaign.headerImagePath}) center/cover` 
            : generateFallbackGradient(editData.name)
        }}
      >
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Header Content */}
        <header className="relative border-b border-border/50 backdrop-blur-sm bg-black/20">
          <div className="container">
            <div className="flex h-16 items-center justify-between">
              <nav className="flex items-center space-x-4">
                <Link href="/dashboard" className="flex items-center space-x-2 text-white">
                  <span className="font-display text-2xl text-primary-400">⚔️</span>
                  <span className="font-display text-xl">Worldbuilder</span>
                </Link>
                <span className="text-white/60">/</span>
                <Link href="/dashboard" className="text-white/80 hover:text-primary-400">
                  Campaigns
                </Link>
                <span className="text-white/60">/</span>
                <span className="text-white">{editData.name}</span>
              </nav>
              
              <div className="flex items-center gap-3">
                {/* Save Status Indicator */}
                {saveStatus.status !== 'idle' && (
                  <div className="flex items-center gap-2 text-sm">
                    {saveStatus.status === 'saving' && (
                      <>
                        <Spinner size="sm" />
                        <span className="text-white/80">Saving...</span>
                      </>
                    )}
                    {saveStatus.status === 'saved' && (
                      <>
                        <span className="text-emerald-400">✓</span>
                        <span className="text-emerald-400">Saved</span>
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
                
                <Button variant="primary" magic asChild>
                  <Link href={`/campaigns/${campaign.id}/sessions/new`}>
                    <span className="mr-2">🎙️</span>
                    <span className="hidden sm:inline">New Session</span>
                    <span className="sm:hidden">Session</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Campaign Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 drop-shadow-lg">
              {editData.name}
            </h1>
            {editData.description && (
              <p className="text-lg text-white/90 max-w-3xl drop-shadow">
                {editData.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Campaign Info */}
      <section className="container py-8">
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6 gap-4">
            <div className="flex-1 max-w-4xl">
              {/* Campaign Name */}
              {isEditing ? (
                <div className="mb-4">
                  <Label htmlFor="campaign-name" className="sr-only">Campaign Name</Label>
                  <Input
                    id="campaign-name"
                    value={editData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="text-2xl lg:text-3xl font-display font-bold bg-transparent border-0 border-b-2 border-border rounded-none px-0 focus:border-primary-400"
                    placeholder="Campaign Name"
                    required
                  />
                </div>
              ) : (
                <h2 className="text-2xl lg:text-3xl font-display font-bold mb-4 text-text-primary">
                  Campaign Details
                </h2>
              )}

              {/* Image Upload Section - Only in Edit Mode */}
              {isEditing && (
                <div className="mb-6 p-4 border-2 border-dashed border-border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-text-primary">Header Image</h3>
                      <p className="text-sm text-text-muted">Upload a world map or campaign image (max 2MB)</p>
                    </div>
                    {imageUploadStatus !== 'idle' && (
                      <div className="flex items-center gap-2 text-sm">
                        {imageUploadStatus === 'uploading' && (
                          <>
                            <Spinner size="sm" />
                            <span className="text-text-muted">Uploading...</span>
                          </>
                        )}
                        {imageUploadStatus === 'success' && (
                          <>
                            <span className="text-emerald-400">✓</span>
                            <span className="text-emerald-400">Updated</span>
                          </>
                        )}
                        {imageUploadStatus === 'error' && (
                          <span className="text-red-400">Upload failed</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file)
                        }}
                        className="hidden"
                        disabled={imageUploadStatus === 'uploading'}
                      />
                      <Button 
                        variant="secondary" 
                        size="sm"
                        disabled={imageUploadStatus === 'uploading'}
                        className="w-full cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault()
                          const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement
                          input?.click()
                        }}
                      >
                        <span className="mr-2">📷</span>
                        {campaign.headerImagePath ? 'Change Image' : 'Upload Image'}
                      </Button>
                    </label>
                    
                    {campaign.headerImagePath && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleImageRemove}
                        disabled={imageUploadStatus === 'uploading'}
                        className="text-red-400 hover:text-red-300"
                      >
                        <span className="mr-1">🗑️</span>
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Campaign Description */}
              {isEditing ? (
                <div className="mb-4">
                  <Label htmlFor="campaign-description" className="text-sm text-text-muted mb-2 block">
                    Brief Description
                  </Label>
                  <Textarea
                    id="campaign-description"
                    value={editData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="min-h-[80px] resize-y"
                    placeholder="A short overview of your campaign..."
                  />
                </div>
              ) : (
                editData.description && (
                  <p className="text-text-secondary max-w-3xl mb-4">
                    {editData.description}
                  </p>
                )
              )}

              {/* Genre and Tone */}
              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="campaign-genre" className="text-sm text-text-muted mb-2 block">
                      Genre
                    </Label>
                    <Input
                      id="campaign-genre"
                      value={editData.genre}
                      onChange={(e) => handleChange('genre', e.target.value)}
                      placeholder="Epic Fantasy, Urban Mystery..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="campaign-tone" className="text-sm text-text-muted mb-2 block">
                      Tone
                    </Label>
                    <Input
                      id="campaign-tone"
                      value={editData.tone}
                      onChange={(e) => handleChange('tone', e.target.value)}
                      placeholder="Lighthearted, Serious, Mysterious..."
                    />
                  </div>
                </div>
              ) : (
                (editData.genre || editData.tone) && (
                  <div className="mb-4">
                    <span className="text-text-muted text-sm">Genre & Tone: </span>
                    <span className="text-text-secondary">
                      {[editData.genre, editData.tone].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )
              )}

              {/* Setting Overview */}
              {isEditing ? (
                <div className="mb-4">
                  <Label htmlFor="campaign-setting-overview" className="text-sm text-text-muted mb-2 block">
                    Setting Overview
                  </Label>
                  <Textarea
                    id="campaign-setting-overview"
                    value={editData.settingOverview}
                    onChange={(e) => handleChange('settingOverview', e.target.value)}
                    className="min-h-[120px] resize-y"
                    placeholder="Describe your world's history, major conflicts, and overall setting..."
                  />
                </div>
              ) : (
                editData.settingOverview && (
                  <div className="mb-4">
                    <span className="text-text-muted text-sm block mb-1">Setting Overview:</span>
                    <p className="text-text-secondary text-sm">{editData.settingOverview}</p>
                  </div>
                )
              )}

              {/* Magic & Technology - Only show in edit mode or if has content */}
              {isEditing && (
                <div className="mb-4">
                  <Label htmlFor="campaign-magic-tech" className="text-sm text-text-muted mb-2 block">
                    Magic & Technology
                  </Label>
                  <Textarea
                    id="campaign-magic-tech"
                    value={editData.magicTechnology}
                    onChange={(e) => handleChange('magicTechnology', e.target.value)}
                    className="min-h-[80px] resize-y"
                    placeholder="How magic and technology work in your world..."
                  />
                </div>
              )}

              {/* Factions - Only show in edit mode or if has content */}
              {isEditing && (
                <div className="mb-4">
                  <Label htmlFor="campaign-factions" className="text-sm text-text-muted mb-2 block">
                    Known Factions
                  </Label>
                  <Textarea
                    id="campaign-factions"
                    value={editData.factions}
                    onChange={(e) => handleChange('factions', e.target.value)}
                    className="min-h-[100px] resize-y"
                    placeholder="Important organizations, guilds, and political groups..."
                  />
                </div>
              )}

              {/* Locations - Only show in edit mode or if has content */}
              {isEditing && (
                <div className="mb-4">
                  <Label htmlFor="campaign-locations" className="text-sm text-text-muted mb-2 block">
                    Key Locations
                  </Label>
                  <Textarea
                    id="campaign-locations"
                    value={editData.locations}
                    onChange={(e) => handleChange('locations', e.target.value)}
                    className="min-h-[100px] resize-y"
                    placeholder="Important places that might appear in your sessions..."
                  />
                </div>
              )}

              {/* Session Tags - Only show in edit mode or if has content */}
              {isEditing && (
                <div className="mb-4">
                  <Label htmlFor="campaign-session-tags" className="text-sm text-text-muted mb-2 block">
                    Session Dating Format
                  </Label>
                  <Input
                    id="campaign-session-tags"
                    value={editData.sessionTags}
                    onChange={(e) => handleChange('sessionTags', e.target.value)}
                    placeholder="e.g., Session [number] - [date] or Chronicle Entry [number]"
                  />
                </div>
              )}

              {/* Campaign Notes */}
              {isEditing && (
                <div className="mb-4">
                  <Label htmlFor="campaign-notes" className="text-sm text-text-muted mb-2 block">
                    Campaign-Specific Notes
                  </Label>
                  <Textarea
                    id="campaign-notes"
                    value={editData.campaignNotes}
                    onChange={(e) => handleChange('campaignNotes', e.target.value)}
                    className="min-h-[80px] resize-y"
                    placeholder="Any special considerations unique to this campaign..."
                  />
                </div>
              )}
            </div>

            <div className="flex flex-row lg:flex-col items-start gap-3">
              <Badge 
                variant={campaign.isPublic ? 'success' : 'default'}
                className="shrink-0"
              >
                {campaign.isPublic ? 'public' : 'private'}
              </Badge>
              
              {/* Edit Controls */}
              {isOwner && (
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={cancelEditing}
                        disabled={saveStatus.status === 'saving'}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={toggleEditMode}
                        disabled={saveStatus.status === 'saving'}
                      >
                        Done
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={toggleEditMode}
                    >
                      <span className="mr-1">⚙️</span>
                      <span className="hidden sm:inline">Edit Campaign Details</span>
                      <span className="sm:hidden">Edit</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Campaign Stats */}
          <div className="flex flex-wrap gap-4 text-sm mb-6">
            <div className="flex items-center gap-2">
              <span className="text-text-muted">Players:</span>
              <span className="stat-text">{playerCount} players</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-muted">Created:</span>
              <span className="text-text-secondary">
                {new Date(campaign.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-muted">Sessions:</span>
              <span className="text-gold font-mono">{campaign._count.sessions}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-muted">Owner:</span>
              <span className="text-text-secondary">
                {campaign.owner.username || 'Unknown'}
              </span>
            </div>
          </div>

          {/* Player/Character Table */}
          {playerCount > 0 && (
            <div className={cn(
              "rounded-lg border transition-colors",
              isEditing ? "bg-surface/50 border-primary-400/30" : "bg-surface border-border"
            )}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b border-border/50 gap-2">
                <h3 className="font-medium">Players & Characters</h3>
                {!isEditing && (
                  <span className="text-xs text-text-muted">
                    Use "Manage Players" to add/remove players
                  </span>
                )}
              </div>
              
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left p-3">
                        <button
                          type="button"
                          onClick={() => handleSort('player')}
                          className="flex items-center gap-1 font-medium text-text-secondary hover:text-text-primary transition-colors"
                        >
                          Player Name
                          {sortField === 'player' && (
                            <span className="text-xs">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </button>
                      </th>
                      <th className="text-left p-3">
                        <button
                          type="button"
                          onClick={() => handleSort('character')}
                          className="flex items-center gap-1 font-medium text-text-secondary hover:text-text-primary transition-colors"
                        >
                          Character Name
                          {sortField === 'character' && (
                            <span className="text-xs">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </button>
                      </th>
                      <th className="text-left p-3 font-medium text-text-secondary">Race</th>
                      <th className="text-left p-3 font-medium text-text-secondary">Class</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedPlayers().map(([player, character], index) => {
                      // Parse character info - assuming format like "Voltee (Elf Paladin)" or just "Voltee"
                      const characterMatch = character.match(/^([^(]+)(?:\s*\(([^)]+)\))?/)
                      const characterName = characterMatch?.[1]?.trim() || character
                      const characterDetails = characterMatch?.[2]?.trim() || ''
                      
                      // Parse race and class from details
                      const detailsParts = characterDetails.split(/\s+/)
                      const race = detailsParts[0] || ''
                      const characterClass = detailsParts.slice(1).join(' ') || ''
                      
                      return (
                        <tr 
                          key={`${player}-${character}`}
                          className={cn(
                            "border-b border-border/20 hover:bg-background/50 transition-colors",
                            index % 2 === 0 && "bg-background/20"
                          )}
                        >
                          <td className="p-3 font-medium text-text-secondary">{player}</td>
                          <td className="p-3 font-medium text-primary-400">{characterName}</td>
                          <td className="p-3 text-text-secondary text-sm">{race}</td>
                          <td className="p-3 text-text-secondary text-sm">{characterClass}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Layout */}
              <div className="md:hidden">
                {getSortedPlayers().map(([player, character], index) => {
                  const characterMatch = character.match(/^([^(]+)(?:\s*\(([^)]+)\))?/)
                  const characterName = characterMatch?.[1]?.trim() || character
                  const characterDetails = characterMatch?.[2]?.trim() || ''
                  
                  const detailsParts = characterDetails.split(/\s+/)
                  const race = detailsParts[0] || ''
                  const characterClass = detailsParts.slice(1).join(' ') || ''
                  
                  return (
                    <div 
                      key={`${player}-${character}`}
                      className={cn(
                        "p-4 border-b border-border/20",
                        index % 2 === 0 && "bg-background/20"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium text-text-secondary">{player}</div>
                          <div className="font-medium text-primary-400">{characterName}</div>
                        </div>
                      </div>
                      {(race || characterClass) && (
                        <div className="text-sm text-text-muted">
                          {race && <span className="mr-2">{race}</span>}
                          {characterClass && <span>{characterClass}</span>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        <section>
          <h2 className="heading-2 mb-6">Recent Sessions</h2>
          
          {campaign.sessions.length === 0 ? (
            <Alert className="animate-fade-in">
              <AlertDescription>
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📜</div>
                  <h3 className="font-display text-xl mb-2">No sessions yet</h3>
                  <p className="text-text-secondary mb-4">
                    Upload your first session recording to get started
                  </p>
                  <Button variant="primary" asChild>
                    <Link href={`/campaigns/${campaign.id}/sessions/new`}>
                      Upload Session
                    </Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="session-list space-y-4">
              {campaign.sessions.map((session, index) => (
                <Card 
                  key={session.id} 
                  className="session-card animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          {session.title || `Session ${index + 1}`}
                        </CardTitle>
                        <CardDescription>
                          {new Date(session.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        {session.status.toLowerCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {session.summaryJson ? (
                      <p className="body-text line-clamp-3">
                        {typeof session.summaryJson === 'string' 
                          ? session.summaryJson 
                          : JSON.stringify(session.summaryJson).substring(0, 200) + '...'
                        }
                      </p>
                    ) : (
                      <p className="text-text-muted italic">
                        {session.status === 'PROCESSING' ? 'Processing session recording...' : 
                         session.status === 'QUEUED' ? 'Queued for processing...' :
                         session.status === 'FAILED' ? 'Processing failed' :
                         'No summary available'}
                      </p>
                    )}
                    <div className="mt-4">
                      <Button variant="link" asChild className="p-0">
                        <Link href={`/sessions/${session.id}`}>
                          View Full Summary →
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Campaign Actions */}
        {isOwner && (
          <section className="mt-12">
            <h2 className="heading-2 mb-6">Campaign Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="secondary" asChild>
                <Link href={`/campaigns/${campaign.id}/players`}>
                  <span className="mr-2">👥</span>
                  Manage Players
                </Link>
              </Button>
              <Button variant="secondary" disabled>
                <span className="mr-2">💬</span>
                Discord Settings
                <Badge variant="warning" className="ml-2">Soon</Badge>
              </Button>
              {campaign.inviteCode && (
                <Button 
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(campaign.inviteCode!)
                    // Could add toast notification here
                  }}
                >
                  <span className="mr-2">📋</span>
                  <span className="hidden sm:inline">Invite Code: </span>
                  {campaign.inviteCode}
                </Button>
              )}
            </div>
          </section>
        )}
      </section>
    </div>
  )
}

/**
 * Debounce utility function
 * Delays function execution until after specified delay
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}