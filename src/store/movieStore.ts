

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Movie, Notification, Comment, Reactions, ManagementMember, AdminTask, TodoItem, Settlement, UserRequest } from '@/lib/data';
import {
  addMovie as dbAddMovie,
  updateMovie as dbUpdateMovie,
  deleteMovie as dbDeleteMovie,
  fetchMovies as dbFetchMovies,
  fetchContactInfo as dbFetchContactInfo,
  updateContactInfo as dbUpdateContactInfo,
  fetchSecurityLogs as dbFetchSecurityLogs,
  addSecurityLog as dbAddSecurityLog,
  fetchNotifications as dbFetchNotifications,
  addNotification as dbAddNotification,
  deleteNotification as dbDeleteNotification,
  fetchComments as dbFetchComments,
  addComment as dbAddComment,
  deleteComment as dbDeleteComment,
  updateReaction as dbUpdateReaction,
  fetchManagementTeam as dbFetchManagementTeam,
  addManagementMember as dbAddManagementMember,
  deleteManagementMember as dbDeleteManagementMember,
  updateManagementMember as dbUpdateManagementMember,
  calculateAllWallets as dbCalculateAllWallets,
  updateSettlementStatus as dbUpdateSettlementStatus,
  fetchRequests as dbFetchRequests,
  addRequest as dbAddRequest,
  updateRequestStatus as dbUpdateRequestStatus,
  deleteRequest as dbDeleteRequest,
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
  currentPage: number;
  adminProfile: ManagementMember | null;
  
  // Admin Data
  contactInfo: ContactInfo;
  securityLogs: SecurityLog[];
  notifications: Notification[];
  requests: UserRequest[];
  
  // Per-movie state
  comments: Comment[];

  // Animation State
  isCoinAnimationActive: boolean;

  // Initialization
  isInitialized: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedGenre: (genre: string) => void;
  setSelectedQuality: (quality: QualityFilter) => void;
  setCurrentPage: (page: number) => void;
  setState: (state: Partial<MovieState>) => void;
  setComments: (comments: Comment[]) => void;
  addCommentToState: (comment: Comment) => void;
  incrementReaction: (movieId: string, reaction: keyof Reactions) => void;
  startCoinAnimation: () => void;
  stopCoinAnimation: () => void;
  fetchInitialData: (isAdmin: boolean) => Promise<void>;
}

// =================================================================
// 1. ZUSTAND STORE DEFINITION
// =================================================================

let isFetchingData = false;

const useMovieStore = create<MovieState>((set, get) => ({
  // --- Initial State ---
  allMovies: [],
  featuredMovies: [],
  latestReleases: [],
  searchQuery: '',
  selectedGenre: 'All Genres',
  selectedQuality: 'all',
  currentPage: 1,
  contactInfo: { telegramUrl: '', whatsappUrl: '', instagramUrl: '', email: '', whatsappNumber: '' },
  securityLogs: [],
  notifications: [],
  requests: [],
  adminProfile: null,
  comments: [],
isCoinAnimationActive: false,
  isInitialized: false,

  // --- Actions ---
  setSearchQuery: (query: string) => {
    if (get().searchQuery !== query) {
      set({ searchQuery: query, currentPage: 1 });
    }
  },
  setSelectedGenre: (genre: string) => {
    if (get().selectedGenre !== genre) {
      set({ selectedGenre: genre, searchQuery: '', currentPage: 1 });
    }
  },
  setSelectedQuality: (quality: QualityFilter) => set({ selectedQuality: quality, currentPage: 1 }),
  setCurrentPage: (page: number) => set({ currentPage: page }),
  setState: (state: Partial<MovieState>) => set(state),
  setComments: (comments) => set({ comments }),
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
  startCoinAnimation: () => set({ isCoinAnimationActive: true }),
  stopCoinAnimation: () => set({ isCoinAnimationActive: false }),
  fetchInitialData: async (isAdmin: boolean) => {
    if (get().isInitialized || isFetchingData) {
      return;
    }
    isFetchingData = true;
    
    try {
      // Always fetch the core data
      let [
        allMovies,
        notifications,
        contactInfo,
        managementTeam,
      ] = await Promise.all([
        dbFetchMovies(),
        dbFetchNotifications(),
        dbFetchContactInfo(),
        dbFetchManagementTeam(),
      ]);
      
      const stateUpdate: Partial<MovieState> = {
        allMovies,
        latestReleases: allMovies,
        featuredMovies: allMovies.filter((movie: Movie) => movie.isFeatured),
        notifications,
        contactInfo,
        managementTeam,
      };
      
      // Conditionally fetch admin-specific data only if needed and not fetched yet.
      // This is now handled by individual pages to improve performance.
      if (isAdmin) {
         const teamWithUpdatedTasks = await checkAndUpdateOverdueTasks(managementTeam, allMovies);
         stateUpdate.managementTeam = teamWithUpdatedTasks;
      }

      set({ ...stateUpdate, isInitialized: true });

    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      set({ isInitialized: true }); // Still set to true to prevent re-fetching on error
    } finally {
      isFetchingData = false;
    }
  },
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

const fetchInitialData = useMovieStore.getState().fetchInitialData;


const addSecurityLogEntry = async (action: string): Promise<void> => {
    const adminName = getAdminName() || 'unknown_admin';

    const newLog = {
        admin: adminName,
        action,
        timestamp: new Date().toISOString(),
    };
    try {
        const id = await dbAddSecurityLog(newLog);
        const existingLogs = useMovieStore.getState().securityLogs;
        useMovieStore.setState({ securityLogs: [{ id, ...newLog }, ...existingLogs] });
    } catch (error) {
        console.error("Failed to add security log:", error);
    }
};

const addMovie = async (movieData: Omit<Movie, 'id'>): Promise<void> => {
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

const updateMovie = async (id: string, updatedMovieData: Partial<Movie>): Promise<void> => {
  const updateData = { ...updatedMovieData };
  

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

const deleteMovie = async (id: string): Promise<void> => {
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

const updateContactInfo = async (info: ContactInfo): Promise<void> => {
  await dbUpdateContactInfo(info);
  useMovieStore.setState({ contactInfo: info });
  await addSecurityLogEntry('Updated Help Center Info');
};

const addNotification = async (notificationData: Omit<Notification, 'id'>): Promise<void> => {
    const id = await dbAddNotification(notificationData);
    useMovieStore.setState((state) => ({
        notifications: [{ ...notificationData, id }, ...state.notifications],
    }));
    await addSecurityLogEntry(`Added upcoming notification for: "${notificationData.movieTitle}"`);
};

const deleteNotification = async (id: string): Promise<void> => {
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

const fetchCommentsForMovie = async (movieId: string): Promise<void> => {
  try {
    if (!movieId) return;
    const comments = await dbFetchComments(movieId);
    useMovieStore.getState().setComments(comments);
  } catch (error) {
    console.error("Failed to fetch comments:", error);
  }
};

const submitComment = async (movieId: string, user: string, text: string): Promise<void> => {
    const newCommentData = {
        user,
        text,
        timestamp: new Date().toISOString(),
    };
    const id = await dbAddComment(movieId, newCommentData);
    const newComment: Comment = { id, movieId, ...newCommentData };
    useMovieStore.getState().addCommentToState(newComment);
};

const deleteComment = async (movieId: string, commentId: string): Promise<void> => {
    const comment = useMovieStore.getState().comments.find(c => c.id === commentId);
    await dbDeleteComment(movieId, commentId);
    useMovieStore.setState(state => ({
        comments: state.comments.filter(c => c.id !== commentId)
    }));
    if (comment) {
      await addSecurityLogEntry(`Deleted Comment by "${comment.user}" from Movie ID: ${movieId}`);
    }
};

const submitReaction = async (movieId: string, reaction: keyof Reactions): Promise<void> => {
    try {
        await dbUpdateReaction(movieId, reaction);
        useMovieStore.getState().incrementReaction(movieId, reaction);
    } catch (e) {
        console.error("Could not update reaction in database", e);
    }
};

// --- "Get Anything" Requests ---
const submitRequest = async (movieName: string, comment: string): Promise<UserRequest> => {
  const newRequestData: Omit<UserRequest, 'id'> = {
    movieName,
    comment,
    status: 'pending',
    timestamp: new Date().toISOString(),
  };
  const id = await dbAddRequest(newRequestData);
  const newRequest = { ...newRequestData, id };
  
  // Also update the local state for the admin panel immediately
  useMovieStore.setState(state => ({
    requests: [newRequest, ...state.requests]
  }));
  return newRequest;
};

const fetchRequests = async (): Promise<void> => {
    try {
        const requests = await dbFetchRequests();
        useMovieStore.setState({ requests });
    } catch (error) {
        console.error("Failed to fetch user requests:", error);
    }
};

const updateRequestStatus = async (requestId: string, status: UserRequest['status']): Promise<void> => {
  await dbUpdateRequestStatus(requestId, status);
  useMovieStore.setState(state => ({
    requests: state.requests.map(req => 
      req.id === requestId ? { ...req, status } : req
    ),
  }));
  await addSecurityLogEntry(`Updated request status to "${status}" for ID: ${requestId}`);
};

const deleteRequest = async (requestId: string): Promise<void> => {
  await dbDeleteRequest(requestId);
  useMovieStore.setState(state => ({
    requests: state.requests.filter(req => req.id !== requestId),
  }));
  await addSecurityLogEntry(`Deleted request ID: ${requestId}`);
};

// --- Security Logs (On-demand fetching) ---
const fetchSecurityLogs = async (): Promise<void> => {
    try {
        const logs = await dbFetchSecurityLogs();
        useMovieStore.setState({ securityLogs: logs });
    } catch (error) {
        console.error("Failed to fetch security logs:", error);
    }
};

// --- Management Team & Tasks ---

const addManagementMember = async (memberData: Omit<ManagementMember, 'id' | 'timestamp'>): Promise<void> => {
    const fullMemberData = {
      ...memberData,
      timestamp: new Date().toISOString(),
    };
    const id = await dbAddManagementMember(fullMemberData);
    useMovieStore.setState(state => ({
        managementTeam: [...state.managementTeam, { id, ...fullMemberData }].sort((a,b) => parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime()),
    }));
    await addSecurityLogEntry(`Added management member: "${memberData.name}"`);
};

const deleteManagementMember = async (id: string): Promise<void> => {
    const member = useMovieStore.getState().managementTeam.find(m => m.id === id);
    await dbDeleteManagementMember(id);
    if (member) {
        await addSecurityLogEntry(`Removed management member: "${member.name}"`);
    }
    useMovieStore.setState(state => ({
        managementTeam: state.managementTeam.filter(m => m.id !== id),
    }));
};

const updateManagementMemberTask = async (memberId: string, taskData: Omit<AdminTask, 'id' | 'status' | 'startDate'>): Promise<void> => {
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


const updateAdminTask = async (memberId: string, taskId: string, itemIndex: number, completed: boolean): Promise<void> => {
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


const removeManagementMemberTask = async (memberId: string, taskId: string): Promise<void> => {
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

const checkAndUpdateOverdueTasks = async (team: ManagementMember[], allMovies: Movie[]): Promise<ManagementMember[]> => {
    if (!team || !Array.isArray(team)) {
        console.error("checkAndUpdateOverdueTasks was called with invalid 'team' argument.");
        return [];
    }
    
    let anyTaskUpdated = false;
    
    const teamWithCalculatedWallets = await calculateAllWallets(team, allMovies);

    const finalUpdatedTeam = await Promise.all(teamWithCalculatedWallets.map(async (member) => {
        if (!member.tasks || member.tasks.length === 0) return member;

        const now = new Date();
        let tasksNeedUpdate = false;

        const updatedTasks = member.tasks.map(task => {
            if (task.status === 'completed' || task.status === 'cancelled') return task;

            const taskStartDate = parseISO(task.startDate);
            const completedMoviesForTask = allMovies
                .filter(movie => movie.uploadedBy === member.name && movie.createdAt && isAfter(parseISO(movie.createdAt), taskStartDate))
                .filter(isUploadCompleted);

            let isCompleted = false;
            let target = 0;

            if (task.type === 'target') {
                target = task.target || 0;
            } else if (task.type === 'todo') {
                target = task.items?.length || 0;
            }

            if (target > 0 && completedMoviesForTask.length >= target) {
                isCompleted = true;
            }
            
            if (isCompleted) {
                tasksNeedUpdate = true;
                anyTaskUpdated = true;
                return { 
                    ...task, 
                    status: 'completed' as const, 
                    endDate: new Date().toISOString(),
                    completedCount: completedMoviesForTask.length
                };
            } else if (isAfter(now, parseISO(task.deadline)) && task.status === 'active') {
                tasksNeedUpdate = true;
                anyTaskUpdated = true;
                return { 
                    ...task, 
                    status: 'incompleted' as const, 
                    endDate: new Date().toISOString(),
                    completedCount: completedMoviesForTask.length
                };
            }
            
            return task;
        });

        if (tasksNeedUpdate) {
            await dbUpdateManagementMember(member.id, { tasks: updatedTasks });
            await addSecurityLogEntry(`Task status automatically updated for ${member.name}.`);
            return { ...member, tasks: updatedTasks };
        }
        return member;
    }));
    
    if (anyTaskUpdated) {
        useMovieStore.setState({ managementTeam: finalUpdatedTeam });
    }
    
    return finalUpdatedTeam;
};


const calculateAllWallets = async (team: ManagementMember[], movies: Movie[]): Promise<ManagementMember[]> => {
    const updatedTeamWithWallets = await dbCalculateAllWallets(team, movies);
    useMovieStore.setState({ managementTeam: updatedTeamWithWallets });
    const adminName = getAdminName();
    if (adminName) {
        const updatedAdminProfile = updatedTeamWithWallets.find(m => m.name === adminName);
        if (updatedAdminProfile) {
            useMovieStore.setState({ adminProfile: updatedAdminProfile });
        }
    }
    return updatedTeamWithWallets;
};

const updateSettlementStatus = async (memberId: string, month: string, status: Settlement['status']): Promise<void> => {
    await dbUpdateSettlementStatus(memberId, month, status);
    
    // After updating in DB, refetch the single member and then recalculate all wallets to update the state
    const { managementTeam, allMovies } = useMovieStore.getState();
    const memberDoc = await dbFetchManagementTeam().then(team => team.find(m => m.id === memberId));
    
    if (memberDoc) {
        const updatedTeam = managementTeam.map(m => m.id === memberId ? memberDoc : m);
        await calculateAllWallets(updatedTeam, allMovies); // This will update the store
    }
    
    const memberName = memberDoc?.name || 'Unknown Admin';
    await addSecurityLogEntry(`Updated ${memberName}'s settlement for ${month} to ${status}.`);
}


export { 
    useMovieStore, 
    fetchInitialData,
    addMovie,
    updateMovie,
    deleteMovie,
    updateContactInfo,
    addNotification,
    deleteNotification,
    fetchSecurityLogs,
    fetchCommentsForMovie,
    submitComment,
    deleteComment,
    submitReaction,
    fetchRequests,
    submitRequest,
    updateRequestStatus,
    deleteRequest,
    addManagementMember,
    deleteManagementMember,
    updateManagementMemberTask,
    updateAdminTask,
    removeManagementMemberTask,
    checkAndUpdateOverdueTasks,
    calculateAllWallets,
    updateSettlementStatus
};
