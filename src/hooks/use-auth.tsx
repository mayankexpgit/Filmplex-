
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAdminCredentials, fetchManagementTeam } from '@/services/movieService';
import type { ManagementMember } from '@/lib/data';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [adminProfile, setAdminProfile] = useState<ManagementMember | null>(null);
  const router = useRouter();

  // On initial load, we assume the user is not authenticated
  // as we are not using any persistent storage like localStorage.
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setAdminName(null);
    setAdminProfile(null);
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

      // If credentials are valid, set the state for the current session.
      setIsAuthenticated(true);
      setAdminName(name);
      setAdminProfile(memberProfile);
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
