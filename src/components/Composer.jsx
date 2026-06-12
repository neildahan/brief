import { useMemo, useRef, useState } from 'react'
import { Send, AtSign, X, Paperclip, FileText, ShieldCheck } from 'lucide-react'
import { pick } from '../lib/i18n.js'
import { iconFor } from '../lib/tokens.js'
import { dataverseService, IS_MOCK } from '../services/dataverse.js'

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// The chat input. Press "@" to summon any worker; attach documents with the
// paperclip — uploads go ONLY through the seam (in-tenant storage in live;
// memory-only metadata in mock), never to an external API.
export default function Composer({
  lang,
  t,
  agents,
  getDepartment,
  activeAgent,
  onSummon,
  onSend,
  sending,
}) {
  const [text, setText] = useState('')
  const [menu, setMenu] = useState({ open: false, query: '' })
  const [attachments, setAttachments] = useState([])
  const [attaching, setAttaching] = useState(false)
  const inputRef = useRef(null)
  const fileRef = useRef(null)

  const matches = useMemo(() => {
    if (!menu.open) return []
    const q = menu.query.trim().toLowerCase()
    return agents
      .filter(
        (a) =>
          !q ||
          pick(a, 'name', lang).toLowerCase().includes(q) ||
          pick(a, 'name', 'en').toLowerCase().includes(q) ||
          (a.tags || []).some((tag) => tag.toLowerCase().includes(q)),
      )
      .slice(0, 6)
  }, [menu, agents, lang])

  function handleChange(e) {
    const v = e.target.value
    setText(v)
    const m = v.match(/@([\p{L}\w-]*)$/u)
    if (m) setMenu({ open: true, query: m[1] })
    else setMenu({ open: false, query: '' })
  }

  function pickAgent(agent) {
    onSummon(agent.id)
    setText((prev) => prev.replace(/@([\p{L}\w-]*)$/u, '').trimStart())
    setMenu({ open: false, query: '' })
    inputRef.current?.focus()
  }

  // Route files through the seam. In mock this returns metadata only — no bytes
  // are read, stored, or sent anywhere.
  async function handleFiles(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setAttaching(true)
    try {
      const docs = await Promise.all(
        files.map((file) => dataverseService.attachDocument({ file })),
      )
      setAttachments((prev) => [...prev, ...docs])
    } finally {
      setAttaching(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function removeAttachment(id) {
    setAttachments((prev) => prev.filter((d) => d.id !== id))
  }

  function submit() {
    const value = text.trim()
    if ((!value && attachments.length === 0) || sending) return
    onSend(value || (lang === 'he' ? '(מסמך מצורף)' : '(attached document)'), attachments)
    setText('')
    setAttachments([])
    setMenu({ open: false, query: '' })
  }

  function handleKeyDown(e) {
    if (menu.open && matches.length && e.key === 'Enter') {
      e.preventDefault()
      pickAgent(matches[0])
      return
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const canSend = (text.trim() || attachments.length > 0) && !sending

  return (
    <div className="relative mx-auto w-full max-w-3xl px-5 pb-5">
      {/* Summon menu */}
      {menu.open && matches.length > 0 && (
        <div className="absolute bottom-full start-5 end-5 mb-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(13,17,23,0.12)]">
          <div className="border-b border-slate-100 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            {t.summonAgent}
          </div>
          {matches.map((a) => {
            const dep = getDepartment(a.departmentId)
            const Icon = iconFor(a.icon)
            return (
              <button
                key={a.id}
                onClick={() => pickAgent(a)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-start transition hover:bg-slate-50"
              >
                <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-marine-50 text-marine-600">
                  <Icon size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-[13.5px] font-semibold text-slate-800">
                    {pick(a, 'name', lang)}
                  </span>
                  <span className="block truncate text-[12px] text-slate-400">
                    {pick(dep, 'name', lang)}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Active-agent indicator (non-removable — the agent owns the chat;
          "New chat" resets to the front desk, @ switches to another specialist) */}
      {activeAgent && (
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[12px] text-slate-400">{t.talkingTo}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-marine-50 px-3 py-1 text-[12px] font-semibold text-marine-700">
            {(() => {
              const Icon = iconFor(activeAgent.icon)
              return <Icon size={13} />
            })()}
            {pick(activeAgent, 'name', lang)}
          </span>
        </div>
      )}

      {/* Attachment chips + safety note */}
      {attachments.length > 0 && (
        <div className="mb-2">
          <div className="flex flex-wrap gap-2">
            {attachments.map((d) => (
              <span
                key={d.id}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[12.5px] text-slate-600"
              >
                <FileText size={14} className="text-marine-600" />
                <span className="max-w-[180px] truncate font-medium text-slate-700">{d.name}</span>
                <span className="text-slate-400">{formatSize(d.size)}</span>
                <button onClick={() => removeAttachment(d.id)} className="opacity-60 hover:opacity-100">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck size={12} className={IS_MOCK ? 'text-amber-500' : 'text-emerald-500'} />
            {IS_MOCK ? t.attachDemo : t.attachInTenant}
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.rtf,.xlsx,.xls,.png,.jpg,.jpeg"
        className="hidden"
        onChange={handleFiles}
      />

      <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_1px_2px_rgba(13,17,23,0.04)] focus-within:border-marine-400 focus-within:ring-[3px] focus-within:ring-marine-50">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={attaching}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          title={t.attachDocument}
        >
          <Paperclip size={18} className={attaching ? 'animate-pulse' : ''} />
        </button>
        <button
          onClick={() => {
            setText((p) => p + '@')
            setMenu({ open: true, query: '' })
            inputRef.current?.focus()
          }}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          title={t.summonAgent}
        >
          <AtSign size={18} />
        </button>
        <textarea
          ref={inputRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={t.inputPlaceholder}
          className="max-h-40 min-h-[2.25rem] w-full resize-none bg-transparent px-1 py-1.5 text-[14.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
        <button
          onClick={submit}
          disabled={!canSend}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-marine-600 text-white transition hover:bg-marine-700 disabled:opacity-40"
          title={t.send}
        >
          <Send size={16} className={lang === 'he' ? 'scale-x-[-1]' : ''} />
        </button>
      </div>
    </div>
  )
}
