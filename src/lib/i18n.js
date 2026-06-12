// Bilingual strings + direction. The app holds a `lang` in App state ('he' | 'en')
// and flips `document.documentElement.dir`. Data carries its own he/en fields
// (e.g. department.nameHe / nameEn) — this file is only for static UI chrome.

export const LANGS = {
  he: { dir: 'rtl', label: 'עברית', short: 'HE' },
  en: { dir: 'ltr', label: 'English', short: 'EN' },
}

export const STRINGS = {
  he: {
    appName: 'BriefAI',
    tagline: 'מרחב העבודה המשפטי של המשרד',
    departments: 'מחלקות',
    agents: 'סוכנים',
    chat: 'שיחה',
    allDepartments: 'כל המחלקות',
    searchPlaceholder: 'חיפוש מחלקה או סוכן…',
    newChat: 'שיחה חדשה',
    history: 'היסטוריה',
    frontDesk: 'דלפק הקבלה',
    frontDeskSub: 'שאלו כל דבר — או הזמינו סוכן מומחה',
    askAnything: 'על מה עובדים היום?',
    askAnythingSub: 'כתבו שאלה, או הקישו @ כדי להזמין סוכן מאחת המחלקות',
    inputPlaceholder: 'כתבו הודעה…  (הקישו @ להזמנת סוכן)',
    send: 'שליחה',
    summonAgent: 'הזמנת סוכן',
    talkingTo: 'משוחחים עם',
    suggestedPrompts: 'הצעות לפתיחה',
    sampleTasks: 'משימות לדוגמה',
    startChat: 'התחל שיחה',
    backToWorkspace: 'חזרה למרחב העבודה',
    teamOf: 'הצוות של',
    workers: 'סוכנים',
    noHistory: 'אין עדיין שיחות',
    online: 'בתוך ה-Tenant שלך',
    mockBadge: 'מצב הדגמה',
    you: 'אתם',
    thinking: 'עובד על זה…',
    viewDepartment: 'צפייה במחלקה',
    continueLabel: 'המשך מהמקום שעצרת',
    resumeLabel: 'המשך:',
    jumpAgents: 'מעבר מהיר לסוכן',
    workflowsLabel: 'תהליכים מוכנים',
    attachDocument: 'צירוף מסמך',
    attachDemo: 'במצב הדגמה הקבצים אינם נשמרים ואינם יוצאים מהדפדפן',
    attachInTenant: 'הקבצים נשמרים בתוך ה-Tenant בלבד',
  },
  en: {
    appName: 'BriefAI',
    tagline: "The firm's legal AI workspace",
    departments: 'Departments',
    agents: 'Agents',
    chat: 'Chat',
    allDepartments: 'All departments',
    searchPlaceholder: 'Search a department or agent…',
    newChat: 'New chat',
    history: 'History',
    frontDesk: 'Front desk',
    frontDeskSub: 'Ask anything — or summon a specialist agent',
    askAnything: 'What are we working on?',
    askAnythingSub: 'Type a question, or press @ to summon an agent from any department',
    inputPlaceholder: 'Type a message…  (press @ to summon an agent)',
    send: 'Send',
    summonAgent: 'Summon agent',
    talkingTo: 'Talking to',
    suggestedPrompts: 'Suggested prompts',
    sampleTasks: 'Sample tasks',
    startChat: 'Start chat',
    backToWorkspace: 'Back to workspace',
    teamOf: 'The team of',
    workers: 'agents',
    noHistory: 'No conversations yet',
    online: 'In your tenant',
    mockBadge: 'Demo mode',
    you: 'You',
    thinking: 'Working…',
    viewDepartment: 'View department',
    continueLabel: 'Continue where you left off',
    resumeLabel: 'Continue:',
    jumpAgents: 'Jump to an agent',
    workflowsLabel: 'Ready-made workflows',
    attachDocument: 'Attach document',
    attachDemo: 'Demo mode — files are not stored and never leave your browser',
    attachInTenant: 'Files are stored inside your tenant only',
  },
}

// Pick the localized field off a data record: pick(dept, 'name', lang).
export function pick(record, base, lang) {
  if (!record) return ''
  const key = base + (lang === 'he' ? 'He' : 'En')
  return record[key] ?? record[base] ?? ''
}

export function strings(lang) {
  return STRINGS[lang] || STRINGS.en
}
