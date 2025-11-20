'use server';
/**
 * @fileOverview A flow to fetch movie details.
 * This flow uses the TMDb API for factual data and manually constructs other fields.
 *
 * - getMovieDetails - A function that fetches movie details based on the title and year.
 * - searchTMDb - A function that searches TMDb for movies and series.
 * - MovieDetailsInput - The input type for the getMovieDetails function.
 * - MovieDetailsOutput - The return type for the getMovieDetails function.
 */

import { z } from 'zod';
import { fetchMovieDetailsFromTMDb, searchMoviesOnTMDb, type TMDbSearchResult } from '@/services/tmdbService';

const MovieDetailsInputSchema = z.object({
  tmdbId: z.number().describe('The TMDb ID of the movie or series to fetch details for.'),
  type: z.enum(['movie', 'series']).describe('The type of content to fetch: movie or series.')
});
export type MovieDetailsInput = z.infer<typeof MovieDetailsInputSchema>;

const MovieDetailsOutputSchema = z.object({
  title: z.string().describe('The title of the movie.'),
  year: z.number().describe('The release year of the movie.'),
  genre: z.string().describe('A comma-separated string of genres for the movie.'),
  imdbRating: z.number().describe('The IMDb rating of the movie, out of 10.'),
  stars: z.string().describe('A comma-separated string of the main actors.'),
  creator: z.string().describe('The director of the movie.'),
  tags: z.array(z.string()).describe('An array of relevant tags (e.g., "Superhero", "Mind-bending", "Based on a true story").'),
  synopsis: z.string().describe('A brief, one-paragraph synopsis of the movie plot.'),
  description: z.string().describe('A longer, more detailed description of the movie, formatted in HTML.'),
  cardInfoText: z.string().describe("A concise, multi-line info string for the movie card, approximately 6-7 lines long. It must follow this exact format: 'Filmplex – {{title}} ({{year}})\\n[Audio Info]\\n[Available Qualities]\\n[Source]\\n[Encoding Details]'. Example: 'Filmplex – Tenet (2020)\\nDual Audio [Hindi-Eng]\\n1080p, 720p & 480p\\n[WEB-DL]\\nx264 | HEVC'."),
  posterUrl: z.string().describe("The URL of the movie poster."),
  trailerUrl: z.string().optional().describe("The URL of the movie trailer."),
  runtime: z.number().optional().describe('The runtime of the movie in minutes.'),
  releaseDate: z.string().optional().describe('The full release date of the movie (e.g., "2023-10-26").'),
  country: z.string().optional().describe('The country of origin for the movie.'),
  numberOfEpisodes: z.number().optional().describe('The total number of episodes for a series.'),
});
export type MovieDetailsOutput = z.infer<typeof MovieDetailsOutputSchema>;


export async function getMovieDetails(input: MovieDetailsInput): Promise<MovieDetailsOutput> {
  try {
    // Step 1: Get all factual data from TMDb API using the TMDb ID
    const tmdbData = await fetchMovieDetailsFromTMDb(input.tmdbId, input.type);
    
    // Step 2: Manually construct the fields that were previously AI-generated
    
    const cardInfoText = `Filmplex – ${tmdbData.title} (${tmdbData.year})\nDual Audio [Hindi-Eng]\n1080p, 720p & 480p\n[WEB-DL]\nx264 | HEVC`;

    const description = `<p><span style="color:#ff4d4d;">✅ <b>Download ${tmdbData.title} (${tmdbData.year}) WEB-DL Full Movie</b></span><br><span style="color:#ffa64d;">(Hindi-English)</span><br><span style="color:#4da6ff;">480p, 720p & 1080p qualities</span>.<br><span style="color:#99cc00;">This is a masterpiece in the ${tmdbData.genre} genre</span>,<br><span style="color:#ff66b3;">blending drama, action, and powerful performances</span>,<br>now <span style="color:#00cccc;">available in high definition</span>.</p><br><br><p>🎬 <span style="color:#ff944d;"><b>Your Ultimate Destination for Fast, Secure Anime Downloads!</b></span> 🎬</p><p>At <span style="color:#33cc33;"><b>FilmPlex</b></span>, dive into the world of<br><span style="color:#3399ff;">high-speed anime and movie downloads</span><br>with <span style="color:#ff4da6;">direct Google Drive (G-Drive) links</span>.<br>Enjoy <span style="color:#ffcc00;">blazing-fast access</span>,<br><span style="color:#cc66ff;">rock-solid security</span>,<br>and <span style="color:#00cc99;">zero waiting time</span>!</p>`;
    
    const tags = tmdbData.genre.split(',').map(g => g.trim()).filter(Boolean);

    // Step 3: Combine all data into the final output
    const result: MovieDetailsOutput = {
      ...tmdbData,
      genre: tmdbData.genre,
      synopsis: tmdbData.synopsis,
      description: description,
      tags: tags,
      cardInfoText: cardInfoText,
    };
    
    return result;
  } catch (error: any) {
    console.error("Error in getMovieDetails:", error);
    throw new Error(error.message || 'Could not fetch movie details. Please check the ID or fill manually.');
  }
}

/**
 * A server action to search for movies on TMDb.
 * This acts as a secure bridge between client components and the TMDb service.
 * @param title The title of the movie or series to search for.
 * @param fetchAll Whether to fetch all pages of results.
 * @returns A promise that resolves to an array of search results.
 */
export async function searchTMDb(title: string, fetchAll: boolean = false): Promise<TMDbSearchResult[]> {
    return searchMoviesOnTMDb(title, fetchAll);
}
