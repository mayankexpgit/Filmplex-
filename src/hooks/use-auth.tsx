

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAdminCredentials, fetchManagementTeam, updateMovie } from '@/services/movieService';
import type { ManagementMember } from '@/lib/data';
import { useMovieStore } from '@/store/movieStore';


const ADMIN_STORAGE_KEY = 'filmplex_admin_id'; // Changed from name to ID

const setStoreAdminProfile = (profile: ManagementMember | null) => {
    useMovieStore.setState({ adminProfile: profile });
};

const setMovieStoreState = useMovieStore.setState;

const getAdminId = (): string | null => {
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
  const [adminProfile, setAdminProfile] = useState<ManagementMember | null>(null);
  const router = useRouter();
  
  const managementTeam = useMovieStore(state => state.managementTeam);

  useEffect(() => {
    const adminId = getAdminId();
    if (adminId && managementTeam.length > 0) {
        const currentProfile = managementTeam.find(m => m.id === adminId);
        if (currentProfile) {
            setAdminProfile(currentProfile);
            setStoreAdminProfile(currentProfile);
        } else {
            // If the current admin is no longer in the team, log them out.
            logout();
        }
    }
  }, [managementTeam]);


  useEffect(() => {
    const checkLocalStorage = async () => {
      try {
        const storedAdminId = getAdminId();
        if (storedAdminId) {
          setIsLoading(true);

          const initialTeam = (useMovieStore.getState().managementTeam || []).length > 0 
            ? useMovieStore.getState().managementTeam 
            : await fetchManagementTeam();
            
          const memberProfile = initialTeam.find(member => member.id === storedAdminId);
          
          if (memberProfile) {
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
      const [credentials, team, allMovies] = await Promise.all([
        fetchAdminCredentials(),
        fetchManagementTeam(),
        useMovieStore.getState().allMovies.length > 0 ? useMovieStore.getState().allMovies : (await import('@/services/movieService')).fetchMovies()
      ]);
      
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
      
      let allMoviesState = allMovies;

      // One-time data migration logic on login
      const moviesUploadedByOldName = allMovies.filter(movie => movie.uploadedBy === memberProfile.name && movie.uploadedBy !== memberProfile.id);
      if (moviesUploadedByOldName.length > 0) {
        console.log(`Migrating ${moviesUploadedByOldName.length} movies from old name "${memberProfile.name}" to ID "${memberProfile.id}"...`);
        const updatePromises = moviesUploadedByOldName.map(movie => 
          updateMovie(movie.id, { uploadedBy: memberProfile.id })
        );
        await Promise.all(updatePromises);
        console.log("Migration complete.");
        
        // Update local state immediately to reflect migration
        const updatedAllMovies = allMovies.map(movie => {
          if (movie.uploadedBy === memberProfile.name) {
            return { ...movie, uploadedBy: memberProfile.id };
          }
          return movie;
        });
        allMoviesState = updatedAllMovies;
      }

      setMovieStoreState({ managementTeam: team, allMovies: allMoviesState, latestReleases: allMoviesState, featuredMovies: allMoviesState.filter(m => m.isFeatured) });

      setIsAuthenticated(true);
      setAdminProfile(memberProfile);
      setStoreAdminProfile(memberProfile);
      localStorage.setItem(ADMIN_STORAGE_KEY, memberProfile.id); // Store the permanent ID
      
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
    adminName: adminProfile?.name, // Keep providing name for display purposes
    adminProfile,
    login,
    logout,
  };
}
