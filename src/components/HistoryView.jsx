import { useEffect, useState } from 'react'
import { Clock, MessageSquare } from 'lucide-react'
import { dataverseService } from '../services/dataverse.js'
import { pick } from '../lib/i18n.js'
import { iconFor } from '../lib/tokens.js'

function relativeTime(iso, lang) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diff / 60000)
  const rtf = new Intl.RelativeTimeFormat(lang === 'he' ? 'he' : 'en', { numeric: 'auto' })
  if (mins < 60) return rtf.format(-mins, 'minute')
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return rtf.format(-hrs, 'hour')
  return rtf.format(-Math.round(hrs / 24), 'day')
}

export default function HistoryView({ lang, t, getAgent, getDepartment, onOpen }) {
  const [conversations, setConversations] = useState(null)

  useEffect(() => {
    let alive = true
    dataverseService.listConversations().then((c) => alive && setConversations(c))
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="thin-scroll h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-7 py-7">
        <div className="mb-5 flex items-center gap-2.5">
          <Clock size={18} className="text-marine-600" />
          <h1 className="font-display text-xl font-semibold tracking-tight text-slate-900">{t.history}</h1>
        </div>

        {conversations && conversations.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center text-sm text-slate-400">
            {t.noHistory}
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {(conversations || []).map((c) => {
            const agent = c.agentId ? getAgent(c.agentId) : null
            const Icon = agent ? iconFor(agent.icon) : MessageSquare
            return (
              <button
                key={c.id}
                onClick={() => onOpen?.(c.id)}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-start transition hover:border-marine-300 hover:bg-marine-50/40"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-marine-50 text-marine-600">
                  <Icon size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-sm font-semibold text-slate-800">
                    {pick(c, 'title', lang)}
                  </span>
                  <span className="block truncate text-[12px] text-slate-400">
                    {agent ? pick(agent, 'name', lang) : t.frontDesk}
                  </span>
                </span>
                <span className="shrink-0 text-[12px] text-slate-400">
                  {relativeTime(c.createdOn, lang)}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
