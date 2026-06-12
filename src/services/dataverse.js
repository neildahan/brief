// ─────────────────────────────────────────────────────────────────────────────
// THE integration seam. The ONLY module that talks to the backend.
//
// Components import `dataverseService` from here — never a connector directly.
// In dev this is an in-memory MOCK (VITE_USE_MOCK !== 'false'). The `live` object
// has the SAME shape and is wired to Dataverse + a cloud flow → Copilot Studio
// when going to a sandbox/prod org. The React app never calls an external API.
// ─────────────────────────────────────────────────────────────────────────────

// 1. CONTRACT — placeholder Dataverse logical names. Remap before going live.
export const ENTITY_CONTRACT = {
  department: {
    logicalName: 'cr1c4_department',
    fields: {
      id: 'cr1c4_departmentid',
      nameEn: 'cr1c4_name_en',
      nameHe: 'cr1c4_name_he',
      descriptionEn: 'cr1c4_description_en',
      descriptionHe: 'cr1c4_description_he',
      icon: 'cr1c4_icon',
      accent: 'cr1c4_accent',
      order: 'cr1c4_order',
    },
  },
  agent: {
    logicalName: 'cr1c4_agent',
    fields: {
      id: 'cr1c4_agentid',
      departmentId: 'cr1c4_departmentid',
      nameEn: 'cr1c4_name_en',
      nameHe: 'cr1c4_name_he',
      roleEn: 'cr1c4_role_en',
      roleHe: 'cr1c4_role_he',
      // The Copilot Studio target (standalone agent id OR topic key). Generic on
      // purpose so the tenant topology can change without a React change.
      copilotAgentId: 'cr1c4_copilot_agent_id',
      icon: 'cr1c4_icon',
      tags: 'cr1c4_tags',
      // Suggested-prompt seeds, JSON-encoded { en: [...], he: [...] }.
      samplePrompts: 'cr1c4_sample_prompts',
    },
  },
  conversation: {
    logicalName: 'cr1c4_conversation',
    fields: {
      id: 'cr1c4_conversationid',
      titleEn: 'cr1c4_title_en',
      titleHe: 'cr1c4_title_he',
      agentId: 'cr1c4_agentid',
      departmentId: 'cr1c4_departmentid',
      createdOn: 'createdon',
    },
  },
  message: {
    logicalName: 'cr1c4_message',
    fields: {
      id: 'cr1c4_messageid',
      conversationId: 'cr1c4_conversationid',
      role: 'cr1c4_role', // 'user' | 'agent'
      agentId: 'cr1c4_agentid',
      text: 'cr1c4_text',
      createdOn: 'createdon',
    },
  },
  document: {
    logicalName: 'cr1c4_document',
    fields: {
      id: 'cr1c4_documentid',
      conversationId: 'cr1c4_conversationid',
      name: 'cr1c4_name',
      size: 'cr1c4_size',
      contentType: 'cr1c4_contenttype',
      // LIVE: the file bytes live in a Dataverse FILE column (or SharePoint),
      // inside the tenant — never in this repo, never through an external API.
      fileColumn: 'cr1c4_file',
      createdOn: 'createdon',
    },
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. MOCK — in-memory, deterministic, NO client data. Default in dev.
//    Seeds 5 core departments and their workers. The roster is data, so the
//    sidebar and agent cards are fully driven by what is returned here.
// ─────────────────────────────────────────────────────────────────────────────

const uid = (() => {
  let n = 1000
  return (prefix = 'id') => `${prefix}-${++n}`
})()

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Departments — accent + icon are token keys resolved in src/lib/tokens.js.
const departments = [
  {
    id: 'dep-corp',
    nameEn: 'Corporate & Capital Markets',
    nameHe: 'תאגידים ושוק ההון',
    descriptionEn: 'M&A, securities, governance and shareholder matters.',
    descriptionHe: 'מיזוגים ורכישות, ניירות ערך, ממשל תאגידי ובעלי מניות.',
    icon: 'building2',
    accent: 'indigo',
    order: 1,
  },
  {
    id: 'dep-lit',
    nameEn: 'Litigation & Dispute Resolution',
    nameHe: 'ליטיגציה ויישוב סכסוכים',
    descriptionEn: 'Pleadings, case-law research, class actions and arbitration.',
    descriptionHe: 'כתבי טענות, מחקר פסיקה, תובענות ייצוגיות ובוררות.',
    icon: 'scale',
    accent: 'rose',
    order: 2,
  },
  {
    id: 'dep-re',
    nameEn: 'Real Estate & Construction',
    nameHe: 'נדל"ן ובנייה',
    descriptionEn: 'Leases, urban renewal, land registration and betterment tax.',
    descriptionHe: 'חוזי שכירות, התחדשות עירונית, רישום מקרקעין והיטל השבחה.',
    icon: 'landmark',
    accent: 'amber',
    order: 3,
  },
  {
    id: 'dep-tech',
    nameEn: 'High-Tech & Venture Capital',
    nameHe: 'הייטק והון סיכון',
    descriptionEn: 'Term sheets, SAFEs, cap tables and IP assignment.',
    descriptionHe: 'מסמכי תנאים, SAFE, טבלאות הון והקצאת קניין רוחני.',
    icon: 'cpu',
    accent: 'emerald',
    order: 4,
  },
  {
    id: 'dep-tax',
    nameEn: 'Tax',
    nameHe: 'מיסים',
    descriptionEn: 'Corporate tax, VAT and international tax planning.',
    descriptionHe: 'מס חברות, מע"מ ותכנון מס בינלאומי.',
    icon: 'receipt',
    accent: 'sky',
    order: 5,
  },
]

// Agents ("workers"). copilotAgentId is the generic Copilot Studio target.
const agents = [
  // Corporate
  {
    id: 'agt-ma',
    departmentId: 'dep-corp',
    nameEn: 'M&A Agent',
    nameHe: 'סוכן מיזוגים ורכישות',
    roleEn: 'Drafts and reviews M&A agreements, SPAs and disclosure schedules.',
    roleHe: 'מנסח ובוחן הסכמי מיזוג ורכישה, הסכמי SPA ולוחות גילוי.',
    copilotAgentId: 'copilot:corp-ma',
    icon: 'handshake',
    tags: ['M&A', 'SPA', 'due diligence'],
    samplePrompts: {
      en: ['Summarize the key risks in this SPA', 'Draft a disclosure schedule outline'],
      he: ['סכם את הסיכונים המרכזיים בהסכם זה', 'נסח שלד ללוח גילוי'],
    },
  },
  {
    id: 'agt-shareholder',
    departmentId: 'dep-corp',
    nameEn: 'Shareholder Agreement Agent',
    nameHe: 'סוכן הסכמי בעלי מניות',
    roleEn: 'Drafts and reviews shareholder and investment agreements.',
    roleHe: 'מנסח ובוחן הסכמי בעלי מניות והשקעה.',
    copilotAgentId: 'copilot:corp-sha',
    icon: 'users',
    tags: ['SHA', 'investment'],
    samplePrompts: {
      en: ['Review the drag-along clause', 'Compare these two SHAs'],
      he: ['בחן את סעיף ה-Drag Along', 'השווה בין שני ההסכמים'],
    },
  },
  {
    id: 'agt-governance',
    departmentId: 'dep-corp',
    nameEn: 'Corporate Governance Agent',
    nameHe: 'סוכן ממשל תאגידי',
    roleEn: 'Board resolutions, governance policies and compliance checklists.',
    roleHe: 'החלטות דירקטוריון, מדיניות ממשל תאגידי ורשימות ציות.',
    copilotAgentId: 'copilot:corp-gov',
    icon: 'gavel',
    tags: ['governance', 'board'],
    samplePrompts: {
      en: ['Draft a board resolution for this approval', 'Check this policy for compliance gaps'],
      he: ['נסח החלטת דירקטוריון לאישור זה', 'בדוק פערי ציות במדיניות זו'],
    },
  },
  // Litigation
  {
    id: 'agt-pleadings',
    departmentId: 'dep-lit',
    nameEn: 'Pleadings Drafter',
    nameHe: 'מנסח כתבי טענות',
    roleEn: 'Drafts statements of claim, defenses and motions.',
    roleHe: 'מנסח כתבי תביעה, כתבי הגנה ובקשות.',
    copilotAgentId: 'copilot:lit-pleadings',
    icon: 'fileText',
    tags: ['pleadings', 'motions'],
    samplePrompts: {
      en: ['Draft a statement of claim from these facts', 'Outline a motion to dismiss'],
      he: ['נסח כתב תביעה מהעובדות הללו', 'בנה שלד לבקשת סילוק על הסף'],
    },
  },
  {
    id: 'agt-caselaw',
    departmentId: 'dep-lit',
    nameEn: 'Case-Law Researcher',
    nameHe: 'חוקר פסיקה',
    roleEn: 'Finds and summarizes relevant case law and precedent.',
    roleHe: 'מאתר ומסכם פסיקה ותקדימים רלוונטיים.',
    copilotAgentId: 'copilot:lit-caselaw',
    icon: 'search',
    tags: ['research', 'precedent'],
    samplePrompts: {
      en: ['Find precedent on this contractual question', 'Summarize the leading ruling here'],
      he: ['מצא תקדים בשאלה החוזית הזו', 'סכם את פסק הדין המנחה בנושא'],
    },
  },
  {
    id: 'agt-classaction',
    departmentId: 'dep-lit',
    nameEn: 'Class-Action Analyst',
    nameHe: 'אנליסט תובענות ייצוגיות',
    roleEn: 'Analyzes class-action exposure, certification and strategy.',
    roleHe: 'מנתח חשיפה לתובענות ייצוגיות, אישור ואסטרטגיה.',
    copilotAgentId: 'copilot:lit-class',
    icon: 'usersRound',
    tags: ['class action', 'certification'],
    samplePrompts: {
      en: ['Assess certification risk for this claim', 'Draft a response to a certification motion'],
      he: ['העריך סיכון אישור התובענה', 'נסח תגובה לבקשת אישור'],
    },
  },
  // Real Estate
  {
    id: 'agt-lease',
    departmentId: 'dep-re',
    nameEn: 'Lease Review Agent',
    nameHe: 'סוכן בחינת חוזי שכירות',
    roleEn: 'Reviews commercial and residential leases against firm standards.',
    roleHe: 'בוחן חוזי שכירות מסחריים ולמגורים מול סטנדרט המשרד.',
    copilotAgentId: 'copilot:re-lease',
    icon: 'keyRound',
    tags: ['lease', 'review'],
    samplePrompts: {
      en: ['Flag tenant-unfriendly terms in this lease', 'Summarize the renewal and exit options'],
      he: ['סמן תנאים לרעת השוכר בחוזה', 'סכם את אפשרויות החידוש והיציאה'],
    },
  },
  {
    id: 'agt-urban',
    departmentId: 'dep-re',
    nameEn: 'Urban Renewal Agent',
    nameHe: 'סוכן התחדשות עירונית',
    roleEn: 'TAMA 38 / Pinui-Binui agreements and resident consents.',
    roleHe: 'הסכמי תמ"א 38 / פינוי-בינוי והסכמות דיירים.',
    copilotAgentId: 'copilot:re-urban',
    icon: 'buildingCrane',
    tags: ['TAMA 38', 'pinui-binui'],
    samplePrompts: {
      en: ['Review this Pinui-Binui agreement', 'List the resident consent requirements'],
      he: ['בחן הסכם פינוי-בינוי זה', 'פרט את דרישות הסכמת הדיירים'],
    },
  },
  {
    id: 'agt-betterment',
    departmentId: 'dep-re',
    nameEn: 'Betterment Tax Agent',
    nameHe: 'סוכן היטל השבחה',
    roleEn: 'Assesses betterment levy exposure and objection grounds.',
    roleHe: 'מעריך חשיפה להיטל השבחה ועילות להשגה.',
    copilotAgentId: 'copilot:re-betterment',
    icon: 'calculator',
    tags: ['betterment', 'levy'],
    samplePrompts: {
      en: ['Estimate the betterment exposure here', 'Draft grounds for an objection'],
      he: ['העריך את חשיפת ההיטל כאן', 'נסח עילות להשגה'],
    },
  },
  // High-Tech & VC
  {
    id: 'agt-termsheet',
    departmentId: 'dep-tech',
    nameEn: 'Term Sheet Agent',
    nameHe: 'סוכן מסמכי תנאים',
    roleEn: 'Drafts and benchmarks venture financing term sheets.',
    roleHe: 'מנסח ומשווה מסמכי תנאים למימון.',
    copilotAgentId: 'copilot:tech-termsheet',
    icon: 'scrollText',
    tags: ['term sheet', 'financing'],
    samplePrompts: {
      en: ['Benchmark this term sheet against market', 'Explain the liquidation preference'],
      he: ['השווה מסמך תנאים זה לשוק', 'הסבר את עדיפות הפירוק'],
    },
  },
  {
    id: 'agt-safe',
    departmentId: 'dep-tech',
    nameEn: 'SAFE / Convertible Agent',
    nameHe: 'סוכן SAFE והמרה',
    roleEn: 'Drafts SAFEs and convertible notes; models conversion.',
    roleHe: 'מנסח מסמכי SAFE ושטרי המרה; מדמה המרה.',
    copilotAgentId: 'copilot:tech-safe',
    icon: 'fileSignature',
    tags: ['SAFE', 'convertible'],
    samplePrompts: {
      en: ['Model conversion at this cap', 'Draft a post-money SAFE'],
      he: ['דמה המרה ברף השווי הזה', 'נסח SAFE post-money'],
    },
  },
  {
    id: 'agt-ip',
    departmentId: 'dep-tech',
    nameEn: 'IP Assignment Agent',
    nameHe: 'סוכן הקצאת קניין רוחני',
    roleEn: 'IP assignment, invention disclosure and OSS compliance.',
    roleHe: 'הקצאת קניין רוחני, גילוי המצאה וציות קוד פתוח.',
    copilotAgentId: 'copilot:tech-ip',
    icon: 'lightbulb',
    tags: ['IP', 'OSS'],
    samplePrompts: {
      en: ['Review this IP assignment clause', 'Check OSS licenses for conflicts'],
      he: ['בחן את סעיף הקצאת הקניין הרוחני', 'בדוק התנגשויות ברישיונות קוד פתוח'],
    },
  },
  // Tax
  {
    id: 'agt-corptax',
    departmentId: 'dep-tax',
    nameEn: 'Corporate Tax Agent',
    nameHe: 'סוכן מס חברות',
    roleEn: 'Corporate tax structuring, rulings and memos.',
    roleHe: 'מבנה מס חברות, החלטות מיסוי וחוות דעת.',
    copilotAgentId: 'copilot:tax-corp',
    icon: 'briefcase',
    tags: ['corporate tax', 'ruling'],
    samplePrompts: {
      en: ['Outline a tax-efficient structure', 'Draft a pre-ruling request'],
      he: ['התווה מבנה יעיל מבחינת מס', 'נסח בקשה להחלטת מיסוי מקדמית'],
    },
  },
  {
    id: 'agt-vat',
    departmentId: 'dep-tax',
    nameEn: 'VAT Agent',
    nameHe: 'סוכן מע"מ',
    roleEn: 'VAT treatment, exemptions and zero-rating analysis.',
    roleHe: 'טיפול במע"מ, פטורים וניתוח מע"מ בשיעור אפס.',
    copilotAgentId: 'copilot:tax-vat',
    icon: 'percent',
    tags: ['VAT', 'exemption'],
    samplePrompts: {
      en: ['Analyze VAT treatment of this transaction', 'When does zero-rating apply here?'],
      he: ['נתח את חבות המע"מ בעסקה זו', 'מתי חל שיעור אפס כאן?'],
    },
  },
  {
    id: 'agt-inttax',
    departmentId: 'dep-tax',
    nameEn: 'International Tax Agent',
    nameHe: 'סוכן מיסוי בינלאומי',
    roleEn: 'Treaty analysis, withholding and transfer pricing.',
    roleHe: 'ניתוח אמנות, ניכוי במקור ומחירי העברה.',
    copilotAgentId: 'copilot:tax-intl',
    icon: 'globe',
    tags: ['treaty', 'transfer pricing'],
    samplePrompts: {
      en: ['Check withholding under the relevant treaty', 'Summarize transfer-pricing risk'],
      he: ['בדוק ניכוי במקור לפי האמנה הרלוונטית', 'סכם סיכון מחירי העברה'],
    },
  },
]

// Mutable in-memory conversation store (seeded with a little history).
let conversations = [
  {
    id: 'conv-seed-1',
    titleEn: 'Lease review — Rothschild 12',
    titleHe: 'בחינת חוזה שכירות — רוטשילד 12',
    agentId: 'agt-lease',
    departmentId: 'dep-re',
    createdOn: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: 'conv-seed-2',
    titleEn: 'Precedent on penalty clauses',
    titleHe: 'תקדים בעניין תניות פיצוי מוסכם',
    agentId: 'agt-caselaw',
    departmentId: 'dep-lit',
    createdOn: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
]

let messages = [
  {
    id: 'msg-seed-1',
    conversationId: 'conv-seed-1',
    role: 'user',
    agentId: 'agt-lease',
    text: 'Please flag any tenant-unfriendly terms in the attached lease.',
    createdOn: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: 'msg-seed-2',
    conversationId: 'conv-seed-1',
    role: 'agent',
    agentId: 'agt-lease',
    text: 'I reviewed the lease. Three terms stand out as tenant-unfriendly: (1) the annual escalation is uncapped, (2) the landlord may relocate the tenant on 30 days notice, and (3) the repair obligation covers structural elements. I recommend negotiating each.',
    createdOn: new Date(Date.now() - 1000 * 60 * 60 * 26 + 4000).toISOString(),
  },
]

// Canned reply generator for the mock — simulates a Copilot Studio worker.
function simulatedReply(agent, prompt, lang, attachments = []) {
  const name = agent ? (lang === 'he' ? agent.nameHe : agent.nameEn) : 'BriefAI'
  const docNames = attachments.map((d) => d.name).join(', ')
  if (lang === 'he') {
    const docLine = attachments.length
      ? `צירפת ${attachments.length} מסמך/ים (${docNames}). בסביבת הלקוח אקרא אותם מתוך ה-Dataverse/SharePoint בתוך ה-Tenant. `
      : ''
    return `שלום, כאן ${name}. קיבלתי את הבקשה: "${prompt}". ` + docLine +
      `במצב הדגמה אני מדמה תשובה — בסביבת הלקוח הבקשה תנותב ל-Copilot Studio בתוך ה-Tenant ` +
      `ותחזור עם ניתוח משפטי, הפניות ומסמך טיוטה. אין כאן קריאה ל-API חיצוני.`
  }
  const docLine = attachments.length
    ? `You attached ${attachments.length} document(s) (${docNames}); in the client's environment I'd read them from Dataverse/SharePoint inside the tenant. `
    : ''
  return `Hi, ${name} here. I received: "${prompt}". ` + docLine +
    `This is a simulated reply in mock mode — in the client's environment this is routed to a ` +
    `Copilot Studio agent inside the tenant and returns legal analysis, citations and a draft. ` +
    `No external API is ever called from the React app.`
}

const mock = {
  async listDepartments() {
    await sleep(120)
    return [...departments].sort((a, b) => a.order - b.order)
  },

  async listAgents() {
    await sleep(120)
    return [...agents]
  },

  async getAgent(agentId) {
    await sleep(60)
    return agents.find((a) => a.id === agentId) || null
  },

  async listConversations() {
    await sleep(100)
    return [...conversations].sort(
      (a, b) => new Date(b.createdOn) - new Date(a.createdOn),
    )
  },

  async listMessages(conversationId) {
    await sleep(80)
    return messages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdOn) - new Date(b.createdOn))
  },

  async createConversation({ agentId = null, titleEn, titleHe }) {
    await sleep(80)
    const agent = agentId ? agents.find((a) => a.id === agentId) : null
    const conv = {
      id: uid('conv'),
      titleEn: titleEn || (agent ? agent.nameEn : 'New conversation'),
      titleHe: titleHe || (agent ? agent.nameHe : 'שיחה חדשה'),
      agentId,
      departmentId: agent ? agent.departmentId : null,
      createdOn: new Date().toISOString(),
    }
    conversations = [conv, ...conversations]
    return conv
  },

  // Attach a document to the chat.
  // MOCK: returns metadata ONLY. The file's bytes are never persisted, never
  // written to disk, and never sent anywhere — so a stray real document dropped
  // in during dev cannot leak. In LIVE this uploads to a Dataverse file column
  // (or SharePoint) via a Power Platform connector, fully inside the tenant.
  async attachDocument({ conversationId = null, file }) {
    await sleep(220) // simulate the in-tenant upload round-trip
    return {
      id: uid('doc'),
      conversationId,
      name: file.name,
      size: file.size,
      contentType: file.type || 'application/octet-stream',
      stored: false, // demo: not persisted
      createdOn: new Date().toISOString(),
    }
  },

  // The AI seam. In live mode this triggers a cloud flow → Copilot Studio agent
  // in the client's tenant. Here it appends the user message and a simulated
  // worker reply, then returns both. NEVER calls an external API.
  async invokeAgent({ conversationId, agentId = null, prompt, lang = 'en', attachments = [] }) {
    const agent = agentId ? agents.find((a) => a.id === agentId) : null
    const userMsg = {
      id: uid('msg'),
      conversationId,
      role: 'user',
      agentId,
      text: prompt,
      attachments,
      createdOn: new Date().toISOString(),
    }
    messages = [...messages, userMsg]

    await sleep(700) // simulate the round-trip to Copilot in the tenant

    const agentMsg = {
      id: uid('msg'),
      conversationId,
      role: 'agent',
      agentId,
      text: simulatedReply(agent, prompt, lang, attachments),
      createdOn: new Date().toISOString(),
    }
    messages = [...messages, agentMsg]
    return { userMessage: userMsg, agentMessage: agentMsg }
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. LIVE — same shape as mock. Wraps `pac code add-data-source`-generated typed
//    services (Dataverse) + the cloud-flow connector that reaches Copilot Studio.
//    Filled in only when wiring to a sandbox/prod org. Keep the shape identical.
// ─────────────────────────────────────────────────────────────────────────────
const notWired = (m) => async () => {
  throw new Error(
    `dataverseService.${m}() is not wired to live data yet. ` +
      `Implement the live object in src/services/dataverse.js (see ARCHITECTURE.md §6), ` +
      `then run against a SANDBOX org with VITE_USE_MOCK=false.`,
  )
}

const live = {
  listDepartments: notWired('listDepartments'),
  listAgents: notWired('listAgents'),
  getAgent: notWired('getAgent'),
  listConversations: notWired('listConversations'),
  listMessages: notWired('listMessages'),
  createConversation: notWired('createConversation'),
  attachDocument: notWired('attachDocument'),
  invokeAgent: notWired('invokeAgent'),
}

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const dataverseService = USE_MOCK ? mock : live
export const IS_MOCK = USE_MOCK
