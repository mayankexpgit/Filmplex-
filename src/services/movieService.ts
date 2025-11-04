

'use server';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  getDoc,
  setDoc,
  query,
  orderBy,
  increment,
  limit,
  deleteField,
} from 'firebase/firestore';
import type { Movie, Notification, Comment, Reactions, ManagementMember, AdminTask, DownloadRecord, Wallet } from '@/lib/data';
import type { ContactInfo, Suggestion, SecurityLog, AdminCredentials } from '@/store/movieStore';
import { isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isBefore } from 'date-fns';


// --- Admin Credentials ---

export const fetchAdminCredentials = async (): Promise<AdminCredentials> => {
    const docRef = doc(db, 'singletons', 'adminCredentials');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as AdminCredentials;
    } else {
        // If credentials don't exist, create them with the user's requested defaults.
        const defaultCredentials: AdminCredentials = { 
            validUsername: 'adminfilmplex@90',
            validPassword: 'admin2189movie'
        };
        await setDoc(docRef, defaultCredentials);
        console.log("Default admin credentials created in Firestore.");
        return defaultCredentials;
    }
}


// --- Movie Functions ---

export const fetchMovies = async (): Promise<Movie[]> => {
  // Fetch all documents from the 'movies' collection without any specific query.
  // This ensures that every single movie in the database is retrieved.
  const moviesCollectionRef = collection(db, 'movies');
  const movieSnapshot = await getDocs(moviesCollectionRef);
  let movieList = movieSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movie));
  
  // Ensure every movie has a reactions object to prevent runtime errors
  movieList.forEach(movie => {
    if (!movie.reactions) {
      movie.reactions = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
    }
  });

  return movieList;
};


export const addMovie = async (movie: Omit<Movie, 'id'>): Promise<string> => {
  const moviesCollection = collection(db, 'movies');
  const docRef = await addDoc(moviesCollection, movie);
  return docRef.id;
};

export const updateMovie = async (id: string, updatedMovie: Partial<Movie>): Promise<void> => {
  const movieDoc = doc(db, 'movies', id);
  await updateDoc(movieDoc, updatedMovie);
};

export const deleteMovie = async (id: string): Promise<void> => {
  const movieDoc = doc(db, 'movies', id);
  await deleteDoc(movieDoc);
};

// --- Reactions ---
export const updateReaction = async (movieId: string, reactionType: keyof Reactions): Promise<void> => {
    const movieDoc = doc(db, 'movies', movieId);
    const fieldToUpdate = `reactions.${reactionType}`;
    await updateDoc(movieDoc, {
        [fieldToUpdate]: increment(1)
    });
};

// --- Comments ---
export const fetchComments = async (movieId: string): Promise<Comment[]> => {
    if (!movieId) {
        console.error("fetchComments called with undefined movieId");
        return [];
    }
    const commentsCollection = collection(db, 'movies', movieId, 'comments');
    const q = query(commentsCollection, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        movieId: movieId,
        ...doc.data()
    } as Comment));
};

export const fetchAllComments = async (movies: Movie[]): Promise<Comment[]> => {
    const allComments: Comment[] = [];
    for (const movie of movies) {
        const comments = await fetchComments(movie.id);
        allComments.push(...comments.map(c => ({...c, movieTitle: movie.title } as any)));
    }
    // Sort by date descending
    allComments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return allComments;
}


export const addComment = async (movieId: string, comment: Omit<Comment, 'id' | 'movieId'>): Promise<string> => {
    const commentsCollection = collection(db, 'movies', movieId, 'comments');
    const docRef = await addDoc(commentsCollection, comment);
    return docRef.id;
};

export const deleteComment = async (movieId: string, commentId: string): Promise<void> => {
    const commentDoc = doc(db, 'movies', movieId, 'comments', commentId);
    await deleteDoc(commentDoc);
};


// --- Singleton Document Functions (ContactInfo) ---

export const fetchContactInfo = async (): Promise<ContactInfo> => {
    const docRef = doc(db, 'singletons', 'contactInfo');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as ContactInfo;
    } else {
        const initialInfo: ContactInfo = { 
            email: 'admin@filmplex.com', 
            telegramUrl: 'https://t.me/filmplex',
            whatsappUrl: 'https://wa.me/1234567890',
            instagramUrl: 'https://instagram.com/filmplex',
            whatsappNumber: '+1 234-567-890'
        };
        await setDoc(docRef, initialInfo);
        return initialInfo;
    }
}

export const updateContactInfo = async (info: ContactInfo): Promise<void> => {
    const docRef = doc(db, 'singletons', 'contactInfo');
    await setDoc(docRef, info, { merge: true });
}

// --- Management Team Functions ---

export const fetchManagementTeam = async (): Promise<ManagementMember[]> => {
    const teamCollection = collection(db, 'management');
    const q = query(teamCollection, orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ManagementMember));
};

export const addManagementMember = async (member: Omit<ManagementMember, 'id'>): Promise<string> => {
    const teamCollection = collection(db, 'management');
    const docRef = await addDoc(teamCollection, member);
    return docRef.id;
};

export const updateManagementMember = async (id: string, updates: Partial<Omit<ManagementMember, 'id'>>): Promise<void> => {
  const memberDoc = doc(db, 'management', id);
  const finalUpdates: { [key: string]: any } = { ...updates };
  
  // If task is explicitly set to null or undefined in the update object,
  // we interpret this as a request to delete the field in Firestore.
  if ('task' in updates && (updates.task === null || updates.task === undefined)) {
    finalUpdates.task = deleteField();
  }

  await updateDoc(memberDoc, finalUpdates);
};


export const deleteManagementMember = async (id: string): Promise<void> => {
    const memberDoc = doc(db, 'management', id);
    await deleteDoc(memberDoc);
};


// --- Suggestions Functions ---

export const fetchSuggestions = async (): Promise<Suggestion[]> => {
    const suggestionsCollection = collection(db, 'suggestions');
    const q = query(suggestionsCollection, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Suggestion));
}

export const addSuggestion = async (suggestion: Omit<Suggestion, 'id'>): Promise<string> => {
    const suggestionsCollection = collection(db, 'suggestions');
    const docRef = await addDoc(suggestionsCollection, suggestion);
    return docRef.id;
};

export const deleteSuggestion = async (id: string): Promise<void> => {
    const suggestionDoc = doc(db, 'suggestions', id);
    await deleteDoc(suggestionDoc);
}

// --- Security Log Functions ---

export const fetchSecurityLogs = async (): Promise<SecurityLog[]> => {
    const logsCollection = collection(db, 'securityLogs');
    const q = query(logsCollection, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SecurityLog));
}

export const addSecurityLog = async (log: Omit<SecurityLog, 'id'>): Promise<string> => {
    const logsCollection = collection(db, 'securityLogs');
    const docRef = await addDoc(logsCollection, log);
    return docRef.id;
}

// --- Notification Functions ---

export const fetchNotifications = async (): Promise<Notification[]> => {
    const notificationsCollection = collection(db, 'notifications');
    const snapshot = await getDocs(notificationsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
};

export const addNotification = async (notification: Omit<Notification, 'id'>): Promise<string> => {
    const notificationsCollection = collection(db, 'notifications');
    const docRef = await addDoc(notificationsCollection, notification);
    return docRef.id;
};

export const deleteNotification = async (id: string): Promise<void> => {
    const notificationDoc = doc(db, 'notifications', id);
    await deleteDoc(notificationDoc);
};

// --- Download Analytics Functions ---
export const recordDownload = async (movieId: string): Promise<void> => {
    const downloadsCollection = collection(db, 'downloads');
    await addDoc(downloadsCollection, {
        movieId: movieId,
        timestamp: new Date().toISOString()
    });
}

export const fetchDownloadAnalytics = async (): Promise<DownloadRecord[]> => {
    const downloadsCollection = collection(db, 'downloads');
    const q = query(downloadsCollection, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DownloadRecord));
}


// --- Wallet Calculation Service ---

const hasValidLinks = (movie: Movie): boolean => {
    if (movie.contentType === 'movie' && movie.downloadLinks) {
        return movie.downloadLinks.some(l => l && l.url && l.url.trim() !== '');
    }
    if (movie.contentType === 'series') {
        const hasEpisodeLinks = movie.episodes?.some(ep => ep.downloadLinks.some(l => l && l.url && l.url.trim() !== ''));
        const hasSeasonLinks = movie.seasonDownloadLinks?.some(l => l && l.url && l.url.trim() !== '');
        return !!(hasEpisodeLinks || hasSeasonLinks);
    }
    return false;
}

const getLinkCount = (movie: Movie): number => {
    if (movie.contentType === 'movie') {
        return movie.downloadLinks?.filter(l => l && l.url && l.url.trim() !== '').length || 0;
    }
    if (movie.contentType === 'series') {
        const episodeLinks = movie.episodes?.reduce((sum, ep) => sum + (ep.downloadLinks?.filter(l => l && l.url && l.url.trim() !== '').length || 0), 0) || 0;
        const seasonLinks = movie.seasonDownloadLinks?.filter(l => l && l.url && l.url.trim() !== '').length || 0;
        return episodeLinks + seasonLinks;
    }
    return 0;
}

const calculateEarnings = (movie: Movie, walletCalculationDate: Date): number => {
    if (!hasValidLinks(movie) || !movie.createdAt) {
        return 0;
    }
    
    const isLegacy = isBefore(parseISO(movie.createdAt), walletCalculationDate);

    if (isLegacy) {
        // Flat rate of ₹0.50 for any legacy upload with at least one valid link.
        return 0.50;
    }

    // New rule calculation for uploads on or after the wallet feature date.
    const linkCount = getLinkCount(movie);
    if (movie.contentType === 'movie') {
        const earnings = Math.floor(linkCount / 2) * 0.15;
        return Math.min(earnings, 0.40);
    } else { // series
        return Math.floor(linkCount / 2) * 0.30;
    }
};

export const calculateAllWallets = async (team: ManagementMember[], movies: Movie[]): Promise<ManagementMember[]> => {
    const walletCalculationDate = new Date('2025-11-04T00:00:00Z');
    const now = new Date();

    const updatedTeam = team.map(member => {
        const memberMovies = movies.filter(m => m.uploadedBy === member.name && m.createdAt);
        
        let totalEarnings = 0;
        let monthly = 0;
        let weekly = 0;

        memberMovies.forEach(movie => {
            const movieDate = parseISO(movie.createdAt!);
            const earnings = calculateEarnings(movie, walletCalculationDate);
            
            totalEarnings += earnings;
            if (isWithinInterval(movieDate, { start: startOfMonth(now), end: endOfMonth(now) })) {
                monthly += earnings;
            }
            if (isWithinInterval(movieDate, { start: startOfWeek(now), end: endOfWeek(now) })) {
                weekly += earnings;
            }
        });

        // Penalty for incompleted tasks
        const incompletedTasksCount = member.tasks?.filter(t => t.status === 'incompleted').length || 0;
        const penalty = incompletedTasksCount * 0.50;

        const totalAfterPenalty = totalEarnings - penalty;

        const wallet: Wallet = {
            total: parseFloat(totalAfterPenalty.toFixed(2)),
            monthly: parseFloat(monthly.toFixed(2)),
            weekly: parseFloat(weekly.toFixed(2)),
        };

        return { ...member, wallet };
    });

    // Batch update Firestore
    const batch = writeBatch(db);
    updatedTeam.forEach(member => {
        if (member.wallet) {
            const memberRef = doc(db, 'management', member.id);
            batch.update(memberRef, { wallet: member.wallet });
        }
    });
    await batch.commit();
    console.log("Admin wallets updated in Firestore.");
    
    return updatedTeam;
};
