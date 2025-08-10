
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAdminCredentials } from '@/services/movieService';

const AUTH_TOKEN_KEY = 'filmplex_admin_auth_token';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for the token on initial component mount
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        // In a real app, you'd validate this token with a server
        // For this simulation, its presence is enough.
        setIsAuthenticated(true);
      }
    } catch (error) {
        console.error("Could not access localStorage:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (username, password) => {
    try {
      const { validUsername, validPassword } = await fetchAdminCredentials();
      
      if (username === validUsername && password === validPassword) {
        // Create a simple token. In a real app, this would come from a server.
        const token = btoa(`${username}:${password}:${new Date().getTime()}`);
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (error) {
       console.error("Could not access localStorage:", error);
    } finally {
       setIsAuthenticated(false);
       router.replace('/admin/login');
    }
  }, [router]);

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
