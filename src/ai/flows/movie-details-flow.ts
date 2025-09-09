
'use server';
/**
 * @fileOverview An AI flow to fetch movie details.
 * This flow uses the Trakt.tv API for factual data and then uses an LLM to generate creative text.
 *
 * - getMovieDetails - A function that fetches movie details based on the title and year.
 * - MovieDetailsInput - The input type for the getMovieDetails function.
 * - MovieDetailsOutput - The return type for the getMovieDetails function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { fetchMovieDetailsFromTMDb, type ContentType } from '@/services/tmdbService';

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


const getMovieDetailsFlow = ai.defineFlow(
  {
    name: 'getMovieDetailsFlow',
    inputSchema: MovieDetailsInputSchema,
    outputSchema: MovieDetailsOutputSchema,
  },
  async (input) => {
    
    // Step 1: Get all factual data from TMDb API using the TMDb ID
    const tmdbData = await fetchMovieDetailsFromTMDb(input.tmdbId, input.type);
    
    // Step 2: Construct all fields directly from the factual data, removing the unreliable AI step.
    
    // Manually construct the cardInfoText to ensure accuracy
    const cardInfoText = `Filmplex – ${tmdbData.title} (${tmdbData.year})\nDual Audio [Hindi-Eng]\n1080p, 720p & 480p\n[WEB-DL]\nx264 | HEVC`;

    // Create a reliable description from the fetched data
    const description = `<p><span style="color:#ff4d4d;">✅ <b>Download ${tmdbData.title} (${tmdbData.year}) WEB-DL Full Movie</b></span><br><span style="color:#ffa64d;">(Hindi-English)</span><br><span style="color:#4da6ff;">480p, 720p & 1080p qualities</span>.<br><span style="color:#99cc00;">This is a masterpiece in the ${tmdbData.genre} genre</span>,<br><span style="color:#ff66b3;">blending drama, action, and powerful performances</span>,<br>now <span style="color:#00cccc;">available in high definition</span>.</p><br><br><p>🎬 <span style="color:#ff944d;"><b>Your Ultimate Destination for Fast, Secure Anime Downloads!</b></span> 🎬</p><p>At <span style="color:#33cc33;"><b>FilmPlex</b></span>, dive into the world of<br><span style="color:#3399ff;">high-speed anime and movie downloads</span><br>with <span style="color:#ff4da6;">direct Google Drive (G-Drive) links</span>.<br>Enjoy <span style="color:#ffcc00;">blazing-fast access</span>,<br><span style="color:#cc66ff;">rock-solid security</span>,<br>and <span style="color:#00cc99;">zero waiting time</span>!</p>`;
    
    // Use genres as tags for reliability
    const tags = tmdbData.genre.split(',').map(g => g.trim()).filter(Boolean);

    // Step 3: Combine all data into the final output
    return {
      ...tmdbData,
      synopsis: tmdbData.synopsis, // Use the direct synopsis from TMDb
      description: description,
      tags: tags,
      cardInfoText: cardInfoText,
    };
  }
);


export async function getMovieDetails(input: MovieDetailsInput): Promise<MovieDetailsOutput> {
  try {
    return await getMovieDetailsFlow(input);
  } catch (error: any) {
    // Re-throw with a more user-friendly message
    console.error("Error in getMovieDetails flow: ", error);
    throw new Error(error.message || 'Could not fetch movie details. Please check the ID or fill manually.');
  }
}
