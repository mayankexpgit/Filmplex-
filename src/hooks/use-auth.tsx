
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
  
  // Connect to the movie store to get real-time updates for the management team.
  const managementTeam = useMovieStore(state => state.managementTeam);

  useEffect(() => {
    // This effect ensures that if the admin's profile data changes in the global store
    // (e.g., a task is updated), the local adminProfile state in this hook is updated too.
    if (adminName) {
        const currentProfile = managementTeam.find(m => m.name === adminName);
        if (currentProfile) {
            setAdminProfile(currentProfile);
        } else {
            // If the profile is gone for some reason, log out.
            logout();
        }
    }
  }, [managementTeam, adminName]); // Rerun when the global team data or the local admin name changes


  useEffect(() => {
    const checkLocalStorage = async () => {
      try {
        const storedAdminName = getAdminName();
        if (storedAdminName) {
          // No need to fetch here, the global store `fetchInitialData` handles it.
          // We just need to check if the name is valid once data is loaded.
          const initialTeam = await fetchManagementTeam();
          const memberProfile = initialTeam.find(member => member.name === storedAdminName);
          
          if (memberProfile) {
            setAdminName(storedAdminName);
            setAdminProfile(memberProfile);
            setIsAuthenticated(true);
          } else {
            // Clear invalid data from storage
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
      const [credentials, managementTeam] = await Promise.all([
        fetchAdminCredentials(),
        fetchManagementTeam()
      ]);
      
      const memberProfile = managementTeam.find(member => member.name.toLowerCase() === name.toLowerCase());
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
