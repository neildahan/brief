import { ArrowLeft, ArrowRight } from 'lucide-react'
import { pick } from '../lib/i18n.js'
import { iconFor } from '../lib/tokens.js'
import AgentCard from './AgentCard.jsx'

export default function DepartmentView({
  lang,
  t,
  department,
  agentsByDept,
  nav,
  onStartChat,
}) {
  if (!department) return null
  const Back = lang === 'he' ? ArrowRight : ArrowLeft
  const Icon = iconFor(department.icon)
  const deptAgents = agentsByDept[department.id] || []

  return (
    <div className="thin-scroll h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-7 py-7">
        <button
          onClick={() => nav({ name: 'workspace' })}
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-marine-600"
        >
          <Back size={15} />
          {t.backToWorkspace}
        </button>

        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-marine-600 text-white shadow-[0_6px_20px_rgba(15,95,166,0.28)]">
            <Icon size={28} />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
              {pick(department, 'name', lang)}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
              {pick(department, 'description', lang)}
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-baseline gap-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {t.teamOf} {pick(department, 'name', lang)}
          </h2>
          <span className="text-[12px] text-slate-400">
            · {deptAgents.length} {t.workers}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {deptAgents.map((a) => (
            <AgentCard
              key={a.id}
              agent={a}
              lang={lang}
              t={t}
              onOpen={(id) => nav({ name: 'agent', agentId: id })}
              onStartChat={onStartChat}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
