
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { featuredMovies as initialFeatured, latestReleases as initialLatest, type Movie } from '@/lib/data';

interface MovieState {
  featuredMovies: Movie[];
  latestReleases: Movie[];
  isLoadingFeatured: boolean;
  isLoadingLatest: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addMovie: (movie: Movie) => void;
  updateMovie: (id: string, updatedMovie: Movie) => void;
  deleteMovie: (id: string) => void;
  updateFeaturedMovie: (id: string, posterUrl: string) => void;
  fetchHomepageData: () => Promise<void>;
  fetchFeaturedMovies: () => Promise<void>;
  fetchLatestReleases: () => Promise<void>;
}

export const useMovieStore = create<MovieState>()(
  persist(
    (set, get) => ({
      featuredMovies: initialFeatured,
      latestReleases: initialLatest,
      isLoadingFeatured: false, // Start with false as data is persisted
      isLoadingLatest: false,   // Start with false as data is persisted
      searchQuery: '',

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      addMovie: (movie: Movie) => {
        set((state) => ({
          latestReleases: [movie, ...state.latestReleases],
        }));
      },

      updateMovie: (id: string, updatedMovie: Movie) => {
        set((state) => ({
          latestReleases: state.latestReleases.map((movie) =>
            movie.id === id ? updatedMovie : movie
          ),
          featuredMovies: state.featuredMovies.map((movie) =>
            movie.id === id ? updatedMovie : movie
          ),
        }));
      },

      deleteMovie: (id: string) => {
        set((state) => ({
          latestReleases: state.latestReleases.filter((movie) => movie.id !== id),
          featuredMovies: state.featuredMovies.filter((movie) => movie.id !== id),
        }));
      },

      updateFeaturedMovie: (id: string, posterUrl: string) => {
        set((state) => ({
          featuredMovies: state.featuredMovies.map((movie) =>
            movie.id === id ? { ...movie, posterUrl } : movie
          ),
        }));
      },

      // Fetch functions can now be simplified as the initial state is persisted
      fetchFeaturedMovies: async () => {
        set({ isLoadingFeatured: true });
        // In a real app, you might re-fetch from a server here.
        // For now, we rely on the persisted state.
        set({ isLoadingFeatured: false });
      },

      fetchLatestReleases: async () => {
        set({ isLoadingLatest: true });
        // In a real app, you might re-fetch from a server here.
        // For now, we rely on the persisted state.
        set({ isLoadingLatest: false });
      },

      fetchHomepageData: async () => {
        // Data is now loaded from localStorage, so we just ensure loading states are correct.
        if (get().featuredMovies.length === 0) {
            await get().fetchFeaturedMovies();
        }
         if (get().latestReleases.length === 0) {
            await get().fetchLatestReleases();
        }
      },
    }),
    {
      name: 'movie-storage', // name of the item in the storage (must be unique)
    }
  )
);
