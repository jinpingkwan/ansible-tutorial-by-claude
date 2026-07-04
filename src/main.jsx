import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Material Web Components — stable catalog (buttons, chips, fields, icon, etc.)
import '@material/web/all.js'
// Labs components not bundled in all.js but stable enough for this app's needs.
import '@material/web/labs/card/elevated-card.js'
import '@material/web/labs/segmentedbutton/outlined-segmented-button.js'
import '@material/web/labs/segmentedbuttonset/outlined-segmented-button-set.js'

import './theme.css'
import './app.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
