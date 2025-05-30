import { useState, useEffect } from 'react'

export default function Home() {
  const [apiStatus, setApiStatus] = useState('Checking...')

  useEffect(() => {
    fetch('https://api.worldbuilder.app/health')
      .then(res => res.json())
      .then(data => setApiStatus(data.status === 'healthy' ? 'Online' : 'Connected'))
      .catch(err => {
        console.error('API error:', err);
        setApiStatus('Offline')
      })
  }, [])

  return (
    <div className="container">
      <h1>World Builder</h1>
      <p>D&D Session Management Platform</p>
      <p>API Status: <span className={apiStatus === 'Online' || apiStatus === 'Connected' ? 'status-ok' : 'status-error'}>{apiStatus}</span></p>
      
      <div className="links">
        <a href="/campaigns">My Campaigns</a>
        <a href="/login">Login with Discord</a>
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 50px;
          background: #1a1a1a;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;
          text-align: center;
        }
        
        h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        .status-ok {
          color: #4CAF50;
        }
        
        .status-error {
          color: #f44336;
        }
        
        .links {
          margin-top: 2rem;
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        
        .links a {
          padding: 0.75rem 1.5rem;
          background: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          transition: background 0.2s;
        }
        
        .links a:hover {
          background: #45a049;
        }
      `}</style>
    </div>
  )
}