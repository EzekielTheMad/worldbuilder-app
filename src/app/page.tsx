import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SignInButton } from '@/components/auth/SignInButton'

/**
 * Landing page with hero section and features
 * Redirects to dashboard if user is already authenticated
 */
export default async function LandingPage() {
  const session = await getServerSession(authOptions)
  
  // Redirect authenticated users to dashboard
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="relative">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-display text-2xl text-primary-400">⚔️</span>
            <span className="font-display text-xl">Worldbuilder</span>
          </div>
          <SignInButton />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            {/* Animated title */}
            <h1 className="heading-1 mb-6 animate-fade-in">
              Transform Your D&D Sessions Into
              <span className="block">Epic Narratives</span>
            </h1>
            
            <p className="body-text mb-8 text-lg text-text-secondary animate-slide-up">
              AI-powered transcription and summarization for tabletop RPG sessions. 
              Never lose track of your campaign's story again.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
              <SignInButton />
              <Button variant="ghost" size="lg" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <Badge variant="outline" className="animate-fade-in">
                <span className="text-gold mr-1">🎲</span> D&D 5e Compatible
              </Badge>
              <Badge variant="outline" className="animate-fade-in animation-delay-100">
                <span className="text-emerald mr-1">🎙️</span> 4+ Hour Sessions
              </Badge>
              <Badge variant="outline" className="animate-fade-in animation-delay-200">
                <span className="text-azure mr-1">🤖</span> Powered by Gemini 2.0
              </Badge>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 text-6xl opacity-10 animate-pulse">⚔️</div>
        <div className="absolute bottom-20 right-10 text-6xl opacity-10 animate-pulse animation-delay-500">🛡️</div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 border-t border-border/50">
        <div className="container">
          <h2 className="heading-2 text-center mb-12">
            Everything You Need for Campaign Management
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="parchment p-6 hover:scale-105 transition-transform">
              <div className="text-4xl mb-4">🎙️</div>
              <h3 className="font-display text-xl text-primary-300 mb-2">
                Audio Transcription
              </h3>
              <p className="body-small">
                Upload MP3 recordings up to 4 hours. Our AI accurately transcribes 
                every word, identifying speakers and game events.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="parchment p-6 hover:scale-105 transition-transform">
              <div className="text-4xl mb-4">📜</div>
              <h3 className="font-display text-xl text-primary-300 mb-2">
                AI Summaries
              </h3>
              <p className="body-small">
                Get structured session recaps with key events, NPC encounters, 
                loot discovered, and narrative highlights.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="parchment p-6 hover:scale-105 transition-transform">
              <div className="text-4xl mb-4">🏰</div>
              <h3 className="font-display text-xl text-primary-300 mb-2">
                Campaign Tracking
              </h3>
              <p className="body-small">
                Organize multiple campaigns, track player characters, and maintain 
                a comprehensive history of your adventures.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="parchment p-6 hover:scale-105 transition-transform">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="font-display text-xl text-primary-300 mb-2">
                Discord Integration
              </h3>
              <p className="body-small">
                Automatically post session summaries to your Discord server. 
                Keep your players engaged between sessions.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="parchment p-6 hover:scale-105 transition-transform">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="font-display text-xl text-primary-300 mb-2">
                Multi-DM Support
              </h3>
              <p className="body-small">
                Perfect for West Marches campaigns. Multiple DMs can contribute 
                to the same living world.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="parchment p-6 hover:scale-105 transition-transform">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="font-display text-xl text-primary-300 mb-2">
                Affordable Pricing
              </h3>
              <p className="body-small">
                Just $2-5 per session. Save hours of note-taking and never 
                forget important campaign details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border/50">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="heading-2 mb-6">
              Ready to Level Up Your Campaign?
            </h2>
            <p className="body-text mb-8 text-text-secondary">
              Join thousands of DMs using AI to enhance their storytelling
            </p>
            <SignInButton />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="font-display text-primary-400">⚔️</span>
              <span className="text-sm text-text-secondary">
                © 2025 Worldbuilder. Roll for initiative.
              </span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-text-secondary hover:text-primary-400 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-text-secondary hover:text-primary-400 transition-colors">
                Terms
              </Link>
              <Link href="/docs" className="text-text-secondary hover:text-primary-400 transition-colors">
                Documentation
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}