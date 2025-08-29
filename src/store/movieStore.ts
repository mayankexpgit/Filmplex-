
import { create } from 'zustand';
import type { Movie, Notification, Comment, Reactions, ManagementMember } from '@/lib/data';
import {
  addMovie as dbAddMovie,
  updateMovie as dbUpdateMovie,
  deleteMovie as dbDeleteMovie,
  fetchMovies as dbFetchMovies,
  fetchContactInfo as dbFetchContactInfo,
  updateContactInfo as dbUpdateContactInfo,
  fetchSuggestions as dbFetchSuggestions,
  addSuggestion as dbAddSuggestion,
  deleteSuggestion as dbDeleteSuggestion,
  fetchSecurityLogs as dbFetchSecurityLogs,
  addSecurityLog as dbAddSecurityLog,
  fetchNotifications as dbFetchNotifications,
  addNotification as dbAddNotification,
  deleteNotification as dbDeleteNotification,
  fetchComments as dbFetchComments,
  addComment as dbAddComment,
  deleteComment as dbDeleteComment,
  updateReaction as dbUpdateReaction,
  fetchAllComments as dbFetchAllComments,
  fetchManagementTeam as dbFetchManagementTeam,
  addManagementMember as dbAddManagementMember,
  deleteManagementMember as dbDeleteManagementMember,
} from '@/services/movieService';
import { correctSpelling } from '@/ai/flows/spell-check-flow';


// --- Types ---
export interface ContactInfo {
  telegramUrl: string;
  whatsappUrl: string;
  instagramUrl: string;
  email: string;
  whatsappNumber: string;
}

export interface Suggestion {
  id: string;
  movieName: string;
  comment: string;
  timestamp: string;
}

export interface SecurityLog {
  id: string;
  admin: string;
  action: string;
  timestamp: string;
}

export interface AdminCredentials {
  validUsername: string;
  validPassword: string;
}

type QualityFilter = 'all' | '4k' | 'hd';

interface MovieState {
  // Movies
  featuredMovies: Movie[];
  latestReleases: Movie[];
  searchQuery: string;
  selectedGenre: string;
  selectedQuality: QualityFilter;
  
  // Admin Data
  contactInfo: ContactInfo;
  suggestions: Suggestion[];
  securityLogs: SecurityLog[];
  notifications: Notification[];
  allComments: Comment[];
  managementTeam: ManagementMember[];
  
  // Per-movie state
  comments: Comment[];

  // Initialization
  isInitialized: boolean;

  // Actions (only state setters)
  setSearchQuery: (query: string) => void;
  setSelectedGenre: (genre: string) => void;
  setSelectedQuality: (quality: QualityFilter) => void;
  setState: (state: Partial<MovieState>) => void;
  setComments: (comments: Comment[]) => void;
  setAllComments: (comments: Comment[]) => void;
  addCommentToState: (comment: Comment) => void;
  incrementReaction: (movieId: string, reaction: keyof Reactions) => void;
}

// =================================================================
// 1. ZUSTAND STORE DEFINITION
// =================================================================
export const useMovieStore = create<MovieState>((set, get) => ({
  // --- Initial State ---
  featuredMovies: [],
  latestReleases: [],
  searchQuery: '',
  selectedGenre: 'All Genres',
  selectedQuality: 'all',
  contactInfo: { telegramUrl: '', whatsappUrl: '', instagramUrl: '', email: '', whatsappNumber: '' },
  suggestions: [],
  securityLogs: [],
  notifications: [],
  allComments: [],
  managementTeam: [],
  comments: [],
  isInitialized: false,

  // --- Actions ---
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedGenre: (genre: string) => {
    set({ selectedGenre: genre, searchQuery: '' }); // Reset search when genre changes
  },
  setSelectedQuality: (quality: QualityFilter) => set({ selectedQuality: quality }),
  setState: (state: Partial<MovieState>) => set(state),
  setComments: (comments) => set({ comments }),
  setAllComments: (comments) => set({ allComments: comments }),
  addCommentToState: (comment) => set(state => ({ comments: [comment, ...state.comments] })),
  incrementReaction: (movieId, reaction) => set(state => {
    const updateMovieInList = (list: Movie[]) => 
      list.map(movie => {
        if (movie.id === movieId) {
          const newReactions = { ...movie.reactions!, [reaction]: (movie.reactions![reaction] || 0) + 1 };
          return { ...movie, reactions: newReactions };
        }
        return movie;
      });

    return {
      latestReleases: updateMovieInList(state.latestReleases),
      featuredMovies: updateMovieInList(state.featuredMovies)
    };
  }),
}));


// =================================================================
// 2. ASYNCHRONOUS ACTION FUNCTIONS
// =================================================================

let isFetchingMovies = false;
export const fetchMovieData = async (): Promise<void> => {
  const { isInitialized } = useMovieStore.getState();
  if (isInitialized || isFetchingMovies) {
    return;
  }
  isFetchingMovies = true;
  try {
    const [allMovies, notifications, contactInfo, managementTeam] = await Promise.all([
        dbFetchMovies(),
        dbFetchNotifications(),
        dbFetchContactInfo(),
        dbFetchManagementTeam(),
    ]);
    
    useMovieStore.setState({
      featuredMovies: allMovies.filter(movie => movie.isFeatured),
      latestReleases: allMovies,
      notifications,
      contactInfo,
      managementTeam,
      isInitialized: true,
    });
  } catch (error) {
    console.error("Failed to fetch movie data:", error);
    useMovieStore.setState({ isInitialized: true });
  } finally {
    isFetchingMovies = false;
  }
};


let isFetchingAdmin = false;
export const fetchAdminData = async (): Promise<void> => {
   if (isFetchingAdmin) {
    return;
  }
  isFetchingAdmin = true;
  try {
     const [contactInfo, suggestions, securityLogs, allMovies, notifications, allComments, managementTeam] = await Promise.all([
      dbFetchContactInfo(),
      dbFetchSuggestions(),
      dbFetchSecurityLogs(),
      dbFetchMovies(),
      dbFetchNotifications(),
      dbFetchAllComments(),
      dbFetchManagementTeam(),
    ]);

    useMovieStore.setState({
      contactInfo,
      suggestions,
      securityLogs,
      notifications,
      allComments,
      managementTeam,
      featuredMovies: allMovies.filter(movie => movie.isFeatured),
      latestReleases: allMovies,
      isInitialized: true,
    });
  } catch (error) {
    console.error("Failed to fetch admin data:", error);
     useMovieStore.setState({ isInitialized: true });
  } finally {
    isFetchingAdmin = false;
  }
};

const addSecurityLog = async (action: string): Promise<void> => {
    const newLog = {
        admin: 'admin_user',
        action,
        timestamp: new Date().toLocaleString(),
    };
    const id = await dbAddSecurityLog(newLog);
    const existingLogs = useMovieStore.getState().securityLogs;
    useMovieStore.setState({ securityLogs: [{ id, ...newLog }, ...existingLogs] });
};

// AI-powered search query correction
export const setAiCorrectedSearchQuery = async (query: string): Promise<void> => {
    const { latestReleases, featuredMovies } = useMovieStore.getState();
    const allMovies = [...latestReleases, ...featuredMovies].filter(
      (movie, index, self) => index === self.findIndex((m) => m.id === movie.id)
    );
    const correctedQuery = await correctSpelling(query, allMovies);
    useMovieStore.getState().setSearchQuery(correctedQuery);
};

export const addMovie = async (movieData: Omit<Movie, 'id'>): Promise<void> => {
  await dbAddMovie(movieData);
  await addSecurityLog(`Uploaded Movie: "${movieData.title}"`);
  const allMovies = await dbFetchMovies();
  useMovieStore.setState({
    featuredMovies: allMovies.filter(movie => movie.isFeatured),
    latestReleases: allMovies,
  });
};

export const updateMovie = async (id: string, updatedMovie: Partial<Movie>): Promise<void> => {
  await dbUpdateMovie(id, updatedMovie);
  const movieTitle = updatedMovie.title || useMovieStore.getState().featuredMovies.find(m => m.id === id)?.title || useMovieStore.getState().latestReleases.find(m => m.id === id)?.title || 'Unknown Movie';
  if (Object.keys(updatedMovie).length === 1 && 'isFeatured' in updatedMovie) {
     await addSecurityLog(`Updated featured status for: "${movieTitle}"`);
  } else {
    await addSecurityLog(`Updated Movie: "${movieTitle}"`);
  }
  const allMovies = await dbFetchMovies();
  useMovieStore.setState({
    featuredMovies: allMovies.filter(movie => movie.isFeatured),
    latestReleases: allMovies,
  });
};

export const deleteMovie = async (id: string): Promise<void> => {
  const movies = [...useMovieStore.getState().latestReleases, ...useMovieStore.getState().featuredMovies];
  const movie = movies.find(m => m.id === id);
  if (movie) {
    await dbDeleteMovie(id);
    await addSecurityLog(`Deleted Movie: "${movie.title}"`);
    const allMovies = await dbFetchMovies();
    useMovieStore.setState({
      featuredMovies: allMovies.filter(movie => movie.isFeatured),
      latestReleases: allMovies,
    });
  }
};

export const updateContactInfo = async (info: ContactInfo): Promise<void> => {
  await dbUpdateContactInfo(info);
  useMovieStore.setState({ contactInfo: info });
  await addSecurityLog('Updated Help Center Info');
};

export const submitSuggestion = async (movieName: string, comment: string): Promise<void> => {
  const newSuggestionData = {
    movieName,
    comment,
    timestamp: new Date().toISOString(),
  };
  const id = await dbAddSuggestion(newSuggestionData);
  await addSecurityLog(`New suggestion received for: "${movieName}"`);
  useMovieStore.setState(state => ({
    suggestions: [{ id, ...newSuggestionData }, ...state.suggestions],
  }));
};

export const deleteSuggestion = async (id: string): Promise<void> => {
  await dbDeleteSuggestion(id);
  await addSecurityLog(`Deleted Suggestion ID: ${id}`);
  useMovieStore.setState((state) => ({
    suggestions: state.suggestions.filter((s) => s.id !== id)
  }));
};

export const addNotification = async (notificationData: Omit<Notification, 'id'>): Promise<void> => {
    const id = await dbAddNotification(notificationData);
    await addSecurityLog(`Added upcoming notification for: "${notificationData.movieTitle}"`);
    useMovieStore.setState((state) => ({
        notifications: [{ ...notificationData, id }, ...state.notifications],
    }));
};

export const deleteNotification = async (id: string): Promise<void> => {
    await dbDeleteNotification(id);
    await addSecurityLog(`Deleted Notification ID: ${id}`);
    useMovieStore.setState((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
    }));
};

// --- Comments and Reactions ---

export const fetchCommentsForMovie = async (movieId: string): Promise<void> => {
  try {
    const comments = await dbFetchComments(movieId);
    useMovieStore.getState().setComments(comments);
  } catch (error) {
    console.error("Failed to fetch comments:", error);
  }
};

export const submitComment = async (movieId: string, user: string, text: string): Promise<void> => {
    const newCommentData = {
        user,
        text,
        timestamp: new Date().toISOString(),
    };
    const id = await dbAddComment(movieId, newCommentData);
    const newComment: Comment = { id, movieId, ...newCommentData };
    useMovieStore.getState().addCommentToState(newComment);
};

export const deleteComment = async (movieId: string, commentId: string): Promise<void> => {
    await dbDeleteComment(movieId, commentId);
    await addSecurityLog(`Deleted Comment ID: ${commentId} from Movie ID: ${movieId}`);
    useMovieStore.setState(state => ({
        allComments: state.allComments.filter(c => c.id !== commentId)
    }));
};

export const submitReaction = async (movieId: string, reaction: keyof Reactions): Promise<void> => {
    await dbUpdateReaction(movieId, reaction);
    useMovieStore.getState().incrementReaction(movieId, reaction);
};

// --- Management Team ---

export const addManagementMember = async (memberData: Omit<ManagementMember, 'id' | 'timestamp'>): Promise<void> => {
    const fullMemberData = {
      ...memberData,
      timestamp: new Date().toISOString(),
    };
    const id = await dbAddManagementMember(fullMemberData);
    await addSecurityLog(`Added management member: "${memberData.name}"`);
    useMovieStore.setState(state => ({
        managementTeam: [{ id, ...fullMemberData }, ...state.managementTeam],
    }));
};

export const deleteManagementMember = async (id: string): Promise<void> => {
    const member = useMovieStore.getState().managementTeam.find(m => m.id === id);
    await dbDeleteManagementMember(id);
    if (member) {
        await addSecurityLog(`Removed management member: "${member.name}"`);
    }
    useMovieStore.setState(state => ({
        managementTeam: state.managementTeam.filter(m => m.id !== id),
    }));
};
