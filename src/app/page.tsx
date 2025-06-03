/**
 * Dashboard Page Component
 * 
 * Main dashboard for authenticated users showing their campaigns,
 * recent sessions, and quick access to key features.
 */

import { AuthGuard } from '@/components/auth/AuthButton'
import { UserMenu } from '@/components/auth/AuthButton'
import Link from 'next/link'

/**
 * Protected dashboard page - requires authentication
 * Shows user's campaigns, recent activity, and main navigation
 */
export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Dashboard Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              {/* Logo and Navigation */}
              <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-gray-900">Worldbuilder</span>
                </Link>

                {/* Navigation Menu */}
                <nav className="hidden md:flex items-center gap-6">
                  <Link 
                    href="/dashboard" 
                    className="text-indigo-600 font-medium border-b-2 border-indigo-600 pb-1"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/campaigns" 
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                  >
                    Campaigns
                  </Link>
                  <Link 
                    href="/sessions" 
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Your Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your campaigns, upload sessions, and track your D&D adventures.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Create Campaign */}
            <Link 
              href="/campaigns/new"
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 group"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors duration-200">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Create Campaign</h3>
              <p className="text-sm text-gray-600">Start a new D&D campaign</p>
            </Link>

            {/* Upload Session */}
            <Link 
              href="/sessions/upload"
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors duration-200">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Upload Session</h3>
              <p className="text-sm text-gray-600">Process new audio recording</p>
            </Link>

            {/* Browse Sessions */}
            <Link 
              href="/sessions"
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-200">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Browse Sessions</h3>
              <p className="text-sm text-gray-600">View processed summaries</p>
            </Link>

            {/* Account Settings */}
            <Link 
              href="/settings"
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 group"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors duration-200">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Settings</h3>
              <p className="text-sm text-gray-600">Manage your account</p>
            </Link>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Recent Campaigns */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Campaigns</h2>
                    <Link 
                      href="/campaigns"
                      className="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors duration-200"
                    >
                      View All
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  {/* Placeholder for campaigns - will be replaced with actual data */}
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
                    <p className="text-gray-600 mb-4">
                      Create your first campaign to start processing D&D sessions.
                    </p>
                    <Link 
                      href="/campaigns/new"
                      className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Campaign
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity & Stats */}
            <div className="space-y-6">
              {/* Processing Status */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Processing Status</h2>
                </div>
                <div className="p-6">
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">All systems operational</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Quick Stats</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Campaigns</span>
                    <span className="font-semibold text-gray-900">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Sessions Processed</span>
                    <span className="font-semibold text-gray-900">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Hours Analyzed</span>
                    <span className="font-semibold text-gray-900">0</span>
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