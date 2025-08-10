
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
  increment
} from 'firebase/firestore';
import type { Movie, Notification, Comment, Reactions } from '@/lib/data';
import { initialMovies } from '@/lib/data';
import type { ContactInfo, Suggestion, SecurityLog, AdminCredentials } from '@/store/movieStore';


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
  const moviesCollection = collection(db, 'movies');
  const movieSnapshot = await getDocs(moviesCollection);
  let movieList = movieSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movie));
  
  if (movieList.length === 0) {
    movieList = await seedDatabase();
  }

  // Ensure every movie has a reactions object
  movieList.forEach(movie => {
    if (!movie.reactions) {
      movie.reactions = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
    }
  });

  return movieList;
};


export const addMovie = async (movie: Omit<Movie, 'id'>): Promise<string> => {
  const moviesCollection = collection(db, 'movies');
  const docRef = await addDoc(moviesCollection, {
      ...movie,
      reactions: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 } // Add default reactions
  });
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
    const commentsCollection = collection(db, 'movies', movieId, 'comments');
    const q = query(commentsCollection, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        movieId: movieId,
        ...doc.data()
    } as Comment));
};

export const fetchAllComments = async (): Promise<Comment[]> => {
    const movies = await fetchMovies();
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


// --- Database Seeding ---

export const seedDatabase = async (): Promise<Movie[]> => {
  const moviesCollection = collection(db, 'movies');
  const batch = writeBatch(db);
  
  const moviesToSeed = initialMovies.map(movie => {
    if (!movie.reactions) {
      return {
        ...movie,
        reactions: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 }
      };
    }
    return movie;
  });

  moviesToSeed.forEach((movie) => {
    const docRef = doc(db, 'movies', movie.id);
    batch.set(docRef, movie);
  });
  
  await batch.commit();
  console.log('Database seeded successfully!');
  return moviesToSeed;
};
