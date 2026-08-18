import { useEffect, useState } from 'react'
import { SLOT_LABELS, whatsappHref } from '../../lib/test-drive'
import { studioGet, studioSend } from '../api'

type Lead = {
  id: string
  reference: string
  name: string
  email: string
  phone: string
  city: string
  vehicleName: string
  preferredDate: string
  preferredSlot: keyof typeof SLOT_LABELS | string
  message: string
  source: string
  status: string
  adminNotes: string
  createdAt: string
}

const statuses = ['new', 'contacted', 'scheduled', 'completed', 'cancelled']

function slotLabel(slot: string) {
  return SLOT_LABELS[slot as keyof typeof SLOT_LABELS] ?? slot
}

export function StudioLeadPage() {
  const [rows, setRows] = useState<Lead[]>([])
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setRows(await studioGet<Lead[]>('/studio/leads/'))
  }

  useEffect(() => {
    load().catch((err: Error) => setError(err.message))
  }, [])

  async function patch(id: string, body: Partial<Lead>) {
    await studioSend(`/studio/leads/${id}/`, 'PATCH', body)
    await load()
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this request?')) return
    await studioSend(`/studio/leads/${id}/`, 'DELETE')
    await load()
  }

  return (
    <div>
      <p className="eyebrow">Inbox</p>
      <h1 className="display mt-3 text-4xl">Test drives</h1>
      {error && <p className="mt-6 text-scarlet-soft">{error}</p>}
      <div className="mt-8 space-y-5">
        {rows.length === 0 && <p className="text-white/55">No requests yet. New appointments from /test-drive land here.</p>}
        {rows.map((row) => (
          <article key={row.id} className="crystal crystal-ink p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ice">{row.reference}</p>
                <h2 className="display mt-2 text-2xl">{row.name}</h2>
                <p className="mt-1 text-sm text-white/55">
                  {row.vehicleName} · {row.city} · {row.preferredDate} · {slotLabel(row.preferredSlot)}
                </p>
              </div>
              <button type="button" onClick={() => void remove(row.id)} className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-scarlet-soft">
                Delete
              </button>
            </div>

            <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="crystal px-3 py-3">
                <dt className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-white/40">Email</dt>
                <dd className="mt-1">
                  <a className="text-sm text-ice hover:text-white" href={`mailto:${row.email}`}>
                    {row.email}
                  </a>
                </dd>
              </div>
              <div className="crystal px-3 py-3">
                <dt className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-white/40">Mobile</dt>
                <dd className="mt-1 text-sm">
                  {row.phone ? (
                    <a className="text-ice hover:text-white" href={`tel:${row.phone}`}>
                      {row.phone}
                    </a>
                  ) : (
                    <span className="text-white/40">Not given</span>
                  )}
                </dd>
              </div>
              <div className="crystal px-3 py-3">
                <dt className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-white/40">When</dt>
                <dd className="mt-1 text-sm text-white/80">
                  {row.preferredDate}
                  <span className="mt-1 block text-white/55">{slotLabel(row.preferredSlot)}</span>
                </dd>
              </div>
            </dl>

            {row.message ? (
              <p className="mt-4 border-l-2 border-scarlet/60 pl-3 text-sm leading-relaxed text-white/70">{row.message}</p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`mailto:${row.email}?subject=${encodeURIComponent(`Kaka Motors ${row.reference}`)}`}
                className="focus-scarlet border border-white/15 px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-white/80 hover:border-white/40"
              >
                Email
              </a>
              {row.phone ? (
                <>
                  <a
                    href={`tel:${row.phone}`}
                    className="focus-scarlet border border-white/15 px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-white/80 hover:border-white/40"
                  >
                    Call
                  </a>
                  <a
                    href={whatsappHref(row.phone)}
                    target="_blank"
                    rel="noreferrer"
                    className="focus-scarlet border border-white/15 px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-white/80 hover:border-white/40"
                  >
                    WhatsApp
                  </a>
                </>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <select
                className="focus-scarlet border border-white/15 bg-ink px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.16em]"
                value={row.status}
                onChange={(event) => void patch(row.id, { status: event.target.value })}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <input
                className="focus-scarlet min-w-[16rem] flex-1 border border-white/15 bg-transparent px-3 py-2 text-sm"
                defaultValue={row.adminNotes}
                placeholder="Studio notes"
                onBlur={(event) => {
                  if (event.target.value !== row.adminNotes) void patch(row.id, { adminNotes: event.target.value })
                }}
              />
            </div>
            <p className="mt-3 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-white/30">
              Received {new Date(row.createdAt).toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}
              {row.source ? ` · ${row.source}` : ''}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}
