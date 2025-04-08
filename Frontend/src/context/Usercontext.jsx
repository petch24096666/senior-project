import React, { createContext, useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';

export const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const supabaseUser = useUser(); // เรียกใช้โดยตรง
  const [customUser, setCustomUser] = useState(null);

  useEffect(() => {
    console.log("supabaseUser:", supabaseUser);
    if (supabaseUser && supabaseUser.email) {
      fetch(`http://localhost:8081/api/users?email=${encodeURIComponent(supabaseUser.email)}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Fetched custom user:", data);
          if (data.success && data.data) {
            setCustomUser(data.data);
          }
        })
        .catch((err) => {
          console.error("Error fetching custom user:", err);
        });
    }
  }, [supabaseUser]);
  

  return (
    <UserContext.Provider value={{ customUser }}>
      {children}
    </UserContext.Provider>
  );  
};
