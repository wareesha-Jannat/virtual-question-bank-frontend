"use client";
import React, { createContext, useState, useContext } from "react";

const RoleContext = createContext(null);

const RoleProvider = ({ children, initialRole }) => {
  const [role, setRole] = useState(initialRole);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export function useRole() {
  const context = useContext(RoleContext);
  if (context === null) {
    throw Error("useRole must be used within a ContextProvider");
  }
  return context;
}

export default RoleProvider;
