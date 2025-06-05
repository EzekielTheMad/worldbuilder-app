'use client'

import { useState, useEffect, useRef } from 'react'
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
import { Progress } from '@/components/ui/Progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { api, ApiError } from '@/lib/api'

// Campaign templates
const campaignTemplates = {
  'classic-fantasy': {
    name: 'Classic Fantasy Campaign',
    genre: 'Epic Fantasy',
    tone: 'Heroic Adventure',
    settingOverview: 'A realm of knights and dragons, where magic flows through ancient ley lines and heroes rise to face dark forces threatening the land.',
    magicTechnology: 'Magic is common but requires training. Technology is medieval - swords, castles, and sailing ships. Magical items are treasured.',
    sessionTags: 'Session [number] - [date]',
    additionalNotes: 'Focus on heroic deeds and character growth. Include tavern names and NPC descriptions.',
  },
  'horror': {
    name: 'Horror Mystery Campaign',
    genre: 'Gothic Horror',
    tone: 'Dark and Suspenseful',
    settingOverview: 'A world where shadows hide ancient evils, and investigators delve into mysteries that threaten their sanity.',
    magicTechnology: 'Magic exists but is dangerous and corrupting. Victorian-era technology. The supernatural is hidden from common folk.',
    sessionTags: 'Case File #[number] - [location]',
    additionalNotes: 'Emphasize atmosphere and tension. Focus on investigation and psychological horror over combat.',
  },
  'sci-fi': {
    name: 'Space Adventure Campaign',
    genre: 'Space Opera',
    tone: 'High Adventure',
    settingOverview: 'The galaxy is vast and full of wonders. Multiple species work together (and against each other) across the stars.',
    magicTechnology: 'Advanced technology indistinguishable from magic. FTL travel, energy weapons, and AI are common.',
    sessionTags: 'Stardate [number].[number]',
    additionalNotes: 'Include ship names, planet descriptions, and alien species encountered.',
  },
  'minimal': {
    name: '',
    genre: '',
    tone: '',
    settingOverview: '',
    magicTechnology: '',
    sessionTags: '',
    additionalNotes: '',
  },
}

/**
 * Enhanced campaign creation form with QoL improvements
 */
export default function NewCampaignPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [showTemplates, setShowTemplates] = useState(true)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importText, setImportText] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    description: '',
    genre: '',
    tone: '',
    
    // World Building
    settingOverview: '',
    magicTechnology: '',
    
    // Player Characters - Updated structure
    players: [{ 
      playerName: '', 
      characterName: '', 
      characterDetails: '',
      pronouns: '',
      aliases: '',
    }],
    
    // Campaign Specifics
    factions: '',
    locations: '',
    sessionTags: '',
    campaignNotes: '', // Simplified to just campaign-specific notes
  })

  // Section navigation
  const sections = [
    'Basic Information',
    'World Building',
    'Player Characters',
    'Factions & Politics',
    'Key Locations',
    'Summary Settings'
  ]

  // Auto-save draft to localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem('campaign-draft')
    if (savedDraft && !formData.name) {
      const draft = JSON.parse(savedDraft)
      if (confirm('You have an unsaved campaign draft. Would you like to resume?')) {
        setFormData(draft)
        setShowTemplates(false)
      } else {
        localStorage.removeItem('campaign-draft')
      }
    }
  }, [])

  // Save draft on changes
  useEffect(() => {
    if (formData.name || formData.description || formData.settingOverview) {
      localStorage.setItem('campaign-draft', JSON.stringify(formData))
    }
  }, [formData])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'ArrowRight' && currentSection < sections.length - 1) {
          e.preventDefault()
          nextSection()
        } else if (e.key === 'ArrowLeft' && currentSection > 0) {
          e.preventDefault()
          prevSection()
        } else if (e.key === 's') {
          e.preventDefault()
          // Save draft notification
        }
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentSection])

  // Calculate completion percentage
  const calculateCompletion = () => {
    let completed = 0
    let total = 0
    
    // Required fields
    if (formData.name) completed++
    total++
    
    // Recommended fields
    const recommendedFields = [
      formData.settingOverview,
      formData.players.some(p => p.playerName && p.characterName),
      formData.genre || formData.tone,
    ]
    
    recommendedFields.forEach(field => {
      if (field) completed++
      total++
    })
    
    // Optional fields (weighted less)
    const optionalFields = [
      formData.description,
      formData.magicTechnology,
      formData.factions,
      formData.locations,
      formData.sessionTags,
      formData.exampleSummary,
      formData.additionalNotes,
    ]
    
    optionalFields.forEach(field => {
      if (field) completed += 0.5
      total += 0.5
    })
    
    return Math.round((completed / total) * 100)
  }

  const completionPercentage = calculateCompletion()

  // Section completion checks
  const isSectionComplete = (index: number) => {
    switch (index) {
      case 0: // Basic Info
        return !!formData.name && (!!formData.genre || !!formData.tone)
      case 1: // World Building
        return !!formData.settingOverview
      case 2: // Players
        return formData.players.some(p => p.playerName && p.characterName)
      case 3: // Factions
        return !!formData.factions
      case 4: // Locations
        return !!formData.locations
      case 5: // Summary Settings
        return !!(formData.sessionTags || formData.campaignNotes)
      default:
        return false
    }
  }

  // Template loading
  const loadTemplate = (templateKey: keyof typeof campaignTemplates) => {
    const template = campaignTemplates[templateKey]
    setFormData(prev => ({
      ...prev,
      ...template,
      players: prev.players, // Keep existing players
    }))
    setShowTemplates(false)
    if (templateKey !== 'minimal') {
      setCurrentSection(0)
    }
  }

  // Import/Export functions
  const exportSettings = () => {
    const dataStr = JSON.stringify(formData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${formData.name || 'campaign'}-settings.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const importSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string)
        setFormData(imported)
        setShowTemplates(false)
      } catch (err) {
        setError('Invalid settings file')
      }
    }
    reader.readAsText(file)
  }

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
    }
  }

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  /**
   * Add a new player/character
   */
  const addPlayer = () => {
    setFormData(prev => ({
      ...prev,
      players: [...prev.players, { 
        playerName: '', 
        characterName: '', 
        characterDetails: '',
        pronouns: '',
        aliases: '',
      }]
    }))
  }

  /**
   * Remove a player/character
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
  const updatePlayer = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      players: prev.players.map((player, i) => 
        i === index ? { ...player, [field]: value } : player
      )
    }))
  }

  /**
   * Build the world primer from all inputs
   */
  const buildWorldPrimer = () => {
    const sections = []
    
    // Add header
    sections.push(`# Campaign Primer: ${formData.name || '[Campaign Name]'}\n`)
    
    // Only add sections with content
    if (formData.tone || formData.genre) {
      sections.push(`## Tone & Genre\n\n${[formData.genre, formData.tone].filter(Boolean).join(', ')}`)
    }
    
    if (formData.settingOverview) {
      sections.push(`## Setting Overview\n\n${formData.settingOverview}`)
    }
    
    if (formData.magicTechnology) {
      sections.push(`## Magic & Technology\n\n${formData.magicTechnology}`)
    }
    
    if (formData.factions) {
      sections.push(`## Known Factions\n\n${formData.factions}`)
    }
    
    if (formData.locations) {
      sections.push(`## Key Locations\n\n${formData.locations}`)
    }
    
    if (formData.sessionTags) {
      sections.push(`## Session Tags\n\n${formData.sessionTags}`)
    }
    
    const playersWithNames = formData.players.filter(p => p.playerName && p.characterName)
    if (playersWithNames.length > 0) {
      const playerSection = playersWithNames
        .map(p => `* **${p.playerName}** → *${p.characterName}*${p.characterDetails ? ` (${p.characterDetails})` : ''}`)
        .join('\n')
      sections.push(`## Player-Character Mapping\n\n${playerSection}`)
    }
    
    if (formData.exampleSummary) {
      sections.push(`## Example Summary\n\n${formData.exampleSummary}`)
    }
    
    if (formData.additionalNotes) {
      sections.push(`## Additional Notes\n\n${formData.additionalNotes}`)
    }
    
    return sections.length > 1 ? sections.join('\n\n') : ''
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Build player character mapping
      const playerCharacterMapping = formData.players
        .filter(p => p.playerName && p.characterName)
        .reduce((acc, player) => {
          acc[player.playerName] = player.characterName
          return acc
        }, {} as Record<string, string>)

      // Build comprehensive world primer
      const worldPrimer = buildWorldPrimer()

      // Create campaign
      const { campaign } = await api.campaigns.create({
        name: formData.name,
        description: formData.description || null,
        worldPrimer: worldPrimer,
        settingNotes: formData.campaignNotes || null,
        playerCharacterMapping: playerCharacterMapping,
        isPublic: false,
      })

      // Clear draft on success
      localStorage.removeItem('campaign-draft')
      
      router.push(`/campaigns/${campaign.id}`)
    } catch (err) {
      console.error('Campaign creation error:', err)
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Something went wrong')
      }
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
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={exportSettings}>
                📤 Export
              </Button>
              <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                📥 Import
              </Button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".json"
                className="hidden"
                onChange={importSettings}
              />
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-3">
            <div className="mb-8 animate-fade-in">
              <h1 className="heading-1 mb-2">Create New Campaign</h1>
              <p className="text-text-secondary">
                Build a rich world for your AI to understand and create better summaries
              </p>
            </div>

            {/* Privacy Notice */}
            <Alert className="mb-6 animate-fade-in">
              <AlertDescription>
                <strong>🔒 Your Privacy Matters:</strong> We use Google's Gemini AI to process your sessions. 
                Your campaign data and recordings are <strong>never used to train AI models</strong>. 
                All information is processed privately and remains under your control. You can delete your data at any time.
              </AlertDescription>
            </Alert>

            {/* Templates (show only at start) */}
            {showTemplates && !formData.name && (
              <Card className="mb-6 animate-fade-in">
                <CardHeader>
                  <CardTitle>Quick Start Templates</CardTitle>
                  <CardDescription>
                    Start with a template and customize from there
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="outline" onClick={() => loadTemplate('classic-fantasy')}>
                      ⚔️ Classic Fantasy
                    </Button>
                    <Button variant="outline" onClick={() => loadTemplate('horror')}>
                      🦇 Horror Mystery
                    </Button>
                    <Button variant="outline" onClick={() => loadTemplate('sci-fi')}>
                      🚀 Sci-Fi Adventure
                    </Button>
                    <Button variant="outline" onClick={() => loadTemplate('minimal')}>
                      📝 Start from Scratch
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress Bar - Visual Steps */}
            <div className="mb-8">
              <div className="hidden lg:grid lg:grid-cols-6 gap-2 mb-6">
                {sections.map((section, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentSection(index)}
                    className={`
                      p-3 rounded-lg border-2 transition-all duration-200 text-left
                      ${index === currentSection 
                        ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/20' 
                        : isSectionComplete(index)
                          ? 'border-primary-700 bg-primary-700/10 hover:border-primary-600' 
                          : 'border-border bg-surface hover:border-primary-500/50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`
                        text-xs font-medium
                        ${index === currentSection ? 'text-primary-400' : 'text-text-muted'}
                      `}>
                        Step {index + 1}
                      </span>
                      {isSectionComplete(index) && (
                        <span className="text-emerald text-sm">✓</span>
                      )}
                    </div>
                    <div className={`
                      text-sm font-medium
                      ${index === currentSection ? 'text-text-primary' : 'text-text-secondary'}
                    `}>
                      {section}
                    </div>
                  </button>
                ))}
              </div>

              {/* Mobile/Tablet Progress */}
              <div className="lg:hidden">
                <div className="flex items-center justify-between mb-4">
                  {sections.map((section, index) => (
                    <div 
                      key={index}
                      className="flex flex-col items-center flex-1"
                    >
                      <button
                        type="button"
                        onClick={() => setCurrentSection(index)}
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                          transition-all duration-200
                          ${index === currentSection 
                            ? 'bg-primary-500 text-white scale-110 ring-2 ring-primary-400 ring-offset-2 ring-offset-background' 
                            : isSectionComplete(index)
                              ? 'bg-primary-700 text-white' 
                              : 'bg-surface border-2 border-border text-text-muted'
                          }
                        `}
                        title={section}
                      >
                        {isSectionComplete(index) ? '✓' : index + 1}
                      </button>
                      {index !== sections.length - 1 && (
                        <div className={`
                          h-0.5 w-full mt-5 transition-all duration-200
                          ${index < currentSection || isSectionComplete(index) ? 'bg-primary-600' : 'bg-border'}
                        `} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-text-primary">
                    {sections[currentSection]}
                  </h3>
                  <p className="text-sm text-text-muted mt-1">
                    Step {currentSection + 1} of {sections.length}
                    <span className="hidden sm:inline ml-2 text-xs">
                      (Ctrl+← → to navigate)
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6 animate-fade-in">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 0: Basic Information */}
              {currentSection === 0 && (
                <Card className="animate-slide-up">
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Start with the foundation of your campaign
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <AlertDescription>
                        <strong>💡 How this helps:</strong> The more context you provide, the better your AI summaries will be. 
                        All fields except Campaign Name are optional - add as much or as little as you'd like. 
                        You can always update these later!
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Campaign Name <span className="text-crimson">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="The Dragon's Crown, Shadows of Waterdeep, etc."
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        maxLength={100}
                      />
                      <p className="text-xs text-text-muted">
                        Required - this is how you'll identify your campaign
                        <span className="float-right">{formData.name.length}/100</span>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Brief Description 
                        <span className="text-text-muted ml-2">(Optional)</span>
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="A short overview of your campaign..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        maxLength={500}
                      />
                      <p className="text-xs text-text-muted">
                        A quick reference for you - not used in AI processing
                        <span className="float-right">{formData.description.length}/500</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="genre">
                          Genre 
                          <span className="text-text-muted ml-2">(Optional)</span>
                        </Label>
                        <Input
                          id="genre"
                          placeholder="Epic Fantasy, Urban Mystery, Space Opera..."
                          value={formData.genre}
                          onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                          maxLength={50}
                        />
                        <p className="text-xs text-text-muted">
                          Helps AI match the tone
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tone">
                          Tone 
                          <span className="text-text-muted ml-2">(Optional)</span>
                        </Label>
                        <Input
                          id="tone"
                          placeholder="Lighthearted, Serious, Mysterious..."
                          value={formData.tone}
                          onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value }))}
                          maxLength={50}
                        />
                        <p className="text-xs text-text-muted">
                          Guides narrative style
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 1: World Building */}
              {currentSection === 1 && (
                <Card className="animate-slide-up">
                  <CardHeader>
                    <CardTitle>World Building</CardTitle>
                    <CardDescription>
                      Describe your world so the AI understands the setting
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert variant="info">
                      <AlertDescription>
                        <strong>🎲 Why this matters:</strong> When the AI processes your session audio, it uses this context 
                        to better understand references to places, factions, and world-specific terms. 
                        The more detail you provide, the more accurate your summaries will be!
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="settingOverview">
                          Setting Overview 
                          <span className="text-text-muted ml-2">(Optional but recommended)</span>
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="text-text-muted hover:text-text-secondary cursor-help">ⓘ</span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="font-semibold mb-1">Setting Examples:</p>
                              <ul className="text-sm space-y-1">
                                <li>• A shattered empire rebuilding after a magical catastrophe</li>
                                <li>• Victorian London but with hidden magic societies</li>
                                <li>• Space stations connected by mysterious portals</li>
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Textarea
                        id="settingOverview"
                        placeholder="Example: 'A realm where ancient dragons slumber beneath modern cities, and magic is returning after centuries of absence...'"
                        value={formData.settingOverview}
                        onChange={(e) => setFormData(prev => ({ ...prev, settingOverview: e.target.value }))}
                        rows={6}
                        maxLength={2000}
                      />
                      <p className="text-xs text-text-muted">
                        Describe the world, its history, major conflicts - helps AI understand context
                        <span className="float-right">{formData.settingOverview.length}/2000</span>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="magicTechnology">
                        Magic & Technology 
                        <span className="text-text-muted ml-2">(Optional)</span>
                      </Label>
                      <Textarea
                        id="magicTechnology"
                        placeholder="Example: 'Magic requires crystals as fuel. Steam-powered machines are common. Teleportation exists but is expensive...'"
                        value={formData.magicTechnology}
                        onChange={(e) => setFormData(prev => ({ ...prev, magicTechnology: e.target.value }))}
                        rows={4}
                        maxLength={1000}
                      />
                      <p className="text-xs text-text-muted">
                        Helps AI understand what's normal vs extraordinary in your world
                        <span className="float-right">{formData.magicTechnology.length}/1000</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 2: Player Characters */}
              {currentSection === 2 && (
                <Card className="animate-slide-up">
                  <CardHeader>
                    <CardTitle>Player Characters</CardTitle>
                    <CardDescription>
                      Help the AI identify who's speaking in your recordings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert className="mb-4">
                      <AlertDescription>
                        <strong>🎭 Voice Recognition:</strong> Adding player names helps the AI identify speakers in your audio. 
                        Character details help it understand their actions and motivations. 
                        Start with just names - you can add details later as characters develop!
                      </AlertDescription>
                    </Alert>

                    <div className="mb-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowImportDialog(true)}
                      >
                        📋 Import from Character Sheet
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {formData.players.map((player, index) => (
                        <div key={index} className="p-4 border border-border rounded-lg space-y-3 animate-fade-in">
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <Label htmlFor={`player-${index}`}>
                                Player Name 
                                {index === 0 && <span className="text-text-muted ml-2">(Real name)</span>}
                              </Label>
                              <Input
                                id={`player-${index}`}
                                placeholder="Sarah, Mike, Alex..."
                                value={player.playerName}
                                onChange={(e) => updatePlayer(index, 'playerName', e.target.value)}
                                maxLength={50}
                              />
                            </div>
                            <div className="flex-1">
                              <Label htmlFor={`character-${index}`}>
                                Character Name
                                {index === 0 && <span className="text-text-muted ml-2">(In-game name)</span>}
                              </Label>
                              <Input
                                id={`character-${index}`}
                                placeholder="Thorin, Luna Starweaver, Sir Reginald..."
                                value={player.characterName}
                                onChange={(e) => updatePlayer(index, 'characterName', e.target.value)}
                                maxLength={50}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removePlayer(index)}
                              className="mt-6"
                              disabled={formData.players.length === 1}
                            >
                              ❌
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor={`pronouns-${index}`}>
                                Character Pronouns
                              </Label>
                              <Select
                                id={`pronouns-${index}`}
                                value={player.pronouns || ''}
                                onChange={(e) => updatePlayer(index, 'pronouns', e.target.value)}
                              >
                                <option value="">Select pronouns...</option>
                                <option value="he/him">he/him</option>
                                <option value="she/her">she/her</option>
                                <option value="they/them">they/them</option>
                                <option value="custom">Custom (specify below)</option>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`aliases-${index}`}>
                                Nicknames/Variations 
                                <span className="text-text-muted ml-2">(Optional)</span>
                              </Label>
                              <Input
                                id={`aliases-${index}`}
                                placeholder="Zero, Zerro (for Xero)"
                                value={player.aliases || ''}
                                onChange={(e) => updatePlayer(index, 'aliases', e.target.value)}
                                maxLength={100}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor={`details-${index}`}>
                              Character Details 
                              <span className="text-text-muted ml-2">(Optional - add anytime)</span>
                            </Label>
                            <Textarea
                              id={`details-${index}`}
                              placeholder="Examples: 'Dwarf Fighter, loyal and stubborn' or 'Elf Wizard, seeks forbidden knowledge' or 'Human Rogue, charming but unreliable'"
                              value={player.characterDetails}
                              onChange={(e) => updatePlayer(index, 'characterDetails', e.target.value)}
                              rows={2}
                              maxLength={200}
                            />
                            <p className="text-xs text-text-muted text-right">
                              {player.characterDetails.length}/200
                            </p>
                          </div>
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
                  </CardContent>
                </Card>
              )}

              {/* Section 3: Factions & Politics */}
              {currentSection === 3 && (
                <Card className="animate-slide-up">
                  <CardHeader>
                    <CardTitle>Factions & Politics</CardTitle>
                    <CardDescription>
                      Organizations, groups, and political structures in your world
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="factions">
                          Known Factions 
                          <span className="text-text-muted ml-2">(Optional)</span>
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="text-text-muted hover:text-text-secondary cursor-help">ⓘ</span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="font-semibold mb-1">Faction Examples:</p>
                              <ul className="text-sm space-y-1">
                                <li>• <strong>The Merchant's Guild</strong> - Controls trade, led by Master Goldhand</li>
                                <li>• <strong>Order of the Silver Moon</strong> - Paladin order, protects the innocent</li>
                                <li>• <strong>The Crimson Hand</strong> - Thieves guild, information brokers</li>
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Textarea
                        id="factions"
                        placeholder="Example: 'The Merchant's Guild - Controls trade routes, led by Master Goldhand\nThe Forest Watch - Protects nature, uses druid magic\nThe Iron Brotherhood - Mercenary company, loyal to highest bidder'"
                        value={formData.factions}
                        onChange={(e) => setFormData(prev => ({ ...prev, factions: e.target.value }))}
                        rows={8}
                        maxLength={2000}
                      />
                      <p className="text-xs text-text-muted">
                        Include faction names, goals, key NPCs, and any ranking systems
                        <span className="float-right">{formData.factions.length}/2000</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 4: Key Locations */}
              {currentSection === 4 && (
                <Card className="animate-slide-up">
                  <CardHeader>
                    <CardTitle>Key Locations</CardTitle>
                    <CardDescription>
                      Important places that might appear in your sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="locations">
                        Locations 
                        <span className="text-text-muted ml-2">(Optional)</span>
                      </Label>
                      <Textarea
                        id="locations"
                        placeholder="Example: 'Riverdale - Peaceful farming town, famous for its harvest festival\nThe Sunken Tower - Ancient ruins, said to hold powerful artifacts\nPort Blackwater - Rough trading city, controlled by smuggler gangs'"
                        value={formData.locations}
                        onChange={(e) => setFormData(prev => ({ ...prev, locations: e.target.value }))}
                        rows={8}
                        maxLength={2000}
                      />
                      <p className="text-xs text-text-muted">
                        Include atmosphere, key features, and why they're important
                        <span className="float-right">{formData.locations.length}/2000</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 5: Summary Preferences */}
              {currentSection === 5 && (
                <Card className="animate-slide-up">
                  <CardHeader>
                    <CardTitle>Summary Settings</CardTitle>
                    <CardDescription>
                      Configure how your sessions are labeled and any campaign-specific needs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert variant="success">
                      <AlertDescription>
                        <strong>✨ Good news:</strong> Our AI automatically formats your summaries with a consistent structure. 
                        You only need to specify campaign-specific details here.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label htmlFor="sessionTags">
                        Session Dating Format 
                        <span className="text-text-muted ml-2">(Optional)</span>
                      </Label>
                      <Textarea
                        id="sessionTags"
                        placeholder="Example: 'Use in-world calendar: 15th of Harvestmoon, Year 1247' or 'Session [number] - [location]' or 'Chronicle Entry [number]'"
                        value={formData.sessionTags}
                        onChange={(e) => setFormData(prev => ({ ...prev, sessionTags: e.target.value }))}
                        rows={3}
                        maxLength={500}
                      />
                      <p className="text-xs text-text-muted">
                        How to date/number your sessions (leave blank for default: Session 1, Session 2, etc.)
                        <span className="float-right">{formData.sessionTags.length}/500</span>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="campaignNotes">
                        Campaign-Specific Notes 
                        <span className="text-text-muted ml-2">(Optional)</span>
                      </Label>
                      <Textarea
                        id="campaignNotes"
                        placeholder="Example: 'NPCs always use formal titles' or 'This is a political intrigue campaign' or 'Weather is important to the story'"
                        value={formData.campaignNotes || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, campaignNotes: e.target.value }))}
                        rows={4}
                        maxLength={1000}
                      />
                      <p className="text-xs text-text-muted">
                        Any special considerations unique to this campaign
                        <span className="float-right">{(formData.campaignNotes || '').length}/1000</span>
                      </p>
                    </div>

                    {/* Summary Format Preview */}
                    <Card className="mt-6 bg-surface-elevated">
                      <CardHeader>
                        <CardTitle className="text-base">What Your Summaries Will Include</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-text-secondary">
                          <div className="flex items-start gap-2">
                            <span className="text-primary-400">📌</span>
                            <div>
                              <strong>TL;DR - Session Highlights</strong>
                              <p className="text-xs text-text-muted">2-4 bullet points of critical outcomes</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-primary-400">📖</span>
                            <div>
                              <strong>Session Recap</strong>
                              <p className="text-xs text-text-muted">Narrative retelling of events from start to finish</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-primary-400">⚔️</span>
                            <div>
                              <strong>Key Events and Consequences</strong>
                              <p className="text-xs text-text-muted">Pivotal scenes and their impact</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-primary-400">👥</span>
                            <div>
                              <strong>NPCs Encountered</strong>
                              <p className="text-xs text-text-muted">Characters met with brief descriptions</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-primary-400">🗺️</span>
                            <div>
                              <strong>Locations Visited</strong>
                              <p className="text-xs text-text-muted">Places explored and their significance</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-primary-400">💎</span>
                            <div>
                              <strong>Loot and Magical Discoveries</strong>
                              <p className="text-xs text-text-muted">Treasure found and who claimed it</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-primary-400">🏕️</span>
                            <div>
                              <strong>Downtime Activities</strong>
                              <p className="text-xs text-text-muted">Character development between action</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between animate-slide-up">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={prevSection}
                  disabled={currentSection === 0 || isSubmitting}
                >
                  ← Previous
                </Button>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.push('/dashboard')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>

                  {currentSection === sections.length - 1 ? (
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
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={nextSection}
                      disabled={isSubmitting}
                    >
                      Next →
                    </Button>
                  )}
                </div>
              </div>
            </form>

            {/* Preview Section */}
            {currentSection === sections.length - 1 && (
              <Card className="mt-8 animate-slide-up">
                <CardHeader>
                  <CardTitle>Campaign Primer Preview</CardTitle>
                  <CardDescription>
                    This is what the AI will use to understand your campaign. 
                    The primer combines all your inputs into a structured document.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4" variant="info">
                    <AlertDescription>
                      <strong>📋 How this works:</strong> When you upload a session recording, the AI reads this primer first 
                      to understand your world's context. Only filled sections will be included. 
                      You can update this anytime from your campaign settings!
                    </AlertDescription>
                  </Alert>
                  <pre className="whitespace-pre-wrap text-sm bg-surface-elevated p-4 rounded-lg overflow-auto max-h-96">
                    {buildWorldPrimer() || 'Your campaign primer will appear here as you fill in the form above. Only sections with content will be included.'}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Completion Progress */}
            <Card className="animate-fade-in sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Setup Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={completionPercentage} className="mb-4" />
                <p className="text-sm text-text-secondary mb-4">
                  {completionPercentage}% Complete
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={formData.name ? 'text-emerald' : 'text-text-muted'}>
                      {formData.name ? '✓' : '○'}
                    </span>
                    <span>Campaign name</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={formData.settingOverview ? 'text-emerald' : 'text-text-muted'}>
                      {formData.settingOverview ? '✓' : '○'}
                    </span>
                    <span>World description</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={formData.players.some(p => p.playerName && p.characterName) ? 'text-emerald' : 'text-text-muted'}>
                      {formData.players.some(p => p.playerName && p.characterName) ? '✓' : '○'}
                    </span>
                    <span>At least one player</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={formData.genre || formData.tone ? 'text-emerald' : 'text-text-muted'}>
                      {formData.genre || formData.tone ? '✓' : '○'}
                    </span>
                    <span>Genre or tone</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-text-muted mb-2">
                    Optional but helpful:
                  </p>
                  <div className="space-y-1 text-xs text-text-muted">
                    {formData.factions && <div>✓ Factions added</div>}
                    {formData.locations && <div>✓ Locations added</div>}
                                                {formData.campaignNotes && <div>✓ Campaign notes added</div>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <strong>🎯 Start Simple</strong>
                  <p className="text-text-muted">Just add names first. Details can come later!</p>
                </div>
                <div>
                  <strong>📝 Save Time</strong>
                  <p className="text-text-muted">Use templates or import from another campaign</p>
                </div>
                <div>
                  <strong>🔄 Update Anytime</strong>
                  <p className="text-text-muted">Everything can be changed after creation</p>
                </div>
              </CardContent>
            </Card>

            {/* D&D Terms */}
            <details className="bg-surface rounded-lg p-4 animate-fade-in">
              <summary className="cursor-pointer font-medium text-sm">
                📖 D&D Terms Explained
              </summary>
              <div className="mt-3 space-y-2 text-sm text-text-secondary">
                <div>
                  <strong>Campaign:</strong> Your ongoing story
                </div>
                <div>
                  <strong>Session:</strong> A single game night
                </div>
                <div>
                  <strong>PC:</strong> Player Character
                </div>
                <div>
                  <strong>NPC:</strong> Non-Player Character (DM-controlled)
                </div>
                <div>
                  <strong>DM/GM:</strong> Dungeon/Game Master
                </div>
              </div>
            </details>
          </div>
        </div>
      </main>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Character Information</DialogTitle>
            <DialogDescription>
              Paste character information from D&D Beyond, Roll20, or any character sheet. 
              We'll try to extract player and character names.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Paste character sheet text, campaign roster, or player list here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={6}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowImportDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Simple parsing logic - can be enhanced
                const lines = importText.split('\n')
                const newPlayers = lines
                  .filter(line => line.includes('-') || line.includes(':'))
                  .map(line => {
                    const parts = line.split(/[-:]/)
                    if (parts.length >= 2) {
                      return {
                        playerName: parts[0].trim(),
                        characterName: parts[1].trim(),
                        characterDetails: parts.slice(2).join(' ').trim()
                      }
                    }
                    return null
                  })
                  .filter(Boolean) as typeof formData.players

                if (newPlayers.length > 0) {
                  setFormData(prev => ({ ...prev, players: [...prev.players, ...newPlayers] }))
                  setShowImportDialog(false)
                  setImportText('')
                }
              }}>
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}