
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAdminCredentials, fetchManagementTeam } from '@/services/movieService';
import type { ManagementMember } from '@/lib/data';
import { useMovieStore } from '@/store/movieStore';

const ADMIN_STORAGE_KEY = 'filmplex_admin_name';

/**
 * A utility function to safely get the admin name from localStorage.
 * This can be used outside of a React component context (e.g., in Zustand store actions).
 */
export const getAdminName = (): string | null => {
    try {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(ADMIN_STORAGE_KEY);
    } catch (error) {
        console.error("Could not access localStorage:", error);
        return null;
    }
};

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [adminProfile, setAdminProfile] = useState<ManagementMember | null>(null);
  const router = useRouter();
  
  const managementTeam = useMovieStore(state => state.managementTeam);

  useEffect(() => {
    if (adminName) {
        const currentProfile = managementTeam.find(m => m.name === adminName);
        if (currentProfile) {
            if (JSON.stringify(adminProfile) !== JSON.stringify(currentProfile)) {
                setAdminProfile(currentProfile);
            }
        } else {
            logout();
        }
    }
  }, [managementTeam, adminName, adminProfile]);


  useEffect(() => {
    const checkLocalStorage = async () => {
      try {
        const storedAdminName = getAdminName();
        if (storedAdminName) {
          const initialTeam = useMovieStore.getState().managementTeam.length > 0 
            ? useMovieStore.getState().managementTeam 
            : await fetchManagementTeam();
            
          const memberProfile = initialTeam.find(member => member.name === storedAdminName);
          
          if (memberProfile) {
            setAdminName(storedAdminName);
            setAdminProfile(memberProfile);
            setIsAuthenticated(true); // This line was missing the state update
          } else {
            localStorage.removeItem(ADMIN_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error("Failed to check auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLocalStorage();
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setAdminName(null);
    setAdminProfile(null);
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear auth from localStorage:", error);
    }
    router.replace('/admin/login');
  }, [router]);

  const login = useCallback(async (name: string, username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const [credentials, team] = await Promise.all([
        fetchAdminCredentials(),
        fetchManagementTeam()
      ]);
      
      const memberProfile = team.find(member => member.name.toLowerCase() === name.toLowerCase());
      if (!memberProfile) {
        console.log(`Login failed: Admin name "${name}" not found in management team.`);
        return false;
      }
      
      const credentialsAreValid = (username === credentials.validUsername && password === credentials.validPassword);
      if (!credentialsAreValid) {
        console.log("Login failed: Invalid username or password.");
        return false;
      }

      setIsAuthenticated(true);
      setAdminName(name);
      setAdminProfile(memberProfile);
      localStorage.setItem(ADMIN_STORAGE_KEY, name);
      
      // Ensure the global store is updated with the fetched team
      useMovieStore.setState({ managementTeam: team });

      return true;

    } catch (error) {
      console.error("Login process failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isAuthenticated,
    isLoading,
    adminName,
    adminProfile,
    login,
    logout,
  };
}
