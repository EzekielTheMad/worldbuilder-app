/**
 * Dashboard Page Component
 * 
 * Main dashboard for authenticated users showing their campaigns,
 * recent sessions, and quick access to key features.
 */

'use client'

import { AuthGuard } from '@/components/auth/AuthButton'
import { UserMenu } from '@/components/auth/AuthButton'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Campaign {
  id: string
  name: string
  description?: string
  memberCount: number
  sessionCount: number
  lastSessionAt?: string
  userRole: string
  owner: {
    username: string
    image?: string
  }
}

/**
 * Campaigns List Component
 * Fetches and displays user's campaigns or creation prompt
 */
function CampaignsList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns')
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns')
      }
      
      const data = await response.json()
      if (data.success) {
        setCampaigns(data.data.campaigns)
      } else {
        throw new Error(data.error?.message || 'Failed to fetch campaigns')
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err)
      setError(err instanceof Error ? err.message : 'Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-300">Loading campaigns...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Error Loading Campaigns</h3>
        <p className="text-slate-300 mb-4">{error}</p>
        <button 
          onClick={fetchCampaigns}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No campaigns yet</h3>
        <p className="text-slate-300 mb-4">
          Create your first campaign to start processing D&D sessions.
        </p>
        <Link 
          href="/campaigns/new"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-indigo-600/25"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Campaign
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <div key={campaign.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 hover:bg-slate-800/70 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">
                <Link 
                  href={`/campaigns/${campaign.id}`}
                  className="hover:text-indigo-400 transition-colors duration-200"
                >
                  {campaign.name}
                </Link>
              </h3>
              {campaign.description && (
                <p className="text-sm text-slate-300">{campaign.description}</p>
              )}
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex-shrink-0">
              {campaign.userRole}
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 text-sm text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {campaign.memberCount} members
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {campaign.sessionCount} sessions
              </span>
            </div>
            <div className="text-right">
              <p>DM: {campaign.owner.username}</p>
              {campaign.lastSessionAt && (
                <p>Last session: {new Date(campaign.lastSessionAt).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Protected dashboard page - requires authentication
 * Shows user's campaigns, recent activity, and main navigation
 */
export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Dashboard Header */}
        <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              {/* Logo and Navigation */}
              <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Worldbuilder
                  </span>
                </Link>

                {/* Navigation Menu - Hidden on mobile */}
                <nav className="hidden md:flex items-center gap-6">
                  <Link 
                    href="/dashboard" 
                    className="text-indigo-400 font-medium relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-indigo-500 after:to-purple-500 after:rounded-full"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/campaigns" 
                    className="text-slate-300 hover:text-white font-medium transition-colors duration-200"
                  >
                    Campaigns
                  </Link>
                  <Link 
                    href="/sessions" 
                    className="text-slate-300 hover:text-white font-medium transition-colors duration-200"
                  >
                    Sessions
                  </Link>
                </nav>
              </div>

              {/* User Menu */}
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Welcome to Your Dashboard
              </span>
            </h1>
            <p className="text-slate-300">
              Manage your campaigns, upload sessions, and track your D&D adventures.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Create Campaign */}
            <Link 
              href="/campaigns/new"
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-lg hover:bg-slate-800/70 hover:border-indigo-500/50 transition-all duration-300 group hover:shadow-lg hover:shadow-indigo-500/10"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-1">Create Campaign</h3>
              <p className="text-sm text-slate-300">Start a new D&D campaign</p>
            </Link>

            {/* Upload Session */}
            <Link 
              href="/sessions/upload"
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-lg hover:bg-slate-800/70 hover:border-indigo-500/50 transition-all duration-300 group hover:shadow-lg hover:shadow-indigo-500/10"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-1">Upload Session</h3>
              <p className="text-sm text-slate-300">Process new audio recording</p>
            </Link>

            {/* Browse Sessions */}
            <Link 
              href="/sessions"
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-lg hover:bg-slate-800/70 hover:border-indigo-500/50 transition-all duration-300 group hover:shadow-lg hover:shadow-indigo-500/10"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-1">Browse Sessions</h3>
              <p className="text-sm text-slate-300">View processed summaries</p>
            </Link>

            {/* Account Settings */}
            <Link 
              href="/settings"
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-lg hover:bg-slate-800/70 hover:border-indigo-500/50 transition-all duration-300 group hover:shadow-lg hover:shadow-indigo-500/10"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-1">Settings</h3>
              <p className="text-sm text-slate-300">Manage your account</p>
            </Link>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Recent Campaigns */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg">
                <div className="p-6 border-b border-slate-700/50">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-white">Recent Campaigns</h2>
                    <Link 
                      href="/campaigns"
                      className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors duration-200"
                    >
                      View All
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  <CampaignsList />
                </div>
              </div>
            </div>

            {/* Recent Activity & Stats */}
            <div className="space-y-6">
              {/* Processing Status */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg">
                <div className="p-6 border-b border-slate-700/50">
                  <h2 className="text-lg font-semibold text-white">Processing Status</h2>
                </div>
                <div className="p-6">
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-500/25">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-300">All systems operational</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg">
                <div className="p-6 border-b border-slate-700/50">
                  <h2 className="text-lg font-semibold text-white">Quick Stats</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Total Campaigns</span>
                    <span className="font-semibold text-white">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Sessions Processed</span>
                    <span className="font-semibold text-white">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Hours Analyzed</span>
                    <span className="font-semibold text-white">0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}