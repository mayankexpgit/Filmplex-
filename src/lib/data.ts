
export interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  year: number;
  genre: string;
  tags?: string[];
  downloadLinks?: { quality: string; url: string }[];
  synopsis?: string;
  screenshots?: string[];
  trailerUrl?: string;
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
    synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
    ],
    trailerUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
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
    synopsis: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
     screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
    ],
    trailerUrl: 'https://www.youtube.com/embed/EXeTwQWrcwY',
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
    synopsis: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
     screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
    ],
     trailerUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E',
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
    synopsis: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
     screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
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
    synopsis: 'A mentally troubled comedian embarks on a downward spiral that leads to the creation of an iconic villain.',
     screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
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
    synopsis: 'Feature adaptation of Frank Herbert\'s science fiction novel, about the son of a noble family entrusted with the protection of the most valuable asset and most vital element in the galaxy.',
     screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
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
     synopsis: 'With Spider-Man\'s identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear, forcing Peter to discover what it truly means to be Spider-Man.',
     screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
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
    synopsis: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
     screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
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
    synopsis: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.',
     screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
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
    synopsis: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
     screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
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
    synopsis: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
     screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
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
    synopsis: 'Barbie suffers a crisis that leads her to question her world and her existence.',
     screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
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
    synopsis: 'An aging Chinese immigrant is swept up in an insane adventure, where she alone can save the world by exploring other universes connecting with the lives she could have led.',
     screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
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
    synopsis: 'When the Riddler, a sadistic serial killer, begins murdering key political figures in Gotham, Batman is forced to investigate the city\'s hidden corruption and question his family\'s involvement.',
     screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
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
    synopsis: 'After more than thirty years of service as one of the Navy\'s top aviators, Pete Mitchell is where he belongs, pushing the envelope as a courageous test pilot and dodging the advancement in rank that would ground him.',
     screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
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
    synopsis: 'Jake Sully lives with his newfound family formed on the planet of Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race to protect their planet.',
     screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
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
    synopsis: 'A detective investigates the death of a patriarch of an eccentric, combative family.',
     screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
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
    synopsis: 'A young African-American visits his white girlfriend\'s parents for the weekend, where his simmering uneasiness about their reception of him eventually reaches a boiling point.',
     screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
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
    synopsis: 'In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the help of a group of female prisoners, a psychotic worshiper, and a drifter named Max.',
     screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
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
    synopsis: 'As Harvard student Mark Zuckerberg creates the social networking site that would become known as Facebook, he is sued by the twins who claimed he stole their idea, and by the co-founder who was later squeezed out of the business.',
     screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
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
    synopsis: 'A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student\'s potential.',
    screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
    ]
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
    synopsis: 'Young Blade Runner K\'s discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who\'s been missing for thirty years.',
    screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
    ]
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
    synopsis: 'While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.',
    screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
    ]
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
    synopsis: 'In a post-apocalyptic world, a family is forced to live in silence while hiding from monsters with ultra-sensitive hearing.',
    screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
    ]
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
    synopsis: 'The adventures of Gustave H, a legendary concierge at a famous hotel from the fictional Republic of Zubrowka between the first and second World Wars, and Zero Moustafa, the lobby boy who becomes his most trusted friend.',
    screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
    ]
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
    synopsis: 'A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.',
    screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
    ]
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
    synopsis: 'In a near future, a lonely writer develops an unlikely relationship with an advanced operating system designed to meet his every need.',
    screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
    ]
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
    synopsis: 'A look at three defining chapters in the life of Chiron, a young black man growing up in Miami. His epic journey to manhood is guided by the kindness, support and love of the community that helps raise him.',
    screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
    ]
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
    synopsis: 'A young boy in Hitler\'s army finds out his mother is hiding a Jewish girl in their home.',
    screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
    ]
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
    synopsis: 'April 6th, 1917. As a regiment assembles to wage war deep in enemy territory, two soldiers are assigned to race against time and deliver a message that will stop 1,600 men from walking straight into a deadly trap.',
    screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
    ]
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
    synopsis: 'A frontiersman on a fur trading expedition in the 1820s fights for survival after being mauled by a bear and left for dead by members of his own hunting team.',
    screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
    ]
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
    synopsis: 'Teen Miles Morales becomes the Spider-Man of his universe, and must join with five spider-powered individuals from other dimensions to stop a threat for all realities.',
    screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
    ]
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
    synopsis: 'American car designer Carroll Shelby and driver Ken Miles battle corporate interference and the laws of physics to build a revolutionary race car for Ford in order to defeat Ferrari at the 24 Hours of Le Mans in 1966.',
    screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
    ]
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
    synopsis: 'In a future where mutants are nearly extinct, an elderly and weary Logan leads a quiet life. But when Laura, a mutant child pursued by scientists, comes to him for help, he must get her to safety.',
    screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
    ]
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
    synopsis: 'A faded television actor and his stunt double strive to achieve fame and success in the final years of Hollywood\'s Golden Age in 1969 Los Angeles.',
    screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
    ]
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
    synopsis: 'A musician who has lost his passion for music is transported out of his body and must find his way back with the help of an infant soul learning about herself.',
    screenshots: [
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
        'https://placehold.co/1280x720.png',
    ]
  },
];
