import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './Route.jsx';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from './utils/supabaseClient.js';
import { UserContextProvider } from './context/Usercontext';
import { RBACProvider } from './context/RBAC.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SessionContextProvider supabaseClient={supabase}>
      <UserContextProvider>
        <RBACProvider>
          <App />
        </RBACProvider>
      </UserContextProvider>
    </SessionContextProvider>
  </StrictMode>,
);
