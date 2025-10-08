import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Movie, Notification, Comment, Reactions, ManagementMember, AdminTask, TodoItem } from '@/lib/data';
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
  updateManagementMember as dbUpdateManagementMember,
} from '@/services/movieService';
import { format, isAfter, parseISO } from 'date-fns';
import { getAdminName } from '@/hooks/use-auth';


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
  allMovies: Movie[];
  featuredMovies: Movie[];
  latestReleases: Movie[];
  searchQuery: string;
  selectedGenre: string;
  selectedQuality: QualityFilter;
  adminProfile: ManagementMember | null;
  
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
  allMovies: [],
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
  adminProfile: null,
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
      allMovies: updateMovieInList(state.allMovies),
      latestReleases: updateMovieInList(state.latestReleases),
      featuredMovies: updateMovieInList(state.featuredMovies)
    };
  }),
}));


// =================================================================
// 2. ASYNCHRONOUS ACTION FUNCTIONS
// =================================================================

const isUploadCompleted = (movie: Movie): boolean => {
    if (movie.contentType === 'movie') {
        return !!movie.downloadLinks && movie.downloadLinks.some(link => link && link.url);
    }
    if (movie.contentType === 'series') {
        const hasEpisodeLinks = movie.episodes && movie.episodes.some(ep => ep.downloadLinks.some(link => link && link.url));
        const hasSeasonLinks = movie.seasonDownloadLinks && movie.seasonDownloadLinks.some(link => link && link.url);
        return !!(hasEpisodeLinks || hasSeasonLinks);
    }
    return false;
};

let isFetchingData = false;
/**
 * Fetches all necessary initial data for the app.
 * Prevents multiple fetches from occurring simultaneously.
 * @param isAdmin - If true, fetches admin-specific data like suggestions and logs.
 */
export const fetchInitialData = async (isAdmin: boolean): Promise<void> => {
  const { isInitialized } = useMovieStore.getState();
  if (isFetchingData || isInitialized) {
    return;
  }
  isFetchingData = true;

  try {
    const [
      allMovies,
      notifications,
      contactInfo,
      managementTeam
    ] = await Promise.all([
      dbFetchMovies(),
      dbFetchNotifications(),
      dbFetchContactInfo(),
      dbFetchManagementTeam(),
    ]);

    const adminName = getAdminName();
    const adminProfile = managementTeam.find(m => m.name === adminName) || null;

    const stateUpdate: Partial<MovieState> = {
      allMovies: allMovies,
      latestReleases: allMovies,
      featuredMovies: allMovies.filter((movie: Movie) => movie.isFeatured),
      notifications,
      contactInfo,
      managementTeam,
      adminProfile,
    };
    
    if (isAdmin) {
      const [suggestions, securityLogs, allComments] = await Promise.all([
        dbFetchSuggestions(),
        dbFetchSecurityLogs(),
        dbFetchAllComments(allMovies),
      ]);
      stateUpdate.suggestions = suggestions;
      stateUpdate.securityLogs = securityLogs;
      stateUpdate.allComments = allComments;
      // After fetching all data, check for overdue tasks
      await checkAndUpdateOverdueTasks(managementTeam, allMovies);
    }

    useMovieStore.setState({ ...stateUpdate, isInitialized: true });

  } catch (error) {
    console.error("Failed to fetch initial data:", error);
    // Still set initialized to true to prevent re-fetching on error, but don't set fetching to false
    useMovieStore.setState({ isInitialized: true });
  } finally {
    isFetchingData = false;
  }
};


const addSecurityLogEntry = async (action: string): Promise<void> => {
    const adminName = getAdminName() || 'unknown_admin';

    const newLog = {
        admin: adminName,
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

export const addMovie = async (movieData: Omit<Movie, 'id'>): Promise<void> => {
  const adminName = getAdminName();
  if (!adminName) {
    throw new Error("Cannot add movie: admin name not found.");
  }
  
  const movieWithMetadata = {
    ...movieData,
    createdAt: new Date().toISOString(),
    uploadedBy: adminName,
    reactions: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 }
  };
  const newId = await dbAddMovie(movieWithMetadata as Omit<Movie, 'id'>);
  const newMovie = { id: newId, ...movieWithMetadata } as Movie;

  useMovieStore.setState(state => ({
    allMovies: [newMovie, ...state.allMovies],
    latestReleases: [newMovie, ...state.latestReleases]
  }));
  await addSecurityLogEntry(`Uploaded Movie: "${movieData.title}"`);
};

export const updateMovie = async (id: string, updatedMovieData: Partial<Movie>): Promise<void> => {
  // IMPORTANT: Do not update uploadedBy or createdAt fields on edit.
  const updateData = { ...updatedMovieData };
  delete updateData.uploadedBy;
  delete updateData.createdAt;

  await dbUpdateMovie(id, updateData);

  const applyUpdate = (movie: Movie) => movie.id === id ? { ...movie, ...updateData } : movie;

  useMovieStore.setState(state => ({
    allMovies: state.allMovies.map(applyUpdate),
    latestReleases: state.latestReleases.map(applyUpdate),
    featuredMovies: state.allMovies.map(applyUpdate).filter(m => m.isFeatured)
  }));
  
  const movieTitle = updatedMovieData.title || useMovieStore.getState().latestReleases.find(m => m.id === id)?.title || 'Unknown Movie';
  
  if (Object.keys(updatedMovieData).length === 1 && 'isFeatured' in updatedMovieData) {
     await addSecurityLogEntry(`Updated featured status for: "${movieTitle}"`);
  } else {
    await addSecurityLogEntry(`Updated Movie: "${movieTitle}"`);
  }
};

export const deleteMovie = async (id: string): Promise<void> => {
  const movie = useMovieStore.getState().latestReleases.find(m => m.id === id);
  if (movie) {
    await dbDeleteMovie(id);
    useMovieStore.setState(state => ({
        allMovies: state.allMovies.filter(m => m.id !== id),
        latestReleases: state.latestReleases.filter(m => m.id !== id),
        featuredMovies: state.featuredMovies.filter(m => m.id !== id)
    }));
    await addSecurityLogEntry(`Deleted Movie: "${movie.title}"`);
  }
};

export const updateContactInfo = async (info: ContactInfo): Promise<void> => {
  await dbUpdateContactInfo(info);
  useMovieStore.setState({ contactInfo: info });
  await addSecurityLogEntry('Updated Help Center Info');
};

export const submitSuggestion = async (movieName: string, comment: string): Promise<void> => {
  const newSuggestionData = {
    movieName,
    comment,
    timestamp: new Date().toISOString(),
  };
  const id = await dbAddSuggestion(newSuggestionData);
  useMovieStore.setState(state => ({
    suggestions: [{ id, ...newSuggestionData }, ...state.suggestions],
  }));
  await addSecurityLogEntry(`New suggestion received for: "${movieName}"`);
};

export const deleteSuggestion = async (id: string): Promise<void> => {
  await dbDeleteSuggestion(id);
  useMovieStore.setState((state) => ({
    suggestions: state.suggestions.filter((s) => s.id !== id)
  }));
  await addSecurityLogEntry(`Deleted Suggestion ID: ${id}`);
};

export const addNotification = async (notificationData: Omit<Notification, 'id'>): Promise<void> => {
    const id = await dbAddNotification(notificationData);
    useMovieStore.setState((state) => ({
        notifications: [{ ...notificationData, id }, ...state.notifications],
    }));
    await addSecurityLogEntry(`Added upcoming notification for: "${notificationData.movieTitle}"`);
};

export const deleteNotification = async (id: string): Promise<void> => {
    const notif = useMovieStore.getState().notifications.find(n => n.id === id);
    await dbDeleteNotification(id);
    if(notif) {
      await addSecurityLogEntry(`Deleted Notification for: "${notif.movieTitle}"`);
    }
    useMovieStore.setState((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
    }));
};

// --- Comments and Reactions ---

export const fetchCommentsForMovie = async (movieId: string): Promise<void> => {
  try {
    if (!movieId) return;
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
    useMovieStore.setState(state => ({
        comments: state.comments.filter(c => c.id !== commentId)
    }));
    if (comment) {
      await addSecurityLogEntry(`Deleted Comment by "${comment.user}" from Movie ID: ${movieId}`);
    }
};

export const submitReaction = async (movieId: string, reaction: keyof Reactions): Promise<void> => {
    try {
        await dbUpdateReaction(movieId, reaction);
        useMovieStore.getState().incrementReaction(movieId, reaction);
    } catch (e) {
        console.error("Could not update reaction in database", e);
    }
};

// --- Management Team & Tasks ---

export const addManagementMember = async (memberData: Omit<ManagementMember, 'id' | 'timestamp'>): Promise<void> => {
    const fullMemberData = {
      ...memberData,
      timestamp: new Date().toISOString(),
    };
    const id = await dbAddManagementMember(fullMemberData);
    useMovieStore.setState(state => ({
        managementTeam: [...state.managementTeam, { id, ...fullMemberData }].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    }));
    await addSecurityLogEntry(`Added management member: "${memberData.name}"`);
};

export const deleteManagementMember = async (id: string): Promise<void> => {
    const member = useMovieStore.getState().managementTeam.find(m => m.id === id);
    await dbDeleteManagementMember(id);
    if (member) {
        await addSecurityLogEntry(`Removed management member: "${member.name}"`);
    }
    useMovieStore.setState(state => ({
        managementTeam: state.managementTeam.filter(m => m.id !== id),
    }));
};

export const updateManagementMemberTask = async (memberId: string, taskData: Omit<AdminTask, 'id' | 'status' | 'startDate'>): Promise<void> => {
    const member = useMovieStore.getState().managementTeam.find(m => m.id === memberId);
    if (!member) return;

    const newTask: AdminTask = {
        id: uuidv4(),
        ...taskData,
        startDate: new Date().toISOString(),
        status: 'active'
    };
    
    const newTasks = [...(member.tasks || []), newTask];
    await dbUpdateManagementMember(memberId, { tasks: newTasks });
    
    useMovieStore.setState(state => ({
        managementTeam: state.managementTeam.map(m => m.id === memberId ? { ...m, tasks: newTasks } : m ),
    }));
    await addSecurityLogEntry(`Set task "${taskData.title}" for ${member.name}.`);
}


export const updateAdminTask = async (memberId: string, taskId: string, itemIndex: number, completed: boolean): Promise<void> => {
    const { managementTeam } = useMovieStore.getState();
    const member = managementTeam.find(m => m.id === memberId);
    if (!member || !member.tasks) return;

    const newTasks = member.tasks.map(task => {
        if (task.id === taskId && task.type === 'todo' && task.items) {
            const newItems = [...task.items];
            newItems[itemIndex] = { ...newItems[itemIndex], completed };
            return { ...task, items: newItems };
        }
        return task;
    });

    await dbUpdateManagementMember(memberId, { tasks: newTasks });
    useMovieStore.setState(state => ({
        managementTeam: state.managementTeam.map(m => m.id === memberId ? { ...m, tasks: newTasks } : m),
        adminProfile: state.adminProfile?.id === memberId ? { ...state.adminProfile, tasks: newTasks } : state.adminProfile,
    }));
}


export const removeManagementMemberTask = async (memberId: string, taskId: string): Promise<void> => {
    const member = useMovieStore.getState().managementTeam.find(m => m.id === memberId);
    if (!member || !member.tasks) return;

    let taskTitle = 'a task';
    const newTasks = member.tasks.map(task => {
        if (task.id === taskId) {
            taskTitle = task.title;
            return {
                ...task,
                status: 'cancelled' as const,
                endDate: new Date().toISOString()
            };
        }
        return task;
    });

    await dbUpdateManagementMember(memberId, { tasks: newTasks });
    useMovieStore.setState(state => ({
        managementTeam: state.managementTeam.map(m => m.id === memberId ? { ...m, tasks: newTasks } : m),
    }));
    await addSecurityLogEntry(`Cancelled task "${taskTitle}" for ${member.name}.`);
};

/**
 * Checks all active admin tasks. If a task is overdue, its status is updated in the database.
 */
export const checkAndUpdateOverdueTasks = async (team: ManagementMember[], allMovies: Movie[]): Promise<boolean> => {
    if (!team || !Array.isArray(team)) {
        console.error("checkAndUpdateOverdueTasks was called with invalid 'team' argument.");
        return false;
    }
    
    let anyTaskUpdated = false;

    for (const member of team) {
        if (!member.tasks || member.tasks.length === 0) continue;

        const now = new Date();
        let tasksNeedUpdate = false;

        const updatedTasks = member.tasks.map(task => {
            // Skip tasks that are already finished
            if (task.status === 'completed' || task.status === 'cancelled') return task;

            const taskStartDate = parseISO(task.startDate);
            const completedMoviesForTask = allMovies
                .filter(movie => movie.uploadedBy === member.name && movie.createdAt && isAfter(parseISO(movie.createdAt), taskStartDate))
                .filter(isUploadCompleted);

            let isCompleted = false;
            let target = 0;

            if (task.type === 'target') {
                target = task.target || 0;
                if (target > 0 && completedMoviesForTask.length >= target) {
                    isCompleted = true;
                }
            } else if (task.type === 'todo') {
                target = task.items?.length || 0;
                 if (target > 0 && completedMoviesForTask.length >= target) {
                    isCompleted = true;
                }
            }
            
            if (isCompleted) {
                tasksNeedUpdate = true;
                anyTaskUpdated = true;
                return { ...task, status: 'completed' as const, endDate: new Date().toISOString() };
            } else if (isAfter(now, parseISO(task.deadline)) && task.status === 'active') {
                // Only mark as 'incompleted' if it's currently 'active' and deadline has passed.
                // This allows an 'incompleted' task to eventually become 'completed'.
                tasksNeedUpdate = true;
                anyTaskUpdated = true;
                return { ...task, status: 'incompleted' as const, endDate: new Date().toISOString() };
            }
            
            return task;
        });

        if (tasksNeedUpdate) {
            await dbUpdateManagementMember(member.id, { tasks: updatedTasks });
            useMovieStore.setState(state => ({
                managementTeam: state.managementTeam.map(m => m.id === member.id ? { ...m, tasks: updatedTasks } : m)
            }));
            console.log(`Task status automatically updated for ${member.name}.`);
            await addSecurityLogEntry(`Task status automatically updated for ${member.name}.`);
        }
    }
    return anyTaskUpdated;
};
