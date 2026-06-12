import { useMemo, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Plus, Clock, Search, LayoutGrid } from 'lucide-react'
import { pick } from '../lib/i18n.js'
import { iconFor } from '../lib/tokens.js'
import { BriefLogo } from './Brandmark.jsx'

export default function Sidebar({
  lang,
  t,
  departments,
  agentsByDept,
  view,
  nav,
  onNewChat,
}) {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(() => new Set())
  const Chevron = lang === 'he' ? ChevronLeft : ChevronRight

  const toggle = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return departments
      .map((dep) => {
        const depAgents = agentsByDept[dep.id] || []
        if (!q) return { dep, agents: depAgents }
        const depHit =
          pick(dep, 'name', lang).toLowerCase().includes(q) ||
          pick(dep, 'name', 'en').toLowerCase().includes(q)
        const hits = depAgents.filter(
          (a) =>
            pick(a, 'name', lang).toLowerCase().includes(q) ||
            pick(a, 'name', 'en').toLowerCase().includes(q) ||
            (a.tags || []).some((tag) => tag.toLowerCase().includes(q)),
        )
        if (depHit) return { dep, agents: depAgents }
        if (hits.length) return { dep, agents: hits, forceOpen: true }
        return null
      })
      .filter(Boolean)
  }, [departments, agentsByDept, query, lang])

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-e border-white/5 bg-[#131a2e] text-slate-300">
      {/* Brand */}
      <div className="flex items-center border-b border-white/5 px-5 py-4">
        <BriefLogo variant="white" className="h-7 w-auto" />
      </div>

      {/* New chat + primary nav */}
      <div className="flex flex-col gap-1 px-3 pt-3">
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 rounded-lg bg-marine-600 px-4 py-2.5 font-display text-sm font-semibold text-white shadow-[0_2px_10px_rgba(15,95,166,0.35)] transition hover:bg-marine-500"
        >
          <Plus size={16} />
          {t.newChat}
        </button>
        <NavItem
          icon={LayoutGrid}
          label={t.allDepartments}
          active={view.name === 'departments'}
          onClick={() => nav({ name: 'departments' })}
        />
        <NavItem
          icon={Clock}
          label={t.history}
          active={view.name === 'history'}
          onClick={() => nav({ name: 'history' })}
        />
      </div>

      {/* Search */}
      <div className="px-3 pb-1 pt-3">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 focus-within:border-marine-400/60 focus-within:bg-white/10">
          <Search size={15} className="text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Departments group label */}
      <div className="px-5 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {t.departments}
      </div>

      {/* Grouped tree */}
      <nav className="thin-scroll-dark min-h-0 flex-1 overflow-y-auto px-2.5 pb-4">
        {filtered.map(({ dep, agents, forceOpen }) => {
          const open = forceOpen || expanded.has(dep.id)
          const DepIcon = iconFor(dep.icon)
          return (
            <div key={dep.id} className="mb-0.5">
              <button
                onClick={() => toggle(dep.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start transition hover:bg-white/5 ${
                  open ? 'bg-white/[0.07]' : ''
                }`}
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-md transition ${
                    open ? 'bg-marine-600 text-white' : 'bg-white/5 text-slate-400'
                  }`}
                >
                  <DepIcon size={15} />
                </span>
                <span
                  className={`min-w-0 flex-1 truncate text-[13.5px] ${
                    open ? 'font-semibold text-white' : 'font-medium text-slate-300'
                  }`}
                >
                  {pick(dep, 'name', lang)}
                </span>
                <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-slate-500">
                  {agents.length}
                </span>
                <ChevronDown
                  size={15}
                  className={`shrink-0 text-slate-500 transition ${open ? 'rotate-180' : ''}`}
                />
              </button>

              {open && (
                <ul className="mb-1.5 ms-[26px] border-s border-white/10 ps-2">
                  <li>
                    <button
                      onClick={() => nav({ name: 'department', deptId: dep.id })}
                      className="my-0.5 flex w-full items-center gap-1.5 rounded-md px-3 py-1 text-start text-[12px] text-slate-500 transition hover:text-marine-300"
                    >
                      {t.viewDepartment}
                      <Chevron size={12} />
                    </button>
                  </li>
                  {agents.map((a) => {
                    const AgentIcon = iconFor(a.icon)
                    const active = view.name === 'agent' && view.agentId === a.id
                    return (
                      <li key={a.id} className="relative">
                        {active && (
                          <span className="absolute inset-y-1.5 -start-2 w-0.5 rounded-full bg-marine-400" />
                        )}
                        <button
                          onClick={() => nav({ name: 'agent', agentId: a.id })}
                          className={`my-0.5 flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-start text-[13px] transition hover:bg-white/5 ${
                            active ? 'bg-marine-600/20 font-semibold text-white' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span
                            className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md ${
                              active ? 'bg-marine-600 text-white' : 'bg-white/5 text-slate-400'
                            }`}
                          >
                            <AgentIcon size={12} />
                          </span>
                          <span className="min-w-0 flex-1 truncate">{pick(a, 'name', lang)}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="px-3 py-6 text-center text-sm text-slate-600">—</div>
        )}
      </nav>
    </aside>
  )
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-lg px-4 py-2 text-sm font-medium transition ${
        active ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  )
}
