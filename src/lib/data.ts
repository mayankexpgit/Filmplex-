
export interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  year: number;
  genre: string;
  tags?: string[];
  downloadLinks?: { quality: string; url: string }[];
}

// This data is now used for initial database seeding.
export const initialMovies: Movie[] = [
  {
    id: '1',
    title: 'Inception',
    posterUrl: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq27gApcjBveAabcF.jpg',
    year: 2010,
    genre: 'Sci-Fi, Action',
    tags: ['Mind-bending'],
    downloadLinks: [
      { quality: '4K/HD', url: 'https://example.com/inception-4k' },
      { quality: 'HD', url: 'https://example.com/inception-hd' },
    ],
  },
  {
    id: '2',
    title: 'The Dark Knight',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    year: 2008,
    genre: 'Action, Crime, Drama',
    tags: ['Superhero'],
    downloadLinks: [
      { quality: 'HD', url: 'https://example.com/dk-hd' },
      { quality: '720p', url: 'https://example.com/dk-720p' },
    ],
  },
  {
    id: '3',
    title: 'Interstellar',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    year: 2014,
    genre: 'Adventure, Drama, Sci-Fi',
    tags: ['Space'],
    downloadLinks: [
      { quality: '4K/HD', url: 'https://example.com/interstellar-4k' },
    ],
  },
  {
    id: '4',
    title: 'Parasite',
    posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    year: 2019,
    genre: 'Comedy, Drama, Thriller',
    tags: ['Award-winning'],
    downloadLinks: [
      { quality: 'HD', url: 'https://example.com/parasite-hd' },
    ],
  },
  {
    id: '5',
    title: 'Joker',
    posterUrl: 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg',
    year: 2019,
    genre: 'Crime, Drama, Thriller',
    tags: ['Psychological'],
    downloadLinks: [
       { quality: '4K/HD', url: 'https://example.com/joker-4k' },
    ],
  },
  {
    id: '6',
    title: 'Dune',
    posterUrl: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIY2VhrhXLon3fCn.jpg',
    year: 2021,
    genre: 'Sci-Fi, Adventure',
    tags: ['Epic'],
     downloadLinks: [
      { quality: 'HD', url: 'https://example.com/dune-hd' },
    ],
  },
  {
    id: '7',
    title: 'Spider-Man: No Way Home',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irDe3GPvareA-M0mp.jpg',
    year: 2021,
    genre: 'Action, Adventure, Sci-Fi',
    tags: ['Marvel'],
     downloadLinks: [
      { quality: '4K/HD', url: 'https://example.com/sm-nwh-4k' },
    ],
  },
  {
    id: '8',
    title: 'The Matrix',
    posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9Gz0gSbn0QZfo.jpg',
    year: 1999,
    genre: 'Action, Sci-Fi',
    tags: ['Classic'],
     downloadLinks: [
      { quality: 'HD', url: 'https://example.com/matrix-hd' },
    ],
  },
  {
    id: '9',
    title: 'Forrest Gump',
    posterUrl: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
    year: 1994,
    genre: 'Comedy, Drama, Romance',
    tags: ['Heartwarming'],
     downloadLinks: [
      { quality: '4K/HD', url: 'https://example.com/fg-4k' },
    ],
  },
  {
    id: '10',
    title: 'Pulp Fiction',
    posterUrl: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    year: 1994,
    genre: 'Crime, Drama',
    tags: ['Iconic'],
     downloadLinks: [
      { quality: 'HD', url: 'https://example.com/pf-hd' },
    ],
  },
  {
    id: '11',
    title: 'Oppenheimer',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    year: 2023,
    genre: 'Biography, Drama, History',
    tags: ['New Release'],
     downloadLinks: [
      { quality: '4K/HD', url: 'https://example.com/oppenheimer-4k' },
    ],
  },
  {
    id: '12',
    title: 'Barbie',
    posterUrl: 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
    year: 2023,
    genre: 'Comedy, Adventure, Fantasy',
    tags: ['New Release'],
     downloadLinks: [
      { quality: 'HD', url: 'https://example.com/barbie-hd' },
    ],
  },
  {
    id: '13',
    title: 'Everything Everywhere All at Once',
    posterUrl: 'https://image.tmdb.org/t/p/w500/w3LxiVYUpllpCmst2stCDsqeRJt.jpg',
    year: 2022,
    genre: 'Action, Adventure, Sci-Fi',
    tags: ['New Release'],
     downloadLinks: [
      { quality: '4K/HD', url: 'https://example.com/eeao-4k' },
    ],
  },
  {
    id: '14',
    title: 'The Batman',
    posterUrl: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    year: 2022,
    genre: 'Action, Crime, Drama',
    tags: ['New Release'],
     downloadLinks: [
      { quality: 'HD', url: 'https://example.com/batman-hd' },
    ],
  },
  {
    id: '15',
    title: 'Top Gun: Maverick',
    posterUrl: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',
    year: 2022,
    genre: 'Action, Drama',
    tags: ['New Release'],
     downloadLinks: [
      { quality: '4K/HD', url: 'https://example.com/tgm-4k' },
    ],
  },
  {
    id: '16',
    title: 'Avatar: The Way of Water',
    posterUrl: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    year: 2022,
    genre: 'Sci-Fi, Adventure, Action',
    tags: ['New Release'],
     downloadLinks: [
      { quality: 'HD', url: 'https://example.com/avatar2-hd' },
    ],
  },
   {
    id: '17',
    title: 'Knives Out',
    posterUrl: 'https://image.tmdb.org/t/p/w500/pThyQovXQrw2m0s9x82twY4mrJg.jpg',
    year: 2019,
    genre: 'Comedy, Crime, Mystery',
    tags: ['Popular'],
     downloadLinks: [
      { quality: 'HD', url: 'https://example.com/ko-hd' },
    ],
  },
  {
    id: '18',
    title: 'Get Out',
    posterUrl: 'https://image.tmdb.org/t/p/w500/kLuEtcQ9w0iGl2dACcs2eFPq0T5.jpg',
    year: 2017,
    genre: 'Horror, Mystery, Thriller',
    tags: ['Critically Acclaimed'],
     downloadLinks: [
      { quality: '4K/HD', url: 'https://example.com/go-4k' },
    ],
  },
  {
    id: '19',
    title: 'Mad Max: Fury Road',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg',
    year: 2015,
    genre: 'Action, Adventure, Sci-Fi',
    tags: ['Adrenaline Rush'],
     downloadLinks: [
      { quality: 'HD', url: 'https://example.com/mmfr-hd' },
    ],
  },
  {
    id: '20',
    title: 'The Social Network',
    posterUrl: 'https://image.tmdb.org/t/p/w500/n0ybibhJtQ5icDqNs2BTjpSFbOk.jpg',
    year: 2010,
    genre: 'Drama, History',
    tags: ['Biography'],
     downloadLinks: [
      { quality: '4K/HD', url: 'https://example.com/tsn-4k' },
    ],
  },
  {
    id: '21',
    title: 'Whiplash',
    posterUrl: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg',
    year: 2014,
    genre: 'Drama, Music',
    tags: ['Intense'],
     downloadLinks: [
      { quality: 'HD', url: 'https://example.com/whiplash-hd' },
    ],
  },
  {
    id: '22',
    title: 'Blade Runner 2049',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    year: 2017,
    genre: 'Sci-Fi, Thriller',
    tags: ['Visually Stunning'],
     downloadLinks: [
      { quality: '4K/HD', url: 'https://example.com/br2049-4k' },
    ],
  },
  {
    id: '23',
    title: 'La La Land',
    posterUrl: 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdEjzEVX5d6CeJo.jpg',
    year: 2016,
    genre: 'Comedy, Drama, Music',
    tags: ['Musical'],
     downloadLinks: [
      { quality: 'HD', url: 'https://example.com/lll-hd' },
    ],
  },
  {
    id: '24',
    title: 'A Quiet Place',
    posterUrl: 'https://image.tmdb.org/t/p/w500/nAU74GmpUk7t5iklEp3bufwDq4n.jpg',
    year: 2018,
    genre: 'Horror, Sci-Fi',
    tags: ['Suspenseful'],
     downloadLinks: [
      { quality: '4K/HD', url: 'https://example.com/aqp-4k' },
    ],
  },
  {
    id: '25',
    title: 'The Grand Budapest Hotel',
    posterUrl: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg',
    year: 2014,
    genre: 'Comedy, Drama',
    tags: ['Quirky'],
     downloadLinks: [
      { quality: 'HD', url: 'https://example.com/gbh-hd' },
    ],
  },
  {
    id: '26',
    title: 'Arrival',
    posterUrl: 'https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg',
    year: 2016,
    genre: 'Drama, Sci-Fi',
    tags: ['Thought-Provoking'],
     downloadLinks: [
      { quality: '4K/HD', url: 'https://example.com/arrival-4k' },
    ],
  },
  {
    id: '27',
    title: 'Her',
    posterUrl: 'https://image.tmdb.org/t/p/w500/eCOtqtf5sALt02v9i8uY0Sj32yT.jpg',
    year: 2013,
    genre: 'Romance, Sci-Fi, Drama',
    tags: ['Futuristic'],
     downloadLinks: [
      { quality: 'HD', url: 'https://example.com/her-hd' },
    ],
  },
  {
    id: '28',
    title: 'Moonlight',
    posterUrl: 'https://image.tmdb.org/t/p/w500/490v25cK4A4v4KdcK2c7a33a2s.jpg',
    year: 2016,
    genre: 'Drama',
    tags: ['Oscar Winner'],
     downloadLinks: [
      { quality: '4K/HD', url: 'https://example.com/moonlight-4k' },
    ],
  },
  {
    id: '29',
    title: 'Jojo Rabbit',
    posterUrl: 'https://image.tmdb.org/t/p/w500/7GsM4fCHb3Y2F7eP2xxlK22r5W3.jpg',
    year: 2019,
    genre: 'Comedy, Drama, War',
    tags: ['Satire'],
     downloadLinks: [
      { quality: 'HD', url: 'https://example.com/jojo-hd' },
    ],
  },
  {
    id: '30',
    title: '1917',
    posterUrl: 'https://image.tmdb.org/t/p/w500/iZf0KyrE25z1sage4SYFLCCrMi9.jpg',
    year: 2019,
    genre: 'War, Drama',
    tags: ['One-Shot'],
     downloadLinks: [
      { quality: '4K/HD', url: 'https://example.com/1917-4k' },
    ],
  },
  {
    id: '31',
    title: 'The Revenant',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ji4FvocS29E0GKS1UNUuQYm7yiu.jpg',
    year: 2015,
    genre: 'Western, Drama, Adventure',
    tags: ['Survival'],
     downloadLinks: [
      { quality: 'HD', url: 'https://example.com/revenant-hd' },
    ],
  },
  {
    id: '32',
    title: 'Spider-Man: Into the Spider-Verse',
    posterUrl: 'https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
    year: 2018,
    genre: 'Animation, Action, Adventure',
    tags: ['Animated'],
     downloadLinks: [
      { quality: '4K/HD', url: 'https://example.com/sm-itsv-4k' },
    ],
  },
  {
    id: '33',
    title: 'Ford v Ferrari',
    posterUrl: 'https://image.tmdb.org/t/p/w500/6ApDtO7xaWAfPZfi2wAbjdsSzaX.jpg',
    year: 2019,
    genre: 'Action, Drama',
    tags: ['Racing'],
     downloadLinks: [
      { quality: 'HD', url: 'https://example.com/fvf-hd' },
    ],
  },
  {
    id: '34',
    title: 'Logan',
    posterUrl: 'https://image.tmdb.org/t/p/w500/fnbjcRDYn6YviCcePDnGdyAkYsB.jpg',
    year: 2017,
    genre: 'Action, Drama, Sci-Fi',
    tags: ['Gritty'],
     downloadLinks: [
      { quality: '4K/HD', url: 'https://example.com/logan-4k' },
    ],
  },
  {
    id: '35',
    title: 'Once Upon a Time in Hollywood',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8j58iEBw9pYFD2L7lqRN4kdDy9e.jpg',
    year: 2019,
    genre: 'Comedy, Drama',
    tags: ['Tarantino'],
     downloadLinks: [
      { quality: 'HD', url: 'https://example.com/ouatih-hd' },
    ],
  },
  {
    id: '36',
    title: 'Soul',
    posterUrl: 'https://image.tmdb.org/t/p/w500/hm58Jw4Lw8I58gUvbwPIup1RTRh.jpg',
    year: 2020,
    genre: 'Animation, Comedy, Drama',
    tags: ['Pixar'],
     downloadLinks: [
      { quality: '4K/HD', url: 'https://example.com/soul-4k' },
    ],
  },
];
