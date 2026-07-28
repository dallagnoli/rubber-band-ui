import type { ReactNode } from 'react'
import type { SearchHit } from '../api'

interface Props {
  hit: SearchHit
  rank: number
  /** Highest score in the current result set, used to scale the meter. */
  topScore: number
  /** Raw query, used to highlight matched words in the notes. */
  query: string
}

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Highlights query words in the notes. Matches on a 4+ character prefix so it
 * roughly tracks the server's English stemmer — "recording" lights up "recorded".
 */
function highlight(text: string, query: string): ReactNode {
  const terms = query
    .split(/\s+/)
    .map((term) => term.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter((term) => term.length >= 3)

  if (terms.length === 0) return text

  const pattern = terms
    .map((term) => `${escapeRegex(term.slice(0, Math.max(4, Math.ceil(term.length * 0.7))))}\\p{L}*`)
    .join('|')

  const parts = text.split(new RegExp(`(${pattern})`, 'giu'))
  const matcher = new RegExp(`^(?:${pattern})$`, 'iu')

  return parts.map((part, i) =>
    matcher.test(part) ? <mark key={i}>{part}</mark> : part,
  )
}

export function ResultCard({ hit, rank, topScore, query }: Props) {
  const { song, score } = hit
  const fill = topScore > 0 ? Math.max(6, (score / topScore) * 100) : 0

  return (
    <li className="card" style={{ animationDelay: `${Math.min(rank * 35, 350)}ms` }}>
      <div className="card__head">
        <div>
          <h3 className="card__title">{song.title}</h3>
          <p className="card__artist">{song.artist}</p>
        </div>
        <span className="card__rank">{String(rank + 1).padStart(2, '0')}</span>
      </div>

      <div className="card__tags">
        <span className="tag tag--year">{song.year}</span>
        <span className="tag">{song.genre}</span>
        {song.album && <span className="tag tag--album">{song.album}</span>}
      </div>

      <p className="card__notes">{highlight(song.notes, query)}</p>

      <div className="score">
        <span className="score__label">Relevance</span>
        <span className="score__track">
          <span className="score__fill" style={{ width: `${fill}%` }} />
        </span>
        <span className="score__value">{score.toFixed(2)}</span>
      </div>
    </li>
  )
}
