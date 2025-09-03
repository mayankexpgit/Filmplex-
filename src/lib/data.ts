

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

export interface Reactions {
  like: number;
  love: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
}

export interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: string;
  movieId: string;
}

export interface AdminTask {
  targetUploads: number;
  timeframe: 'daily' | 'weekly';
  deadline: string; // ISO String
}

export interface ManagementMember {
    id: string;
    name: string;
    info: string;
    timestamp: string; 
    task?: AdminTask;
}

export interface Movie {
  id:string;
  title: string;
  posterUrl: string;
  year: number;
  createdAt?: string; // For sorting by upload date
  uploadedBy?: string; // Name of the admin who uploaded it
  cardInfoText?: string;
  genre: string;
  language?: string;
  imdbRating?: number;
  streamingChannel?: string;
  tags?: string[];
  description?: string;
  synopsis?: string;
  trailerUrl?: string;
  screenshots?: string[];
  isFeatured?: boolean;
  stars?: string;
  creator?: string;
  quality?: string;
  qualityBadge?: 'HD' | '4K' | 'none';
  runtime?: number; // in minutes
  releaseDate?: string; // full date
  country?: string;
  
  contentType: 'movie' | 'series';
  
  // Movie-specific
  downloadLinks?: DownloadLink[];
  
  // Series-specific
  episodes?: Episode[];
  seasonDownloadLinks?: DownloadLink[];
  numberOfEpisodes?: number;

  reactions?: Reactions;
}

export interface DownloadRecord {
    id: string;
    movieId: string;
    timestamp: string; // ISO String
}

export interface Notification {
  id: string;
  movieTitle: string;
  posterUrl: string;
  releaseDate: string; // e.g. "Jun 9, 2024"
}

export const initialMovies: Movie[] = [
  {
    id: '1',
    title: 'Inception',
    posterUrl: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq27gApcjBveAabcF.jpg',
    year: 2010,
    createdAt: new Date('2024-01-01T10:00:00Z').toISOString(),
    uploadedBy: 'dev.Mayank',
    cardInfoText: 'Inception (2010)',
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
    qualityBadge: 'HD',
    downloadLinks: [
      { quality: '1080p', url: 'https://example.com/inception-4k', size: '2.5GB' },
      { quality: '720p', url: 'https://example.com/inception-hd', size: '1.2GB' },
    ],
    synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    description: `
      <strong>Download Inception (2010) Dual Audio [Hindi-English] 1080p, 720p &amp; 480p BluRay | Watch Online on FILMPLEX</strong>
      <br>
      <h4>REVIEW:</h4>
      <p>Inception is a true masterpiece from Christopher Nolan. This isn\'t your typical heist film; it\'s smart, mysterious, and visually stunning, making every scene absolutely electric. The tension is next-level, and the way the story unfolds keeps you hooked right until the jaw-dropping finale. To top it off, the performances by Leonardo DiCaprio are outstanding. It\'s a film that genuinely makes you think and leaves you wanting more.</p>
    `,
    screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
    ],
    reactions: { like: 120, love: 80, haha: 25, wow: 45, sad: 5, angry: 2 },
  },
  {
    id: '2',
    title: 'The Dark Knight',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    year: 2008,
    createdAt: new Date('2024-01-02T11:00:00Z').toISOString(),
    uploadedBy: 'dev.Bittu',
    cardInfoText: 'The Dark Knight (2008)',
    genre: 'Action, Crime, Drama',
    language: 'English',
    imdbRating: 9.0,
    tags: ['Superhero'],
    isFeatured: true,
    stars: 'Christian Bale, Heath Ledger, Aaron Eckhart',
    creator: 'Christopher Nolan',
    quality: 'BluRay 1080p, 720p',
    contentType: 'movie',
    qualityBadge: 'HD',
    downloadLinks: [
      { quality: '1080p', url: 'https://example.com/dk-hd', size: '1.5GB' },
      { quality: '720p', url: 'https://example.com/dk-720p', size: '800MB' },
    ],
    synopsis: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
    description: 'The description for The Dark Knight.',
     screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
    ],
    reactions: { like: 250, love: 150, haha: 30, wow: 60, sad: 10, angry: 8 },
  },
  {
    id: '3',
    title: 'Sakamoto Days',
    posterUrl: 'https://image.tmdb.org/t/p/w500/g8Io_s3fKx3eQdJtgoi4StkWa2f.jpg',
    year: 2024,
    createdAt: new Date('2024-01-03T12:00:00Z').toISOString(),
    uploadedBy: 'dev.Mayank',
    cardInfoText: 'Sakamoto Days - New Episodes',
    genre: 'Anime, Action, Comedy',
    language: 'Japanese',
    imdbRating: 9.1,
    tags: ['Anime', 'New'],
    isFeatured: true,
    stars: 'Taro Sakamoto, Shin Asakura, Lu Xiaotang',
    creator: 'Yuto Suzuki',
    quality: 'WEB-DL 1080p, 720p',
    contentType: 'series',
    qualityBadge: 'HD',
    episodes: [
      {
        episodeNumber: 1,
        title: "The Legendary Hitman",
        downloadLinks: [
          { quality: '1080p', url: 'https://example.com/sakamoto-ep1-1080p', size: '350MB' },
          { quality: '720p', url: 'https://example.com/sakamoto-ep1-720p', size: '150MB' },
        ],
      },
    ],
    synopsis: 'Taro Sakamoto was the ultimate assassin, feared by villains and admired by hitmen. But one day... He fell in love! Retirement, marriage, fatherhood and then... Sakamoto gained weight! The chubby guy who runs the neighborhood store is actually a former legendary hitman! Can he protect his family from danger?',
    trailerUrl: 'https://www.youtube.com/watch?v=Yf1eH-fOOrY',
    description: 'The description for Sakamoto Days.',
    screenshots: [
      'https://placehold.co/1280x720.png',
      'https://placehold.co/1280x720.png',
    ],
    reactions: { like: 500, love: 450, haha: 200, wow: 150, sad: 2, angry: 1 },
    downloadLinks: [
      { quality: '1080p', url: 'https://example.com/sakamoto-ep1-1080p', size: '350MB' },
      { quality: '720p', url: 'https://example.com/sakamoto-ep1-720p', size: '150MB' },
    ]
  }
];
