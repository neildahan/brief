import { useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { pick } from '../lib/i18n.js'
import { iconFor } from '../lib/tokens.js'
import { WORKFLOWS } from '../lib/workflows.js'
import { dataverseService } from '../services/dataverse.js'
import { BriefMark } from './Brandmark.jsx'
import MessageList from './MessageList.jsx'
import Composer from './Composer.jsx'

export default function Workspace({
  lang,
  t,
  agents,
  getAgent,
  getDepartment,
  conversation,
  messages,
  sending,
  onSend,
  onSummon,
  onOpenConversation,
  onRunWorkflow,
  activeAgent,
}) {
  const empty = messages.length === 0

  return (
    <div className="flex h-full flex-col">
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
        {empty ? (
          activeAgent ? (
            <AgentEmpty lang={lang} activeAgent={activeAgent} onSend={onSend} />
          ) : (
            <Launchpad
              lang={lang}
              t={t}
              onOpenConversation={onOpenConversation}
              onRunWorkflow={onRunWorkflow}
            />
          )
        ) : (
          <MessageList
            messages={messages}
            sending={sending}
            lang={lang}
            t={t}
            getAgent={getAgent}
            getDepartment={getDepartment}
          />
        )}
      </div>

      <Composer
        lang={lang}
        t={t}
        agents={agents}
        getDepartment={getDepartment}
        activeAgent={activeAgent}
        onSummon={onSummon}
        onSend={onSend}
        sending={sending}
      />
    </div>
  )
}

// Empty state when an agent is already active — agent-focused, centered.
function AgentEmpty({ lang, activeAgent, onSend }) {
  const Icon = iconFor(activeAgent.icon)
  const prompts = activeAgent.samplePrompts?.[lang] || activeAgent.samplePrompts?.en || []
  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col items-center justify-center px-5 py-10 text-center">
      <span className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-marine-600 text-white shadow-[0_6px_20px_rgba(15,95,166,0.30)]">
        <Icon size={28} />
      </span>
      <h1 className="font-display text-[26px] font-semibold tracking-tight text-slate-900">
        {pick(activeAgent, 'name', lang)}
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        {pick(activeAgent, 'role', lang)}
      </p>
      {prompts.length > 0 && (
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          {prompts.map((p) => (
            <button
              key={p}
              onClick={() => onSend(p)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] text-slate-600 transition hover:border-marine-300 hover:bg-marine-50/50 hover:text-marine-700"
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Front-desk launchpad — calm greeting + workflow chips + a single "continue" line.
function Launchpad({ lang, t, onOpenConversation, onRunWorkflow }) {
  const [last, setLast] = useState(null)

  useEffect(() => {
    let alive = true
    dataverseService.listConversations().then((c) => alive && setLast(c[0] || null))
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col items-center justify-center px-5 py-10 text-center">
      <BriefMark size={56} />
      <h1 className="mt-4 font-display text-[27px] font-semibold tracking-tight text-slate-900">
        {t.askAnything}
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">{t.askAnythingSub}</p>

      {/* Workflow suggestion chips */}
      <div className="mt-7 flex flex-wrap justify-center gap-2">
        {WORKFLOWS.map((wf) => {
          const Icon = iconFor(wf.icon)
          const prompt = lang === 'he' ? wf.promptHe : wf.promptEn
          return (
            <button
              key={wf.id}
              onClick={() => onRunWorkflow?.(wf.agentId, prompt)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-medium text-slate-600 transition hover:border-marine-300 hover:bg-marine-50/50 hover:text-marine-700"
            >
              <Icon size={15} className="text-marine-500" />
              {pick(wf, 'title', lang)}
            </button>
          )
        })}
      </div>

      {/* Single, subtle continue line */}
      {last && (
        <button
          onClick={() => onOpenConversation?.(last.id)}
          className="mt-8 inline-flex max-w-full items-center gap-2 text-[13px] text-slate-400 transition hover:text-marine-600"
        >
          <RotateCcw size={14} className="shrink-0" />
          <span className="shrink-0">{t.resumeLabel}</span>
          <span className="truncate font-medium text-slate-500">{pick(last, 'title', lang)}</span>
        </button>
      )}
    </div>
  )
}
