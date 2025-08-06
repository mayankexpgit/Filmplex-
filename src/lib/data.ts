

export interface DownloadLink {
  quality: string;
  url: string;
  size?: string;
}

export interface Episode {
  title: string;
  episodeNumber: number;
  downloadLinks: DownloadLink[];
}

export interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  year: number;
  genre: string;
  language?: string;
  imdbRating?: number;
  streamingChannel?: string;
  tags?: string[];
  description?: string;
  screenshots?: string[];
  isFeatured?: boolean;
  stars?: string;
  creator?: string;
  quality?: string;
  
  // New fields for Movie vs Series
  contentType: 'movie' | 'series';
  
  // For movies
  downloadLinks?: DownloadLink[];
  
  // For series
  episodes?: Episode[];
  seasonDownloadLinks?: DownloadLink[];
}

export interface Notification {
  id: string;
  movieTitle: string;
  posterUrl: string;
  releaseDate: string; // e.g. "Jun 9, 2024"
}

// This data is now used for initial database seeding.
export const initialMovies: Movie[] = [
  {
    id: '1',
    title: 'Inception',
    posterUrl: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq27gApcjBveAabcF.jpg',
    year: 2010,
    genre: 'Sci-Fi, Action',
    language: 'English',
    imdbRating: 8.8,
    streamingChannel: 'Netflix',
    tags: ['Mind-bending'],
    isFeatured: true,
    stars: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page',
    creator: 'Christopher Nolan',
    quality: 'BluRay 1080p, 720p',
    contentType: 'movie',
    downloadLinks: [
      { quality: '1080p', url: 'https://example.com/inception-4k', size: '2.5GB' },
      { quality: '720p', url: 'https://example.com/inception-hd', size: '1.2GB' },
    ],
    description: `
      <strong>Download Inception (2010) Dual Audio [Hindi-English] 1080p, 720p & 480p BluRay | Watch Online on FILMPLEX</strong>
      <br>
      <h4>DESCRIPTION:</h4>
      <p>Experience Inception (2010), now available for download on FILMPLEX. This film, presented in English, is available in 1080p & 720p qualities. As a standout in the Sci-Fi, Action genre, this is a must-watch. Download now and enjoy the show.</p>
      <br>
      <h4>STORYLINE:</h4>
      <p>A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.</p>
      <br>
      <h4>REVIEW:</h4>
      <p>Inception is a true masterpiece from Christopher Nolan. This isn't your typical heist film; it's smart, mysterious, and visually stunning, making every scene absolutely electric. The tension is next-level, and the way the story unfolds keeps you hooked right until the jaw-dropping finale. To top it off, the performances by Leonardo DiCaprio are outstanding. It's a film that genuinely makes you think and leaves you wanting more.</p>
    `,
    screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
    ],
  },
  // ... other movies remain the same but need contentType: 'movie'
  {
    id: '2',
    title: 'The Dark Knight',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    year: 2008,
    genre: 'Action, Crime, Drama',
    language: 'English',
    imdbRating: 9.0,
    tags: ['Superhero'],
    isFeatured: true,
    stars: 'Christian Bale, Heath Ledger, Aaron Eckhart',
    creator: 'Christopher Nolan',
    quality: 'BluRay 1080p, 720p',
    contentType: 'movie',
    downloadLinks: [
      { quality: '1080p', url: 'https://example.com/dk-hd', size: '1.5GB' },
      { quality: '720p', url: 'https://example.com/dk-720p', size: '800MB' },
    ],
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
     screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
    ],
  },
];
