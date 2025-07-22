import React, { createContext, useContext } from 'react';

// Create the context
const AuthorizationContext = createContext({
  hasPermission: () => true
});

// Hook to use the context
export function useAuthorization() {
  const context = useContext(AuthorizationContext);
  if (!context) {
    return { hasPermission: () => true }; // Default if no provider
  }
  return context;
}

// Provider component
export function AuthorizationProvider({ children }) {
  const value = {
    hasPermission: () => true // Simple implementation that allows everything
  };

  return (
    <AuthorizationContext.Provider value={value}>
      {children}
    </AuthorizationContext.Provider>
  );
}

export default AuthorizationContext;