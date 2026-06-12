import { useEffect } from 'react'
import { getContext } from '@microsoft/power-apps/app'

// Establishes the handshake with the Power Apps host so the deployed app picks
// up app/user/host context and the connector bridge. Children render
// immediately; when running outside the host (plain `npm run dev`) the
// handshake simply no-ops.
export default function PowerProvider({ children }) {
  useEffect(() => {
    getContext().catch(() => {
      // Not running inside the Power Apps host — fine in local mock dev.
    })
  }, [])
  return children
}
