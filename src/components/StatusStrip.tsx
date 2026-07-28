interface Props {
  online: boolean | null
  catalogSize: number | null
  pending: number | null
}

/** Live read on the API: reachable, how many rows, how much sync work is queued. */
export function StatusStrip({ online, catalogSize, pending }: Props) {
  const dotClass =
    online === null ? 'status__dot' : online ? 'status__dot status__dot--ok' : 'status__dot status__dot--down'

  return (
    <div className="status">
      <span className="status__item">
        <span className={dotClass} />
        api&nbsp;<span className="status__value">{online === null ? '…' : online ? 'online' : 'offline'}</span>
      </span>

      <span className="status__item">
        tracks&nbsp;<span className="status__value">{catalogSize ?? '—'}</span>
      </span>

      <span className="status__item">
        outbox&nbsp;<span className="status__value">{pending ?? '—'}</span>
      </span>
    </div>
  )
}
