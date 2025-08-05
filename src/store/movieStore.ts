
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { featuredMovies as initialFeatured, latestReleases as initialLatest, type Movie } from '@/lib/data';

interface MovieState {
  featuredMovies: Movie[];
  latestReleases: Movie[];
  isLoadingFeatured: boolean;
  isLoadingLatest: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addMovie: (movie: Movie) => void;
  updateMovie: (id: string, updatedMovie: Partial<Movie>) => void;
  deleteMovie: (id: string) => void;
  fetchHomepageData: () => void;
  isInitialized: boolean;
}

export const useMovieStore = create<MovieState>()(
  persist(
    (set, get) => ({
      featuredMovies: [],
      latestReleases: [],
      isLoadingFeatured: true,
      isLoadingLatest: true,
      searchQuery: '',
      isInitialized: false,

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      addMovie: (movie: Movie) => {
        set((state) => ({
          latestReleases: [movie, ...state.latestReleases],
        }));
      },

      updateMovie: (id: string, updatedMovie: Partial<Movie>) => {
        set((state) => ({
          latestReleases: state.latestReleases.map((movie) =>
            movie.id === id ? { ...movie, ...updatedMovie } : movie
          ),
          featuredMovies: state.featuredMovies.map((movie) =>
            movie.id === id ? { ...movie, ...updatedMovie } : movie
          ),
        }));
      },

      deleteMovie: (id: string) => {
        set((state) => ({
          latestReleases: state.latestReleases.filter((movie) => movie.id !== id),
          featuredMovies: state.featuredMovies.filter((movie) => movie.id !== id),
        }));
      },

      fetchHomepageData: () => {
        // This function will now only set the initial data if the store hasn't been initialized from localStorage yet.
        if (!get().isInitialized) {
            set({
                featuredMovies: initialFeatured,
                latestReleases: initialLatest,
                isLoadingFeatured: false,
                isLoadingLatest: false,
                isInitialized: true, 
            });
        } else {
            // If already initialized, we just ensure loading states are false.
             set({
                isLoadingFeatured: false,
                isLoadingLatest: false,
            });
        }
      },
    }),
    {
      name: 'movie-storage', // unique name for the localStorage key
      storage: createJSONStorage(() => localStorage), // use localStorage
      onRehydrate: () => {
        // This is called when the state is restored from localStorage.
        // We set isInitialized to true, so we don't load default data again.
        useMovieStore.setState({ isInitialized: true, isLoadingFeatured: false, isLoadingLatest: false });
      }
    }
  )
);

// Trigger the initial fetch/hydration check
useMovieStore.getState().fetchHomepageData();
