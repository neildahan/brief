// Copilot Studio bridge — the ONLY place that calls the generated connector
// client. Talks to the agent IN-TENANT through the Power Apps connector (no
// external API, no egress). Imported lazily so mock dev never loads it.
//
// VERIFY-AGAINST-LIVE: the request body field ("text") and the reply field
// ("message") below are best-guess from the connector schema; confirm against
// the real agent on first live test and adjust if needed.

let copilotIdPromise = null

async function getService() {
  const mod = await import('../generated/services/MicrosoftCopilotStudioService')
  return mod.MicrosoftCopilotStudioService
}

// Which agent to call. Prefer an explicit env override; otherwise discover the
// first agent in the environment via ListCopilots (you have one today).
async function resolveCopilotId(svc) {
  const override = import.meta.env.VITE_COPILOT_ID
  if (override) return override
  if (!copilotIdPromise) {
    copilotIdPromise = (async () => {
      const res = await svc.ListCopilots()
      const ent = res?.data?.entities?.[0]
      const attr = (k) => ent?.attributes?.find((a) => a.key === k)?.value
      // Try the common identifier fields the connector accepts.
      return attr('schemaname') || attr('botid') || ent?.id || ent?.logicalName || ''
    })()
  }
  return copilotIdPromise
}

// Send a prompt to the agent and return its reply text. Throws on failure.
export async function invokeCopilot({ conversationId, prompt }) {
  const svc = await getService()
  const copilot = await resolveCopilotId(svc)
  if (!copilot) throw new Error('No Copilot Studio agent found in this environment.')

  const res = await svc.ExecuteCopilotAsync(copilot, { text: prompt }, conversationId || undefined)
  if (!res?.success) throw res?.error || new Error('Copilot invocation failed.')

  const data = res.data || {}
  return (
    data.message ??
    data.text ??
    data.outputs?.message ??
    (typeof data === 'string' ? data : JSON.stringify(data))
  )
}
