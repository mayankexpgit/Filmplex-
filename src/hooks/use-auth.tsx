
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAdminCredentials, fetchManagementTeam } from '@/services/movieService';
import type { ManagementMember } from '@/lib/data';

const AUTH_TOKEN_KEY = 'filmplex_admin_auth_token';
const ADMIN_NAME_KEY = 'filmplex_admin_name';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [adminProfile, setAdminProfile] = useState<ManagementMember | null>(null);
  const router = useRouter();

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(ADMIN_NAME_KEY);
    } catch (error) {
       console.error("Could not access localStorage:", error);
    } finally {
       setIsAuthenticated(false);
       setAdminName(null);
       setAdminProfile(null);
       router.replace('/admin/login');
    }
  }, [router]);

  const syncProfile = useCallback(async (name: string) => {
    try {
      const team = await fetchManagementTeam();
      const profile = team.find(member => member.name === name);
      if (profile) {
        setAdminProfile(profile);
      } else {
        // This case could happen if admin is removed while logged in
        logout();
      }
    } catch (error) {
       console.error("Could not sync admin profile:", error);
       logout();
    }
  }, [logout]);


  useEffect(() => {
    // Check for the token on initial component mount
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const name = localStorage.getItem(ADMIN_NAME_KEY);
      if (token && name) {
        // In a real app, you'd validate this token with a server
        // For this simulation, its presence is enough.
        setIsAuthenticated(true);
        setAdminName(name);
        syncProfile(name); // Fetch full profile info
      }
    } catch (error) {
        console.error("Could not access localStorage:", error);
    } finally {
        setIsLoading(false);
    }
  }, [syncProfile]);

  const login = useCallback(async (name, username, password) => {
    try {
      // 1. Fetch all required credentials and team members at once
      const [credentials, managementTeam] = await Promise.all([
        fetchAdminCredentials(),
        fetchManagementTeam()
      ]);
      
      // 2. Check if the provided admin name exists in the management team
      const memberProfile = managementTeam.find(member => member.name.toLowerCase() === name.toLowerCase());
      if (!memberProfile) {
        console.log(`Login failed: Admin name "${name}" not found in management team.`);
        return false;
      }
      
      // 3. Check if username and password are correct
      const credentialsAreValid = (username === credentials.validUsername && password === credentials.validPassword);
      if (!credentialsAreValid) {
        console.log("Login failed: Invalid username or password.");
        return false;
      }

      // 4. If all checks pass, authenticate the user
      // Create a simple token. In a real app, this would come from a server.
      const token = btoa(`${name}:${username}:${password}:${new Date().getTime()}`);
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(ADMIN_NAME_KEY, name);
      setIsAuthenticated(true);
      setAdminName(name);
      setAdminProfile(memberProfile);
      return true;

    } catch (error) {
      console.error("Login process failed:", error);
      return false;
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
