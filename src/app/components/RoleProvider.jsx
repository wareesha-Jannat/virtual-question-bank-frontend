"use client";
import React, { createContext, useState, useEffect, useContext } from "react";
import { getAuth } from "../utils";

const RoleContext = createContext(null);

const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(null);

  async function fetchRole() {
    const data = await getAuth();
    setRole(data.role);
  }
  useEffect(() => {
    fetchRole();
  }, []);

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
