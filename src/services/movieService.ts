
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
} from 'firebase/firestore';
import type { Movie } from '@/lib/data';
import { initialFeaturedMovies, initialLatestReleases } from '@/lib/data';
import type { ContactInfo, Suggestion, SecurityLog } from '@/store/movieStore';


// --- Movie Functions ---

export const fetchMovies = async (): Promise<Movie[]> => {
  const moviesCollection = collection(db, 'movies');
  const movieSnapshot = await getDocs(moviesCollection);
  const movieList = movieSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movie));
  
  // If the database is empty, seed it with initial data.
  if (movieList.length === 0) {
    return await seedDatabase();
  }

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

// --- Singleton Document Functions (ContactInfo) ---

export const fetchContactInfo = async (): Promise<ContactInfo> => {
    const docRef = doc(db, 'singletons', 'contactInfo');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as ContactInfo;
    } else {
        // Create it if it doesn't exist
        const initialInfo = { email: 'admin@filmplex.com', message: 'For any queries, please reach out to us.' };
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
    const snapshot = await getDocs(suggestionsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Suggestion));
}

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


// --- Database Seeding ---

export const seedDatabase = async (): Promise<Movie[]> => {
  const moviesCollection = collection(db, 'movies');
  const batch = writeBatch(db);
  const allMovies = [...initialFeaturedMovies, ...initialLatestReleases];
  
  allMovies.forEach((movie) => {
    // We can use the old ID for the new document ID to maintain consistency if needed
    const docRef = doc(db, 'movies', movie.id);
    batch.set(docRef, movie);
  });
  
  await batch.commit();
  console.log('Database seeded successfully!');
  return allMovies;
};
