
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAdminCredentials, fetchManagementTeam } from '@/services/movieService';
import type { ManagementMember } from '@/lib/data';

const ADMIN_STORAGE_KEY = 'filmplex_admin_name';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [adminProfile, setAdminProfile] = useState<ManagementMember | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkLocalStorage = async () => {
      try {
        const storedAdminName = localStorage.getItem(ADMIN_STORAGE_KEY);
        if (storedAdminName) {
          const managementTeam = await fetchManagementTeam();
          const memberProfile = managementTeam.find(member => member.name === storedAdminName);
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
