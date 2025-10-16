
"use client";

import { create } from "zustand";
import { useEffect } from "react";

type Admin = {
  username: string;
};

type AdminStore = {
  admin: Admin | null;
  loading: boolean;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => void;
};

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "password";

const useAdminStore = create<AdminStore>((set) => ({
  admin: null,
  loading: true,
  login: async (username, pass) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 500)); 
    if (username === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
      const adminData = { username };
       if (typeof window !== 'undefined') {
        sessionStorage.setItem('admin-user', JSON.stringify(adminData));
      }
      set({ admin: adminData, loading: false });
      return true;
    }
    set({ loading: false });
    return false;
  },
  logout: async () => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 300));
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem('admin-user');
    }
    set({ admin: null, loading: false });
  },
  checkSession: () => {
    if (typeof window !== 'undefined') {
      try {
        const adminUser = sessionStorage.getItem('admin-user');
        if (adminUser) {
          useAdminStore.setState({ admin: JSON.parse(adminUser), loading: false });
        } else {
          useAdminStore.setState({ admin: null, loading: false });
        }
      } catch (e) {
        useAdminStore.setState({ admin: null, loading: false });
      }
    } else {
      // If not in a browser environment, stop loading
      useAdminStore.setState({ loading: false });
    }
  }
}));


export const useAdmin = () => {
  const store = useAdminStore();

  useEffect(() => {
    // This effect should only run once on the client to check the session.
    store.checkSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return store;
};
