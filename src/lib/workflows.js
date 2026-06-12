// Ready-made legal workflows for the home launchpad. Each is a one-click preset
// that opens a chat with the right agent and sends a starter prompt. `agentId`
// must match a seeded agent in src/services/dataverse.js. `icon` resolves via
// iconFor() in src/lib/tokens.js.

export const WORKFLOWS = [
  {
    id: 'wf-contract-review',
    icon: 'fileText',
    agentId: 'agt-ma',
    titleEn: 'Contract review',
    titleHe: 'בדיקת חוזה',
    promptEn: 'Review this contract and flag the key risks and any off-market terms.',
    promptHe: 'בדוק את החוזה הזה וסמן את הסיכונים המרכזיים וכל תנאי חריג מהמקובל בשוק.',
  },
  {
    id: 'wf-due-diligence',
    icon: 'search',
    agentId: 'agt-ma',
    titleEn: 'Due diligence',
    titleHe: 'בדיקת נאותות',
    promptEn: 'Build a due-diligence checklist for this transaction.',
    promptHe: 'בנה רשימת בדיקת נאותות לעסקה זו.',
  },
  {
    id: 'wf-anonymize',
    icon: 'usersRound',
    agentId: 'agt-ip',
    titleEn: 'Anonymize document',
    titleHe: 'אנונימיזציה של מסמך',
    promptEn: 'Anonymize all personal and identifying details in this document.',
    promptHe: 'הסתר את כל הפרטים האישיים והמזהים במסמך זה.',
  },
  {
    id: 'wf-precedent',
    icon: 'gavel',
    agentId: 'agt-caselaw',
    titleEn: 'Find precedent',
    titleHe: 'איתור תקדים',
    promptEn: 'Find the leading precedent relevant to this question.',
    promptHe: 'מצא את התקדים המנחה הרלוונטי לשאלה זו.',
  },
]
