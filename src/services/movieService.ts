
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
import type { Movie, Notification, Comment, Reactions, ManagementMember, AdminTask, DownloadRecord, Wallet, Settlement, UserRequest } from '@/lib/data';
import type { ContactInfo, SecurityLog, AdminCredentials } from '@/store/movieStore';
import { isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isBefore, format as formatDate, isAfter } from 'date-fns';
import { Decimal } from 'decimal.js';


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
  const moviesCollectionRef = collection(db, 'movies');
  const movieSnapshot = await getDocs(moviesCollectionRef);
  let movieList = movieSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movie));

  const batch = writeBatch(db);
  let hasUpdates = false;

  for (const movie of movieList) {
    // Ensure every movie has a reactions object to prevent runtime errors
    if (!movie.reactions) {
      movie.reactions = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
    }

    // One-time migration: If 'earning' is not present, calculate and save it.
    if (movie.earning === undefined) {
      const calculatedEarning = await calculateEarning(movie);
      movie.earning = calculatedEarning;
      const movieRef = doc(db, 'movies', movie.id);
      batch.update(movieRef, { earning: calculatedEarning });
      hasUpdates = true;
    }
  }

  if (hasUpdates) {
    await batch.commit();
    console.log("Successfully migrated earnings for existing movies.");
  }

  return movieList;
};


export const addMovie = async (movie: Omit<Movie, 'id'>): Promise<string> => {
  const earning = await calculateEarning(movie as Movie);
  const movieWithEarning = { ...movie, earning };
  const moviesCollection = collection(db, 'movies');
  const docRef = await addDoc(moviesCollection, movieWithEarning);
  return docRef.id;
};

export const updateMovie = async (id: string, updatedMovie: Partial<Movie>): Promise<void> => {
  const earning = await calculateEarning({ ...await getDoc(doc(db, 'movies', id)).then(d => d.data()), ...updatedMovie } as Movie);
  const movieWithEarning = { ...updatedMovie, earning };
  const movieDoc = doc(db, 'movies', id);
  await updateDoc(movieDoc, movieWithEarning);
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

// --- "Get Anything" User Requests ---
export const fetchRequests = async (): Promise<UserRequest[]> => {
    const requestsCollection = collection(db, 'requests');
    const q = query(requestsCollection, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserRequest));
}

export const addRequest = async (requestData: Omit<UserRequest, 'id'>): Promise<string> => {
    const requestsCollection = collection(db, 'requests');
    const docRef = await addDoc(requestsCollection, requestData);
    return docRef.id;
};


export const updateRequestStatus = async (requestId: string, status: UserRequest['status']): Promise<void> => {
    const requestDoc = doc(db, 'requests', requestId);
    await updateDoc(requestDoc, { status });
}

export const deleteRequest = async (requestId: string): Promise<void> => {
    const requestDoc = doc(db, 'requests', requestId);
    await deleteDoc(requestDoc);
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
  
  if (finalUpdates.tasks === undefined) {
    // If tasks is explicitly set to undefined, delete the field.
    finalUpdates.tasks = deleteField();
  }

  await updateDoc(memberDoc, finalUpdates);
};


export const deleteManagementMember = async (id: string): Promise<void> => {
    const memberDoc = doc(db, 'management', id);
    await deleteDoc(memberDoc);
};

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


// --- Wallet & Settlement Calculation Service ---

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

const getLinkCount = (movie: Movie, type: 'episode' | 'season'): number => {
    if (movie.contentType !== 'series') return 0;

    if (type === 'episode') {
        return movie.episodes?.reduce((sum, ep) => sum + (ep.downloadLinks?.filter(l => l && l.url && l.url.trim() !== '').length || 0), 0) || 0;
    }
    if (type === 'season') {
        return movie.seasonDownloadLinks?.filter(l => l && l.url && l.url.trim() !== '').length || 0;
    }
    return 0;
};

export const calculateEarning = async (movie: Movie): Promise<number> => {
    if (!hasValidLinks(movie) || !movie.createdAt) {
        return 0;
    }
    
    const walletCalculationDate = new Date('2025-11-04T00:00:00.000Z');
    const isLegacy = isBefore(parseISO(movie.createdAt), walletCalculationDate);

    if (isLegacy) {
        return new Decimal(0.50).toNumber();
    }
    
    if (movie.contentType === 'movie') {
        const linkCount = movie.downloadLinks?.filter(l => l && l.url && l.url.trim() !== '').length || 0;
        const earnings = new Decimal(linkCount).times(0.10);
        return Decimal.min(earnings, 0.40).toNumber();
    } else { // series
        const episodeLinkCount = getLinkCount(movie, 'episode');
        const seasonLinkCount = getLinkCount(movie, 'season');
        const episodeEarnings = new Decimal(episodeLinkCount).times(0.06);
        const seasonEarnings = new Decimal(seasonLinkCount).times(0.10);
        return episodeEarnings.plus(seasonEarnings).toNumber();
    }
};

export const calculateAllWallets = async (team: ManagementMember[], movies: Movie[]): Promise<ManagementMember[]> => {
    const now = new Date();
    const currentMonthStr = formatDate(now, 'yyyy-MM');

    const updatedTeam = await Promise.all(team.map(async (member) => {
        const memberMovies = movies.filter(m => m.uploadedBy === member.name && m.createdAt);
        
        let totalEarnings = new Decimal(0);
        let currentMonthlyEarnings = new Decimal(0);
        let weekly = new Decimal(0);

        for (const movie of memberMovies) {
            const earnings = new Decimal(movie.earning ?? await calculateEarning(movie));
            totalEarnings = totalEarnings.plus(earnings);
            
            const movieDate = parseISO(movie.createdAt!);
            if (isWithinInterval(movieDate, { start: startOfWeek(now), end: endOfWeek(now) })) {
                weekly = weekly.plus(earnings);
            }
            if (isWithinInterval(movieDate, { start: startOfMonth(now), end: endOfMonth(now) })) {
                currentMonthlyEarnings = currentMonthlyEarnings.plus(earnings);
            }
        }

        const incompletedTasksCount = member.tasks?.filter(t => t.status === 'incompleted').length || 0;
        const penalty = new Decimal(incompletedTasksCount).times(0.50);

        const totalAfterPenalty = totalEarnings.minus(penalty);

        const settlements = [...(member.settlements || [])];
        let currentMonthSettlement = settlements.find(s => s.month === currentMonthStr);
        
        if (!currentMonthSettlement) {
            currentMonthSettlement = {
                month: currentMonthStr,
                status: 'pending',
                amount: currentMonthlyEarnings.toDecimalPlaces(2).toNumber()
            };
            settlements.push(currentMonthSettlement);
        } else {
             currentMonthSettlement.amount = currentMonthlyEarnings.toDecimalPlaces(2).toNumber();
        }

        let finalMonthlyDisplay = new Decimal(currentMonthlyEarnings);
        if (currentMonthSettlement.status === 'credited' || currentMonthSettlement.status === 'penalty') {
            const settlementDate = currentMonthSettlement.settledAt ? parseISO(currentMonthSettlement.settledAt) : new Date(0);
            
            let earningsAfterSettlement = new Decimal(0);
            for (const movie of memberMovies) {
                 const movieDate = parseISO(movie.createdAt!);
                 if (isWithinInterval(movieDate, { start: startOfMonth(now), end: endOfMonth(now) }) && isAfter(movieDate, settlementDate)) {
                    earningsAfterSettlement = earningsAfterSettlement.plus(new Decimal(movie.earning ?? await calculateEarning(movie)));
                 }
            }
            finalMonthlyDisplay = earningsAfterSettlement;
        }

        const wallet: Wallet = {
            total: totalAfterPenalty.toDecimalPlaces(2).toNumber(),
            monthly: finalMonthlyDisplay.toDecimalPlaces(2).toNumber(),
            weekly: weekly.toDecimalPlaces(2).toNumber(),
        };
        
        return { ...member, wallet, settlements };
    }));

    const batch = writeBatch(db);
    updatedTeam.forEach(member => {
        const memberRef = doc(db, 'management', member.id);
        const updates: Partial<ManagementMember> = {};
        if (member.wallet) updates.wallet = member.wallet;
        if (member.settlements) updates.settlements = member.settlements;
        batch.update(memberRef, updates);
    });
    await batch.commit();
    console.log("Admin wallets and settlements updated in Firestore.");
    
    return updatedTeam;
};

// This function needs to be exported to be used in the store
export const updateSettlementStatus = async (memberId: string, month: string, status: 'pending' | 'credited' | 'penalty'): Promise<void> => {
    const memberDoc = doc(db, 'management', memberId);
    const memberSnap = await getDoc(memberDoc);
    if (!memberSnap.exists()) return;

    const member = memberSnap.data() as ManagementMember;
    const settlements = [...(member.settlements || [])];
    const settlementIndex = settlements.findIndex(s => s.month === month);

    if (settlementIndex > -1) {
        settlements[settlementIndex].status = status;
        if (status === 'credited' || status === 'penalty') {
             settlements[settlementIndex].settledAt = new Date().toISOString();
        } else if (status === 'pending') {
            delete settlements[settlementIndex].settledAt;
        }
    } else if (status !== 'pending') {
        settlements.push({
            month,
            status,
            amount: 0, 
            settledAt: new Date().toISOString()
        });
    }

    await updateDoc(memberDoc, { settlements });
};
