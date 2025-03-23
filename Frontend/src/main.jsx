import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './Route.jsx'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { supabase } from './utils/supabaseClient.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SessionContextProvider supabaseClient={supabase}>
     <App />
    </SessionContextProvider>
  </StrictMode>,
)
