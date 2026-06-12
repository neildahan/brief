import { pick } from '../lib/i18n.js'
import { iconFor } from '../lib/tokens.js'

export default function DepartmentsOverview({ lang, t, departments, agentsByDept, nav }) {
  return (
    <div className="thin-scroll h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-7 py-7">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
          {t.departments}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t.tagline}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dep) => {
            const Icon = iconFor(dep.icon)
            const count = (agentsByDept[dep.id] || []).length
            return (
              <button
                key={dep.id}
                onClick={() => nav({ name: 'department', deptId: dep.id })}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 text-start transition hover:border-marine-300 hover:shadow-[0_4px_16px_rgba(13,17,23,0.06)]"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-marine-50 text-marine-600">
                    <Icon size={24} />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[12px] font-medium text-slate-500">
                    {count} {t.workers}
                  </span>
                </div>
                <h2 className="mt-4 font-display text-[15px] font-semibold text-slate-900">
                  {pick(dep, 'name', lang)}
                </h2>
                <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-slate-500">
                  {pick(dep, 'description', lang)}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
