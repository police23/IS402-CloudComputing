import React, { createContext, useContext } from 'react';

const AuthorizationContext = createContext({
  hasPermission: () => true
});

export function useAuthorization() {
  const context = useContext(AuthorizationContext);
  if (!context) {
    return { hasPermission: () => true }; 
  }
  return context;
}

export function AuthorizationProvider({ children }) {
  const value = {
    hasPermission: () => true 
  };

  return (
    <AuthorizationContext.Provider value={value}>
      {children}
    </AuthorizationContext.Provider>
  );
}

export default AuthorizationContext;