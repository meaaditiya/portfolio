// src/context/VisitorContext.js
import { createContext, useContext } from 'react';

const VisitorContext = createContext(null);

export const VisitorProvider = ({ children, value }) => {
  return (
    <VisitorContext.Provider value={value}>
      {children}
    </VisitorContext.Provider>
  );
};

export const useVisitor = () => {
  const context = useContext(VisitorContext);
  if (!context) {
    throw new Error('useVisitor must be used within a VisitorProvider');
  }
  return context;
};