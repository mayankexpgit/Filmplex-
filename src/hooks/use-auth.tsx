
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

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

  const login = useCallback((username, password) => {
    // These are the credentials the user requested
    const validUsername = 'adminfilmplex@90';
    const validPassword = 'admin2189movie';

    if (username === validUsername && password === validPassword) {
      try {
        // Create a simple token. In a real app, this would come from a server.
        const token = btoa(`${username}:${password}:${new Date().getTime()}`);
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        setIsAuthenticated(true);
        return true;
      } catch (error) {
        console.error("Could not access localStorage:", error);
        return false;
      }
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (error) {
       console.error("Could not access localStorage:", error);
    } finally {
       setIsAuthenticated(false);
       router.push('/admin/login');
    }
  }, [router]);

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
