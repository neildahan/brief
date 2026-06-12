import { Languages } from 'lucide-react'
import { LANGS, pick } from '../lib/i18n.js'

export default function TopBar({
  lang,
  setLang,
  t,
  isMock,
  view,
  activeAgent,
  getAgent,
  getDepartment,
}) {
  const other = lang === 'he' ? 'en' : 'he'

  // Title + kicker derived from the current view.
  let kicker = ''
  let title = t.frontDesk
  if (view?.name === 'agent') {
    const agent = getAgent?.(view.agentId)
    const dept = agent ? getDepartment?.(agent.departmentId) : null
    kicker = pick(dept, 'name', lang)
    title = pick(agent, 'name', lang)
  } else if (view?.name === 'department') {
    kicker = t.departments
    title = pick(getDepartment?.(view.deptId), 'name', lang)
  } else if (view?.name === 'departments') {
    title = t.departments
  } else if (view?.name === 'history') {
    title = t.history
  } else if (activeAgent) {
    // Workspace chat with a specialist active — the agent owns the conversation.
    kicker = pick(getDepartment?.(activeAgent.departmentId), 'name', lang)
    title = pick(activeAgent, 'name', lang)
  } else {
    title = t.frontDesk
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="min-w-0">
        {kicker && (
          <div className="truncate text-[11.5px] font-semibold text-marine-600">{kicker}</div>
        )}
        <div className="truncate font-display text-[18px] font-semibold tracking-tight text-slate-900">
          {title}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-500">
          <span
            className={`h-[7px] w-[7px] rounded-full ${
              isMock ? 'bg-amber-400 shadow-[0_0_0_3px_#fdf2d6]' : 'bg-emerald-500 shadow-[0_0_0_3px_#e6f6ef]'
            }`}
          />
          {isMock ? t.mockBadge : t.online}
        </span>
        <button
          onClick={() => setLang(other)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          title={LANGS[other].label}
        >
          <Languages size={15} />
          {LANGS[other].short}
        </button>
      </div>
    </header>
  )
}
