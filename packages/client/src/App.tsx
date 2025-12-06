import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial count on mount
  useEffect(() => {
    fetchCount()
  }, [])

  const fetchCount = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/count')
      if (!response.ok) {
        throw new Error('Failed to fetch count')
      }
      const data = await response.json()
      setCount(data.count)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch count')
    } finally {
      setLoading(false)
    }
  }

  const incrementCount = async () => {
    try {
      setError(null)
      const response = await fetch('/api/count/increment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('Failed to increment count')
      }
      const data = await response.json()
      setCount(data.count)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to increment count')
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        {loading ? (
          <p>Loading count...</p>
        ) : error ? (
          <div>
            <p style={{ color: 'red' }}>Error: {error}</p>
            <button onClick={fetchCount}>Retry</button>
          </div>
        ) : (
          <button onClick={incrementCount}>
            count is {count}
          </button>
        )}
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <p>Testing deployment speed</p>
    </>
  )
}

export default App
