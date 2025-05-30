'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    fetch('https://api.worldbuilder.app/health')
      .then(res => res.json())
      .then(data => {
        setApiStatus(data.status === 'healthy' ? 'online' : 'offline')
      })
      .catch(err => {
        console.error('API error:', err)
        setApiStatus('offline')
      })
  }, [])

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-6xl font-bold mb-4">World Builder</h1>
        <p className="text-xl mb-8 text-gray-300">
          AI-Powered D&D Session Management
        </p>
        
        <div className="mb-12">
          <span className="text-sm text-gray-400">API Status: </span>
          <span className={`font-semibold ${
            apiStatus === 'online' ? 'text-green-500' : 
            apiStatus === 'offline' ? 'text-red-500' : 
            'text-yellow-500'
          }`}>
            {apiStatus === 'checking' && 'Checking...'}
            {apiStatus === 'online' && '✓ Online'}
            {apiStatus === 'offline' && '✗ Offline'}
          </span>
        </div>

        <div className="flex gap-4 justify-center">
          
            href="/campaigns"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
          >
            My Campaigns
          </a>
          
            href="https://api.worldbuilder.app/api/auth/discord"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-colors"
          >
            Login with Discord
          </a>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="p-6 bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">🎙️ Auto-Transcribe</h3>
            <p className="text-gray-400">Upload session audio and get instant transcriptions</p>
          </div>
          <div className="p-6 bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">🤖 AI Summaries</h3>
            <p className="text-gray-400">Generate summaries in your campaign's unique style</p>
          </div>
          <div className="p-6 bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">📊 Track Progress</h3>
            <p className="text-gray-400">Monitor character growth and story arcs</p>
          </div>
        </div>
      </div>
    </main>
  )
}