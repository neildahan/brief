import { useEffect, useRef } from 'react'
import { FileText } from 'lucide-react'
import { pick } from '../lib/i18n.js'
import { iconFor } from '../lib/tokens.js'
import { BriefMark } from './Brandmark.jsx'

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MessageList({ messages, sending, lang, t, getAgent, getDepartment }) {
  const endRef = useRef(null)
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  return (
    <div className="thin-scroll mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 py-7">
      {messages.map((m) => (
        <Bubble key={m.id} m={m} lang={lang} t={t} getAgent={getAgent} getDepartment={getDepartment} />
      ))}
      {sending && (
        <div className="flex items-center gap-3">
          <BriefMark size={36} />
          <span className="flex items-center gap-2 text-sm text-slate-400">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-marine-400 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-marine-400 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-marine-400" />
            </span>
            {t.thinking}
          </span>
        </div>
      )}
      <div ref={endRef} />
    </div>
  )
}

function Bubble({ m, lang, t, getAgent, getDepartment }) {
  const isUser = m.role === 'user'
  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        {m.attachments?.length > 0 && (
          <div className="flex max-w-[82%] flex-wrap justify-end gap-1.5">
            {m.attachments.map((d) => (
              <span
                key={d.id}
                className="inline-flex items-center gap-1.5 rounded-xl border border-marine-200 bg-marine-50 px-2.5 py-1.5 text-[12px] text-marine-800"
              >
                <FileText size={13} className="text-marine-600" />
                <span className="max-w-[160px] truncate font-medium">{d.name}</span>
                <span className="text-marine-500">{formatSize(d.size)}</span>
              </span>
            ))}
          </div>
        )}
        {m.text && (
          <div className="max-w-[82%] rounded-2xl rounded-ee-md bg-marine-600 px-4 py-3 text-[14.5px] leading-relaxed text-white">
            {m.text}
          </div>
        )}
      </div>
    )
  }

  const agent = m.agentId ? getAgent(m.agentId) : null
  const dept = agent ? getDepartment(agent.departmentId) : null
  const Icon = agent ? iconFor(agent.icon) : null
  const name = agent ? pick(agent, 'name', lang) : t.frontDesk

  return (
    <div className="flex justify-start gap-3">
      {agent ? (
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-marine-600 text-white shadow-[0_2px_8px_rgba(15,95,166,0.22)]">
          <Icon size={16} />
        </span>
      ) : (
        <BriefMark size={36} className="mt-0.5" />
      )}
      <div className="min-w-0 max-w-[82%]">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="font-display text-[13px] font-semibold text-slate-900">{name}</span>
          {dept && <span className="text-[11.5px] text-slate-400">{pick(dept, 'name', lang)}</span>}
        </div>
        <div className="rounded-2xl rounded-ss-md border border-slate-200 bg-white px-4 py-3 text-[14.5px] leading-relaxed text-slate-700">
          {m.text}
        </div>
      </div>
    </div>
  )
}
