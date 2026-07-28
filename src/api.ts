const BASE = import.meta.env.VITE_API_BASE ?? '/api'

export interface Song {
  id: number
  title: string
  artist: string
  album: string
  year: number
  genre: string
  notes: string
}

export interface SearchHit {
  song: Song
  score: number
}

export interface SearchQuery {
  q: string
  genre?: string
  yearFrom?: number
  yearTo?: number
  size?: number
}

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${BASE}${path}`, { signal })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || `${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export function search(query: SearchQuery, signal?: AbortSignal): Promise<SearchHit[]> {
  const params = new URLSearchParams({ q: query.q })

  if (query.genre) params.set('genre', query.genre)
  if (query.yearFrom != null) params.set('yearFrom', String(query.yearFrom))
  if (query.yearTo != null) params.set('yearTo', String(query.yearTo))
  params.set('size', String(query.size ?? 12))

  return get<SearchHit[]>(`/search?${params}`, signal)
}

export function listSongs(limit = 500, signal?: AbortSignal): Promise<Song[]> {
  return get<Song[]>(`/songs?limit=${limit}`, signal)
}

export function health(signal?: AbortSignal): Promise<{ status: string }> {
  return get<{ status: string }>('/health', signal)
}

export function outbox(signal?: AbortSignal): Promise<{ pending: number }> {
  return get<{ pending: number }>('/admin/outbox', signal)
}
