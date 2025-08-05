import { create } from 'zustand';
import { featuredMovies, latestReleases, type Movie } from '@/lib/data';

interface MovieState {
  featuredMovies: Movie[];
  latestReleases: Movie[];
  isLoadingFeatured: boolean;
  isLoadingLatest: boolean;
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
    // Check if data is already loading to prevent parallel requests on fast refresh
    if (get().isLoadingFeatured || get().isLoadingLatest) {
        await Promise.all([
            get().fetchFeaturedMovies(),
            get().fetchLatestReleases(),
        ]);
    }
  },
}));
