export interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  year: number;
  isFeatured: boolean;
  genre: string;
}

export const featuredMovies: Movie[] = [
  {
    id: '1',
    title: 'Chrono Rift',
    posterUrl: 'https://placehold.co/400x600.png',
    year: 2024,
    isFeatured: true,
    genre: 'Sci-Fi, Action',
  },
  {
    id: '2',
    title: 'Neon Dystopia',
    posterUrl: 'https://placehold.co/400x602.png',
    year: 2024,
    isFeatured: true,
    genre: 'Cyberpunk, Thriller',
  },
  {
    id: '3',
    title: 'The Crimson Cipher',
    posterUrl: 'https://placehold.co/400x604.png',
    year: 2024,
    isFeatured: true,
    genre: 'Mystery, Crime',
  },
  {
    id: '4',
    title: 'Galaxy\'s Edge',
    posterUrl: 'https://placehold.co/400x606.png',
    year: 2024,
    isFeatured: true,
    genre: 'Space Opera, Adventure',
  },
    {
    id: '5',
    title: 'Ocean\'s Whisper',
    posterUrl: 'https://placehold.co/400x608.png',
    year: 2023,
    isFeatured: true,
    genre: 'Drama, Romance',
  },
];

export const latestReleases: Movie[] = [
  {
    id: '6',
    title: 'Forgotten Echoes',
    posterUrl: 'https://placehold.co/400x599.png',
    year: 2024,
    isFeatured: false,
    genre: 'Horror, Thriller',
  },
  {
    id: '7',
    title: 'The Alchemist\'s Heir',
    posterUrl: 'https://placehold.co/400x601.png',
    year: 2024,
    isFeatured: false,
    genre: 'Fantasy, Adventure',
  },
  {
    id: '8',
    title: 'Zero Protocol',
    posterUrl: 'https://placehold.co/400x603.png',
    year: 2024,
    isFeatured: false,
    genre: 'Action, Espionage',
  },
  {
    id: '9',
    title: 'Concrete Jungle',
    posterUrl: 'https://placehold.co/400x605.png',
    year: 2024,
    isFeatured: false,
    genre: 'Action, Crime',
  },
  {
    id: '10',
    title: 'Summer Bloom',
    posterUrl: 'https://placehold.co/400x607.png',
    year: 2024,
    isFeatured: false,
    genre: 'Comedy, Romance',
  },
  {
    id: '11',
    title: 'Path of the Ronin',
    posterUrl: 'https://placehold.co/400x609.png',
    year: 2024,
    isFeatured: false,
    genre: 'Historical, Action',
  },
   {
    id: '12',
    title: 'Helios',
    posterUrl: 'https://placehold.co/400x610.png',
    year: 2024,
    isFeatured: false,
    genre: 'Sci-Fi',
  },
  {
    id: '13',
    title: 'Quantum Entanglement',
    posterUrl: 'https://placehold.co/400x611.png',
    year: 2024,
    isFeatured: false,
    genre: 'Sci-Fi, Romance',
  },
  {
    id: '14',
    title: 'Midnight Sun',
    posterUrl: 'https://placehold.co/400x612.png',
    year: 2024,
    isFeatured: false,
    genre: 'Vampire, Romance',
  },
  {
    id: '15',
    title: 'The Last Stand',
    posterUrl: 'https://placehold.co/400x613.png',
    year: 2024,
    isFeatured: false,
    genre: 'Action, Western',
  },
  {
    id: '16',
    title: 'Project Chimera',
    posterUrl: 'https://placehold.co/400x614.png',
    year: 2024,
    isFeatured: false,
    genre: 'Sci-Fi, Horror',
  },
  {
    id: '17',
    title: 'The Gilded Cage',
    posterUrl: 'https://placehold.co/400x615.png',
    year: 2024,
    isFeatured: false,
    genre: 'Drama, Historical',
  },
];
