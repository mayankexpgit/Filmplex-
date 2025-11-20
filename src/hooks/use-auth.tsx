

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAdminCredentials, fetchManagementTeam } from '@/services/movieService';
import type { ManagementMember } from '@/lib/data';
import { useMovieStore, getAdminName } from '@/store/movieStore';


const ADMIN_STORAGE_KEY = 'filmplex_admin_name';

const setStoreAdminProfile = (profile: ManagementMember | null) => {
    useMovieStore.setState({ adminProfile: profile });
};

const setMovieStoreState = useMovieStore.setState;

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [adminProfile, setAdminProfile] = useState<ManagementMember | null>(null);
  const router = useRouter();
  
  const managementTeam = useMovieStore(state => state.managementTeam);

  useEffect(() => {
    if (adminName && managementTeam.length > 0) {
        const currentProfile = managementTeam.find(m => m.name === adminName);
        if (currentProfile) {
            if (JSON.stringify(adminProfile) !== JSON.stringify(currentProfile)) {
                setAdminProfile(currentProfile);
                setStoreAdminProfile(currentProfile);
            }
        } else {
            logout();
        }
    }
  }, [managementTeam, adminName]);


  useEffect(() => {
    const checkLocalStorage = async () => {
      try {
        const storedAdminName = getAdminName();
        if (storedAdminName) {
          setIsLoading(true);

          const initialTeam = (useMovieStore.getState().managementTeam || []).length > 0 
            ? useMovieStore.getState().managementTeam 
            : await fetchManagementTeam();
            
          const memberProfile = initialTeam.find(member => member.name === storedAdminName);
          
          if (memberProfile) {
            setAdminName(storedAdminName);
            setAdminProfile(memberProfile);
            setStoreAdminProfile(memberProfile);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem(ADMIN_STORAGE_KEY);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error("Failed to check auth status:", error);
        setIsAuthenticated(false);
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
    setStoreAdminProfile(null);
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear auth from localStorage:", error);
    }
    router.replace('/admin/login');
  }, [router]);

  const login = useCallback(async (loginName: string, username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const [credentials, team] = await Promise.all([
        fetchAdminCredentials(),
        fetchManagementTeam()
      ]);
      setMovieStoreState({ managementTeam: team });
      
      const memberProfile = team.find(member => member.name === loginName);
      
      if (!memberProfile) {
        console.log(`Login failed: Admin name "${loginName}" not found in management team.`);
        return false;
      }
      
      const credentialsAreValid = (username === credentials.validUsername && password === credentials.validPassword);
      if (!credentialsAreValid) {
        console.log("Login failed: Invalid username or password.");
        return false;
      }

      setIsAuthenticated(true);
      setAdminName(loginName);
      setAdminProfile(memberProfile);
      setStoreAdminProfile(memberProfile);
      localStorage.setItem(ADMIN_STORAGE_KEY, loginName);
      
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
