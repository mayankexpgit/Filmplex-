
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

const addSecurityLog = async (action: string): Promise<void> => {
    const newLog = {
        admin: 'admin_user', // This should be dynamic in a real multi-user system
        action,
        timestamp: new Date().toLocaleString(),
    };
    try {
        const id = await dbAddSecurityLog(newLog);
        const existingLogs = useMovieStore.getState().securityLogs;
        useMovieStore.setState({ securityLogs: [{ id, ...newLog }, ...existingLogs] });
    } catch (error) {
        console.error("Failed to add security log:", error);
    }
};

let isFetchingData = false;
/**
 * Fetches all necessary initial data for the app.
 * @param isAdmin - If true, fetches admin-specific data like suggestions and logs.
 */
export const fetchInitialData = async (isAdmin: boolean): Promise<void> => {
  const { isInitialized } = useMovieStore.getState();
  if (isInitialized || isFetchingData) {
    return;
  }
  isFetchingData = true;

  try {
    const commonPromises = [
      dbFetchMovies(),
      dbFetchNotifications(),
      dbFetchContactInfo(),
      dbFetchManagementTeam(),
    ];
    
    let adminPromises: Promise<any>[] = [];
    if (isAdmin) {
      adminPromises = [
        dbFetchSuggestions(),
        dbFetchSecurityLogs(),
        dbFetchAllComments(),
      ];
    }
    
    const [
      allMovies,
      notifications,
      contactInfo,
      managementTeam,
      suggestions,
      securityLogs,
      allComments
    ] = await Promise.all([...commonPromises, ...adminPromises]);

    const stateUpdate: Partial<MovieState> = {
      featuredMovies: allMovies.filter((movie: Movie) => movie.isFeatured),
      latestReleases: allMovies,
      notifications,
      contactInfo,
      managementTeam,
      isInitialized: true,
    };
    
    if (isAdmin) {
        stateUpdate.suggestions = suggestions;
        stateUpdate.securityLogs = securityLogs;
        stateUpdate.allComments = allComments;
    }

    useMovieStore.setState(stateUpdate);
  } catch (error) {
    console.error("Failed to fetch initial data:", error);
    // Still set initialized to true to prevent re-fetching on error
    useMovieStore.setState({ isInitialized: true });
  } finally {
    isFetchingData = false;
  }
};

export const addMovie = async (movieData: Omit<Movie, 'id'>): Promise<void> => {
  const movieWithTimestamp = {
    ...movieData,
    createdAt: new Date().toISOString(),
  };
  await dbAddMovie(movieWithTimestamp);
  await addSecurityLog(`Uploaded Movie: "${movieData.title}"`);
  const allMovies = await dbFetchMovies();
  useMovieStore.setState({
    featuredMovies: allMovies.filter(movie => movie.isFeatured),
    latestReleases: allMovies,
  });
};

export const updateMovie = async (id: string, updatedMovie: Partial<Movie>): Promise<void> => {
  await dbUpdateMovie(id, updatedMovie);
  const movies = useMovieStore.getState().latestReleases;
  const movieTitle = updatedMovie.title || movies.find(m => m.id === id)?.title || 'Unknown Movie';
  
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
    const notif = useMovieStore.getState().notifications.find(n => n.id === id);
    await dbDeleteNotification(id);
    if(notif) {
      await addSecurityLog(`Deleted Notification for: "${notif.movieTitle}"`);
    }
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
    const comment = useMovieStore.getState().comments.find(c => c.id === commentId);
    await dbDeleteComment(movieId, commentId);
    await addSecurityLog(`Deleted Comment by "${comment?.user}" from Movie ID: ${movieId}`);
    useMovieStore.setState(state => ({
        comments: state.comments.filter(c => c.id !== commentId)
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
        managementTeam: [...state.managementTeam, { id, ...fullMemberData }].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
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
