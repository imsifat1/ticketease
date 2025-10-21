"use client";

import React, { createContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  isLoginDialogOpen: boolean;
  setLoginDialogOpen: (isOpen: boolean) => void;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
  isLoginDialogOpen: false,
  setLoginDialogOpen: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginDialogOpen, setLoginDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for login state in localStorage on initial load
    try {
      const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
      if (storedIsLoggedIn === 'true') {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Could not access localStorage", error);
    }
    setIsLoading(false);
  }, []);
  
  const login = () => {
    try {
      localStorage.setItem('isLoggedIn', 'true');
    } catch (error) {
       console.error("Could not access localStorage", error);
    }
    setIsLoggedIn(true);
  };

  const logout = () => {
    try {
      localStorage.removeItem('isLoggedIn');
    } catch (error) {
      console.error("Could not access localStorage", error);
    }
    setIsLoggedIn(false);
  };
  
  // To avoid hydration mismatch, we don't render children until we've checked localStorage.
  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, isLoginDialogOpen, setLoginDialogOpen }}>
      {children}
    </AuthContext.Provider>
  );
};
