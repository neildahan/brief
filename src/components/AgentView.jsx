import { ArrowLeft, ArrowRight, MessageSquarePlus, ListChecks } from 'lucide-react'
import { pick } from '../lib/i18n.js'
import { iconFor } from '../lib/tokens.js'

export default function AgentView({
  lang,
  t,
  agent,
  getDepartment,
  nav,
  onStartChat,
}) {
  if (!agent) return null
  const Back = lang === 'he' ? ArrowRight : ArrowLeft
  const dept = getDepartment(agent.departmentId)
  const Icon = iconFor(agent.icon)
  const tasks = agent.samplePrompts?.[lang] || agent.samplePrompts?.en || []

  return (
    <div className="thin-scroll h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-7 py-7">
        <button
          onClick={() => nav({ name: 'department', deptId: agent.departmentId })}
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-marine-600"
        >
          <Back size={15} />
          {pick(dept, 'name', lang)}
        </button>

        <div className="flex items-start gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-marine-600 text-white shadow-[0_6px_20px_rgba(15,95,166,0.30)]">
            <Icon size={32} />
          </span>
          <div className="min-w-0 flex-1">
            <button
              onClick={() => nav({ name: 'department', deptId: agent.departmentId })}
              className="text-[12px] font-semibold text-marine-600"
            >
              {pick(dept, 'name', lang)}
            </button>
            <h1 className="font-display text-[28px] font-semibold tracking-tight text-slate-900">
              {pick(agent, 'name', lang)}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{pick(agent, 'role', lang)}</p>
            {agent.tags?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {agent.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[12px] text-slate-500">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => onStartChat(agent.id)}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-marine-600 px-5 py-3 font-display text-sm font-semibold text-white shadow-[0_2px_8px_rgba(15,95,166,0.22)] transition hover:bg-marine-700"
        >
          <MessageSquarePlus size={17} />
          {t.startChat}
        </button>

        {tasks.length > 0 && (
          <div className="mt-9">
            <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              <ListChecks size={13} />
              {t.sampleTasks}
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {tasks.map((task) => (
                <button
                  key={task}
                  onClick={() => onStartChat(agent.id)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-start text-sm text-slate-600 transition hover:border-marine-300 hover:bg-marine-50/40 hover:text-slate-800"
                >
                  {task}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
