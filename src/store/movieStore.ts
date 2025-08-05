
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
  updateFeaturedMovie: (id: string, posterUrl: string) => void;
  fetchHomepageData: () => Promise<void>;
  fetchFeaturedMovies: () => Promise<void>;
  fetchLatestReleases: () => Promise<void>;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

  updateFeaturedMovie: (id: string, posterUrl: string) => {
    set((state) => ({
      featuredMovies: state.featuredMovies.map((movie) =>
        movie.id === id ? { ...movie, posterUrl } : movie
      ),
    }));
  },

  fetchFeaturedMovies: async () => {
    set({ isLoadingFeatured: true });
    await sleep(500);
    set({ featuredMovies, isLoadingFeatured: false });
  },

  fetchLatestReleases: async () => {
    set({ isLoadingLatest: true });
    await sleep(800);
    set({ latestReleases, isLoadingLatest: false });
  },

  fetchHomepageData: async () => {
    await Promise.all([
      get().fetchFeaturedMovies(),
      get().fetchLatestReleases(),
    ]);
  },
}));
