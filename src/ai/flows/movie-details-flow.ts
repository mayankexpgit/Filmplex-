
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
import { fetchMovieDetailsFromTMDb } from '@/services/tmdbService';
import 'dotenv/config'
import { correctSpelling } from './spell-check-flow';

const MovieDetailsInputSchema = z.object({
  title: z.string().describe('The title of the movie to search for.'),
  year: z.number().optional().describe('The release year of the movie to improve accuracy.'),
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
  cardInfoText: z.string().describe("A detailed info string for the movie card. It must follow this exact format and include as much detail as possible: 'Filmplex – {{title}} ({{year}}) [Source (e.g. BluRay)] [Audio Languages (e.g., Hindi + English)] [Available Qualities (e.g., 1080p, 720p)] | [Extra details like Dual Audio, x264, 10Bit HEVC] | [Content Type, e.g., Movie, Anime Movie, Series]'. The string should be long and descriptive."),
  posterUrl: z.string().describe("The URL of the movie poster."),
  trailerUrl: z.string().optional().describe("The URL of the movie trailer.")
});
export type MovieDetailsOutput = z.infer<typeof MovieDetailsOutputSchema>;


const creativePrompt = ai.definePrompt({
  name: 'movieCreativeContentPrompt',
  input: { schema: MovieDetailsOutputSchema },
  output: { schema: MovieDetailsOutputSchema.pick({ synopsis: true, description: true, tags: true, cardInfoText: true }) },
  prompt: `You are an expert movie database. Based on the following ACCURATE movie data, generate the creative fields. You MUST use the provided data as the source of truth.

Movie Title: {{title}}
Year: {{year}}
Genre: {{genre}}
Director: {{creator}}
Actors: {{stars}}
Original Plot: {{synopsis}}
Trailer URL: {{trailerUrl}}

Your tasks:
1.  **Synopsis**: Refine the provided plot into a compelling one-paragraph synopsis. Do not make up facts.
2.  **Tags**: Generate an array of 3-5 relevant tags (e.g., "Superhero", "Mind-bending", "Based on a true story").
3.  **Card Info Text**: Create a detailed info string for the movie card. It must be long and descriptive, following this exact format: 'Filmplex – {{title}} ({{year}}) [Source (e.g. BluRay)] [Audio Languages (e.g., Hindi + English)] [Available Qualities (e.g., 1080p, 720p)] | [Extra details like Dual Audio, x264, 10Bit HEVC] | [Content Type, e.g., Movie, Anime Movie, Series]'.
4.  **Description**: Generate a detailed, colorful HTML description. It MUST follow this exact template:

<p><span style="color:#ff4d4d;">✅ <b>Download {{title}} ({{year}}) WEB-DL Full Movie</b></span><br><span style="color:#ffa64d;">(Hindi-English)</span><br><span style="color:#4da6ff;">480p, 720p & 1080p qualities</span>.<br><span style="color:#99cc00;">This is a masterpiece in the {{genre}} genre</span>,<br><span style="color:#ff66b3;">blending drama, action, and powerful performances</span>,<br>now <span style="color:#00cccc;">available in high definition</span>.</p><br><br><p>🎬 <span style="color:#ff944d;"><b>Your Ultimate Destination for Fast, Secure Anime Downloads!</b></span> 🎬</p><p>At <span style="color:#33cc33;"><b>FilmPlex</b></span>, dive into the world of<br><span style="color:#3399ff;">high-speed anime and movie downloads</span><br>with <span style="color:#ff4da6;">direct Google Drive (G-Drive) links</span>.<br>Enjoy <span style="color:#ffcc00;">blazing-fast access</span>,<br><span style="color:#cc66ff;">rock-solid security</span>,<br>and <span style="color:#00cc99;">zero waiting time</span>!</p>
  `,
});


const getMovieDetailsFlow = ai.defineFlow(
  {
    name: 'getMovieDetailsFlow',
    inputSchema: MovieDetailsInputSchema,
    outputSchema: MovieDetailsOutputSchema,
  },
  async (input) => {
    
    // Step 1: Correct spelling of the title first.
    const spellingResult = await correctSpelling({ text: input.title });
    const correctedTitle = spellingResult.correctedText || input.title;
    
    let tmdbData;
    try {
      // Step 2: Get factual data from TMDb API using the corrected title
      tmdbData = await fetchMovieDetailsFromTMDb(correctedTitle, input.year);
    } catch (error: any) {
        // Re-throw with a more user-friendly message
        throw new Error(error.message || 'Could not fetch movie details. Please check the title/year or fill manually.');
    }

    // Step 3: Use the factual data to generate creative content with the LLM
    const creativeInput: MovieDetailsOutput = {
      ...tmdbData,
      // Provide dummy values for the fields to be generated by AI
      tags: [],
      synopsis: tmdbData.synopsis, // Pass original synopsis to AI for refinement
      description: '',
      cardInfoText: '',
    };

    const { output: creativeOutput } = await creativePrompt(creativeInput);
    
    if (!creativeOutput) {
        throw new Error("AI failed to generate creative content.");
    }

    // Step 4: Combine factual and creative data into the final output
    return {
      ...tmdbData,
      // From AI
      synopsis: creativeOutput.synopsis,
      description: creativeOutput.description,
      tags: creativeOutput.tags,
      cardInfoText: creativeOutput.cardInfoText,
    };
  }
);


export async function getMovieDetails(input: MovieDetailsInput): Promise<MovieDetailsOutput> {
  return getMovieDetailsFlow(input);
}
