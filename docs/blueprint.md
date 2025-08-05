# **App Name**: VEXEL Cinema

## Core Features:

- Homepage Logic: Implementing the Core Logic for the 'VEXEL' Homepage. Details the state management, data fetching, user interactions, and component logic required to power the UI. Uses Zustand to manage the featuredMovies, latestReleases, isLoadingFeatured, isLoadingLatest, and user. Actions include fetchHomepageData, fetchFeaturedMovies, and fetchLatestReleases.
- Header & Carousel Logic: Implement the functional logic for the top section of the homepage including Hamburger Menu and Search Icon functionalities.  Snapping Carousel Logic implements Framer Motion's useScroll and useTransform hooks to implement the snapping logic.
- Main Content Grid & Data Flow: Implement the logic for the Latest Releases section, connecting to the Zustand store, subscribing to the latestReleases array and rendering the MovieCard components.
- Movie Card Functions: Implement the logic within the MovieCard.tsx component.  Includes props (movie object), Hover Animation Logic (scale: 1.03 handled by Framer Motion's whileHover prop), Dynamic Border Logic (gold-edge or grey-edge Tailwind CSS class depending on movie.isFeatured boolean prop) and Download Button Functionality with handleDownload Logic.

## Style Guidelines:

- Background color: Pure black (#000000) for a premium cinematic feel.
- Primary color: Bold Gold (#FFD700) to highlight the 'VEXEL' logo, with CTAs and interactive elements.
- Accent color: Deep Red (#A62A2A) to provide a striking contrast and draw attention to key information or calls to action; may be displayed adjacent to off-white text to highlight key information.
- Body and headline font: 'Inter' (sans-serif) for a modern, clean, and readable user interface; recommended as VEXEL’s text requirements should use this for both headlines and body text. If longer text is anticipated, using just one font family as described will result in an aesthetic best aligned to modern minimalism.
- Clean and minimalist icons for the header (hamburger menu, search) and section titles (flame or clock). Ensure all are styled to match our theme.
- Content-first layout featuring a top carousel for featured content and a grid for latest releases.
- Smooth 'snap-to-center' effect for the featured movies carousel and a gentle scale-up animation on movie card hover.