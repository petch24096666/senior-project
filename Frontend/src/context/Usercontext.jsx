import React, { createContext, useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';

export const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const supabaseUser = useUser(); // จาก Supabase
  const [customUser, setCustomUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomUser = async () => {
      if (!supabaseUser || !supabaseUser.email) {
        setCustomUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:8081/api/users?email=${encodeURIComponent(supabaseUser.email)}`);
        const data = await res.json();

        if (data.success && data.data) {
          setCustomUser(data.data); // จะมี user_id, token, provider, fullname ฯลฯ
        } else {
          setError("User not found in internal DB");
        }
      } catch (err) {
        setError("Error fetching user");
        console.error("Error fetching custom user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomUser();
  }, [supabaseUser]);
  

  return (
    <UserContext.Provider value={{ customUser, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};
