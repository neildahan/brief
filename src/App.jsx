import { useEffect, useMemo, useState, useCallback } from 'react'
import PowerProvider from './PowerProvider.jsx'
import { dataverseService, IS_MOCK } from './services/dataverse.js'
import { LANGS, strings } from './lib/i18n.js'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import Workspace from './components/Workspace.jsx'
import DepartmentsOverview from './components/DepartmentsOverview.jsx'
import DepartmentView from './components/DepartmentView.jsx'
import AgentView from './components/AgentView.jsx'
import HistoryView from './components/HistoryView.jsx'

export default function App() {
  const [lang, setLang] = useState('he')
  const [departments, setDepartments] = useState([])
  const [agents, setAgents] = useState([])
  // view: { name: 'workspace'|'department'|'agent'|'history', deptId?, agentId? }
  const [view, setView] = useState({ name: 'workspace' })

  // The single live conversation shown in the central chat.
  const [conversation, setConversation] = useState(null) // { id }
  const [activeAgentId, setActiveAgentId] = useState(null)
  const [messages, setMessages] = useState([])
  const [sending, setSending] = useState(false)

  const t = useMemo(() => strings(lang), [lang])

  // Reflect language direction on the document element.
  useEffect(() => {
    const root = document.documentElement
    root.lang = lang
    root.dir = LANGS[lang].dir
  }, [lang])

  // Load the firm roster once.
  useEffect(() => {
    let alive = true
    Promise.all([
      dataverseService.listDepartments(),
      dataverseService.listAgents(),
    ]).then(([deps, ags]) => {
      if (!alive) return
      setDepartments(deps)
      setAgents(ags)
    })
    return () => {
      alive = false
    }
  }, [])

  const agentsByDept = useMemo(() => {
    const map = {}
    for (const a of agents) {
      ;(map[a.departmentId] ||= []).push(a)
    }
    return map
  }, [agents])

  const getAgent = useCallback(
    (id) => agents.find((a) => a.id === id) || null,
    [agents],
  )
  const getDepartment = useCallback(
    (id) => departments.find((d) => d.id === id) || null,
    [departments],
  )

  // Ensure there is a live conversation bound to the active agent.
  const ensureConversation = useCallback(
    async (agentId) => {
      if (conversation) return conversation
      const conv = await dataverseService.createConversation({ agentId })
      const next = { id: conv.id }
      setConversation(next)
      return next
    },
    [conversation],
  )

  // Send a message to the active agent (or the front desk if none).
  const sendMessage = useCallback(
    async (prompt, attachments = []) => {
      if (!prompt.trim() || sending) return
      setSending(true)
      try {
        const conv = await ensureConversation(activeAgentId)
        const { userMessage, agentMessage } = await dataverseService.invokeAgent({
          conversationId: conv.id,
          agentId: activeAgentId,
          prompt,
          lang,
          attachments,
        })
        setMessages((prev) => [...prev, userMessage, agentMessage])
      } finally {
        setSending(false)
      }
    },
    [activeAgentId, ensureConversation, lang, sending],
  )

  // Summon a worker into the current chat (sets/switches the active agent).
  const summonAgent = useCallback((agentId) => setActiveAgentId(agentId), [])

  // Run a ready-made workflow: open a fresh chat with the agent and send the
  // starter prompt in one shot.
  const runWorkflow = useCallback(
    async (agentId, prompt) => {
      if (sending) return
      setSending(true)
      try {
        const conv = await dataverseService.createConversation({ agentId })
        setConversation({ id: conv.id })
        setActiveAgentId(agentId)
        setMessages([])
        setView({ name: 'workspace' })
        const { userMessage, agentMessage } = await dataverseService.invokeAgent({
          conversationId: conv.id,
          agentId,
          prompt,
          lang,
        })
        setMessages([userMessage, agentMessage])
      } finally {
        setSending(false)
      }
    },
    [lang, sending],
  )

  // Start a fresh conversation with a given agent and jump to the workspace chat.
  const startConversationWith = useCallback(async (agentId) => {
    const conv = await dataverseService.createConversation({ agentId })
    setConversation({ id: conv.id })
    setActiveAgentId(agentId)
    setMessages([])
    setView({ name: 'workspace' })
  }, [])

  // Reopen a past conversation in the central chat.
  const openConversation = useCallback(async (convId) => {
    const all = await dataverseService.listConversations()
    const conv = all.find((c) => c.id === convId)
    const msgs = await dataverseService.listMessages(convId)
    setConversation({ id: convId })
    setActiveAgentId(conv?.agentId ?? null)
    setMessages(msgs)
    setView({ name: 'workspace' })
  }, [])

  const newChat = useCallback(() => {
    setConversation(null)
    setActiveAgentId(null)
    setMessages([])
    setView({ name: 'workspace' })
  }, [])

  const nav = useCallback((next) => setView(next), [])

  const shared = {
    lang,
    t,
    departments,
    agents,
    agentsByDept,
    getAgent,
    getDepartment,
    nav,
  }

  return (
    <PowerProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-white text-slate-900">
        <Sidebar
          {...shared}
          view={view}
          onNewChat={newChat}
        />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar
            lang={lang}
            setLang={setLang}
            t={t}
            isMock={IS_MOCK}
            view={view}
            activeAgent={getAgent(activeAgentId)}
            {...shared}
          />
          <main className="min-h-0 flex-1 overflow-hidden bg-white">
            {view.name === 'workspace' && (
              <Workspace
                {...shared}
                conversation={conversation}
                messages={messages}
                sending={sending}
                onSend={sendMessage}
                onSummon={summonAgent}
                onOpenConversation={openConversation}
                onRunWorkflow={runWorkflow}
                activeAgent={getAgent(activeAgentId)}
              />
            )}
            {view.name === 'departments' && (
              <DepartmentsOverview {...shared} />
            )}
            {view.name === 'department' && (
              <DepartmentView
                {...shared}
                department={getDepartment(view.deptId)}
                onStartChat={startConversationWith}
              />
            )}
            {view.name === 'agent' && (
              <AgentView
                {...shared}
                agent={getAgent(view.agentId)}
                onStartChat={startConversationWith}
              />
            )}
            {view.name === 'history' && (
              <HistoryView {...shared} onOpen={openConversation} />
            )}
          </main>
        </div>
      </div>
    </PowerProvider>
  )
}
