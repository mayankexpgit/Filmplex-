
import { create } from 'zustand';
import { featuredMovies, latestReleases, type Movie } from '@/lib/data';

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

export const useMovieStore = create<MovieState>((set, get) => ({
  featuredMovies: [],
  latestReleases: [],
  isLoadingFeatured: true,
  isLoadingLatest: true,
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

  fetchFeaturedMovies: async () => {
    set({ isLoadingFeatured: true });
    set({ featuredMovies, isLoadingFeatured: false });
  },

  fetchLatestReleases: async () => {
    set({ isLoadingLatest: true });
    set({ latestReleases, isLoadingLatest: false });
  },

  fetchHomepageData: async () => {
    await Promise.all([
      get().fetchFeaturedMovies(),
      get().fetchLatestReleases(),
    ]);
  },
}));
