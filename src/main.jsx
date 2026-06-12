import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted Open Sans (no external CDN) — only the latin + hebrew subsets the
// bilingual UI needs, bundled locally. The deployed app makes zero font requests.
import '@fontsource/open-sans/latin-400.css'
import '@fontsource/open-sans/latin-500.css'
import '@fontsource/open-sans/latin-600.css'
import '@fontsource/open-sans/latin-700.css'
import '@fontsource/open-sans/hebrew-400.css'
import '@fontsource/open-sans/hebrew-500.css'
import '@fontsource/open-sans/hebrew-600.css'
import '@fontsource/open-sans/hebrew-700.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
