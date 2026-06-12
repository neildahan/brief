// PLACEHOLDER PowerProvider.
//
// `pac code init` generates the real PowerProvider that initializes the Power
// Apps SDK (auth + connectors) for the deployed app. Until then, this passthrough
// lets the app run on mock data with `npm run dev`. When you run `pac code init`,
// replace this file's body with the generated provider — the rest of the app
// already wraps its root in <PowerProvider> (see src/App.jsx), so nothing else
// needs to change.

export default function PowerProvider({ children }) {
  return children
}
