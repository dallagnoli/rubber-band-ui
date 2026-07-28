import type { FormEvent } from 'react'

export interface ConsoleState {
  q: string
  genre: string
  yearFrom: string
  yearTo: string
  size: number
}

interface Props {
  value: ConsoleState
  genres: string[]
  busy: boolean
  onChange: (next: ConsoleState) => void
  onSubmit: () => void
  onReset: () => void
}

/** Terms that exist in the seeded catalog, so a first-time visitor gets real hits. */
const SUGGESTIONS = ['Dylan', 'piano', 'guitar riff', 'studio overdubs', 'protest', 'theremin']

export function SearchConsole({ value, genres, busy, onChange, onSubmit, onReset }: Props) {
  const set = <K extends keyof ConsoleState>(key: K, next: ConsoleState[K]) =>
    onChange({ ...value, [key]: next })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="console" onSubmit={submit}>
      <div className="console__row">
        <input
          className="search-input"
          value={value.q}
          onChange={(e) => set('q', e.target.value)}
          placeholder="Search titles, artists, albums, liner notes…"
          aria-label="Search query"
          autoFocus
        />
        <button className="btn" type="submit" disabled={busy || !value.q.trim()}>
          {busy ? 'Scanning' : 'Search'}
        </button>
        <button className="btn btn--ghost" type="button" onClick={onReset} disabled={busy}>
          Reset
        </button>
      </div>

      <div className="filters">
        <label className="field">
          <span className="field__label">Genre</span>
          <select value={value.genre} onChange={(e) => set('genre', e.target.value)}>
            <option value="">Any</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Year from</span>
          <input
            type="number"
            inputMode="numeric"
            value={value.yearFrom}
            onChange={(e) => set('yearFrom', e.target.value)}
            placeholder="1939"
          />
        </label>

        <label className="field">
          <span className="field__label">Year to</span>
          <input
            type="number"
            inputMode="numeric"
            value={value.yearTo}
            onChange={(e) => set('yearTo', e.target.value)}
            placeholder="1991"
          />
        </label>

        <label className="field">
          <span className="field__label">Results</span>
          <select value={value.size} onChange={(e) => set('size', Number(e.target.value))}>
            {[5, 10, 20, 40].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="suggestions">
        <span className="suggestions__label">Try</span>
        {SUGGESTIONS.map((term) => (
          <button
            key={term}
            type="button"
            className="chip"
            onClick={() => onChange({ ...value, q: term })}
          >
            {term}
          </button>
        ))}
      </div>
    </form>
  )
}
