import { useCallback, useEffect, useRef, useState } from 'react'
import { health, listSongs, outbox, search, type SearchHit } from './api'
import { ResultCard } from './components/ResultCard'
import { Scene } from './components/Scene'
import { SearchConsole, type ConsoleState } from './components/SearchConsole'
import { StatusStrip } from './components/StatusStrip'

const EMPTY: ConsoleState = { q: '', genre: '', yearFrom: '', yearTo: '', size: 10 }

export default function App() {
  const [form, setForm] = useState<ConsoleState>(EMPTY)
  const [hits, setHits] = useState<SearchHit[] | null>(null)
  const [lastQuery, setLastQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState<number | null>(null)

  const [online, setOnline] = useState<boolean | null>(null)
  const [genres, setGenres] = useState<string[]>([])
  const [catalogSize, setCatalogSize] = useState<number | null>(null)
  const [pending, setPending] = useState<number | null>(null)

  const inflight = useRef<AbortController | null>(null)

  // Poll the API so the status strip reflects reality, and derive the genre list
  // from the catalog rather than hardcoding it.
  useEffect(() => {
    let cancelled = false

    const probe = async () => {
      try {
        await health()
        if (cancelled) return
        setOnline(true)

        const [songs, queue] = await Promise.all([listSongs(500), outbox()])
        if (cancelled) return

        setCatalogSize(songs.length)
        setPending(queue.pending)
        setGenres([...new Set(songs.map((s) => s.genre))].filter(Boolean).sort())
      } catch {
        if (!cancelled) setOnline(false)
      }
    }

    probe()
    const timer = setInterval(probe, 10_000)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  const runSearch = useCallback(async () => {
    const q = form.q.trim()
    if (!q) return

    inflight.current?.abort()
    const controller = new AbortController()
    inflight.current = controller

    setBusy(true)
    setError(null)
    const started = performance.now()

    try {
      const results = await search(
        {
          q,
          genre: form.genre || undefined,
          yearFrom: form.yearFrom ? Number(form.yearFrom) : undefined,
          yearTo: form.yearTo ? Number(form.yearTo) : undefined,
          size: form.size,
        },
        controller.signal,
      )

      setHits(results)
      setLastQuery(q)
      setElapsed(performance.now() - started)
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setError((err as Error).message)
      setHits(null)
    } finally {
      if (inflight.current === controller) setBusy(false)
    }
  }, [form])

  const reset = () => {
    inflight.current?.abort()
    setForm(EMPTY)
    setHits(null)
    setError(null)
    setElapsed(null)
    setBusy(false)
  }

  const topScore = hits?.[0]?.score ?? 0

  return (
    <>
      <Scene />

      <main className="shell">
        <header className="masthead">
          <h1 className="masthead__title">Rubber Band</h1>
          <div className="masthead__rule" />
          <p className="masthead__tagline">Search the Archive</p>
          <StatusStrip online={online} catalogSize={catalogSize} pending={pending} />
        </header>

        <SearchConsole
          value={form}
          genres={genres}
          busy={busy}
          onChange={setForm}
          onSubmit={runSearch}
          onReset={reset}
        />

        {busy && (
          <div className="loader">
            <div className="loader__beam" />
          </div>
        )}

        {error && (
          <div className="state state--error">
            <p className="state__title">Transmission failed</p>
            <p className="state__body">The API did not answer. Is it running on port 5225?</p>
            <code className="state__code">{error}</code>
          </div>
        )}

        {!busy && !error && hits === null && (
          <div className="state">
            <p className="state__title">Awaiting input</p>
            <p className="state__body">
              Search titles, artists, albums and liner notes across {catalogSize ?? 40} tracks.
              Pick a suggestion above if you need a starting point.
            </p>
          </div>
        )}

        {!busy && !error && hits?.length === 0 && (
          <div className="state">
            <p className="state__title">No signal</p>
            <p className="state__body">
              Nothing matched &ldquo;{lastQuery}&rdquo;. This is keyword search — try words that
              actually appear in the liner notes, or widen the filters.
            </p>
          </div>
        )}

        {!error && hits && hits.length > 0 && (
          <>
            <div className="results__meta">
              <span>
                <span className="results__count">{hits.length}</span> match
                {hits.length === 1 ? '' : 'es'} for &ldquo;{lastQuery}&rdquo;
              </span>
              {elapsed !== null && <span>{elapsed.toFixed(0)} ms</span>}
            </div>

            <ul className="results__list">
              {hits.map((hit, i) => (
                <ResultCard key={hit.song.id} hit={hit} rank={i} topScore={topScore} query={lastQuery} />
              ))}
            </ul>
          </>
        )}

        <footer className="footer">SQLite · Elasticsearch · BM25 relevance</footer>
      </main>
    </>
  )
}
