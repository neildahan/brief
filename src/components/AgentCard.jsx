import { MessageSquarePlus } from 'lucide-react'
import { pick } from '../lib/i18n.js'
import { iconFor } from '../lib/tokens.js'

// A worker card — used in the department "team" grid. The card is full-height
// (h-full) and the content area flexes, so the Start-chat button always pins to
// the bottom and lines up across every card in the row.
export default function AgentCard({ agent, lang, t, onOpen, onStartChat }) {
  const Icon = iconFor(agent.icon)
  return (
    <div className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-marine-300 hover:shadow-[0_4px_16px_rgba(13,17,23,0.06)]">
      <div className="flex-1">
        <button onClick={() => onOpen(agent.id)} className="flex items-start gap-3 text-start">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-marine-50 text-marine-600">
            <Icon size={22} />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-sm font-semibold text-slate-900">
              {pick(agent, 'name', lang)}
            </span>
            <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-slate-500">
              {pick(agent, 'role', lang)}
            </span>
          </span>
        </button>

        {agent.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {agent.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => onStartChat(agent.id)}
        className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl bg-marine-50 px-3 py-2 font-display text-[13px] font-semibold text-marine-700 transition hover:bg-marine-100"
      >
        <MessageSquarePlus size={15} />
        {t.startChat}
      </button>
    </div>
  )
}
