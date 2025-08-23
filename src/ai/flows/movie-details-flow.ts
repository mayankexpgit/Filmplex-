
'use server';
/**
 * @fileOverview An AI flow to fetch movie details.
 *
 * - getMovieDetails - A function that fetches movie details based on the title.
 * - MovieDetailsInput - The input type for the getMovieDetails function.
 * - MovieDetailsOutput - The return type for the getMovieDetails function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MovieDetailsInputSchema = z.object({
  title: z.string().describe('The title of the movie to search for.'),
});
export type MovieDetailsInput = z.infer<typeof MovieDetailsInputSchema>;

const MovieDetailsOutputSchema = z.object({
  year: z.number().describe('The release year of the movie.'),
  genre: z.string().describe('A comma-separated string of genres for the movie.'),
  imdbRating: z.number().describe('The IMDb rating of the movie, out of 10.'),
  stars: z.string().describe('A comma-separated string of the main actors.'),
  creator: z.string().describe('The director or creator of the movie.'),
  tags: z.array(z.string()).describe('An array of relevant tags (e.g., "Superhero", "Mind-bending", "Based on a true story").'),
  synopsis: z.string().describe('A brief, one-paragraph synopsis of the movie plot.'),
  description: z.string().describe('A longer, more detailed description of the movie, formatted in HTML.'),
});
export type MovieDetailsOutput = z.infer<typeof MovieDetailsOutputSchema>;


const prompt = ai.definePrompt({
  name: 'movieDetailsPrompt',
  input: { schema: MovieDetailsInputSchema },
  output: { schema: MovieDetailsOutputSchema },
  prompt: `You are an expert movie database. Given the movie title "{{title}}", provide detailed information about it.
  
  Search the web for the most accurate and comprehensive details.
  
  Please provide the following information in the requested format:
  - Release Year
  - Genre (as a comma-separated string)
  - IMDb Rating (as a number)
  - Main Stars (as a comma-separated string)
  - Creator/Director
  - Relevant tags (as an array of strings)
  - A concise, one-paragraph synopsis
  - A detailed description formatted as HTML. The description MUST follow this exact template, including all colors and tags:
  
  <p><span style="color:#ff4d4d;">✅ <b>Download {{title}} ({{year}}) WEB-DL Full Movie</b></span><br><span style="color:#ffa64d;">(Hindi-English)</span><br><span style="color:#4da6ff;">480p, 720p & 1080p qualities</span>.<br><span style="color:#99cc00;">This is a Japanese anime masterpiece</span>,<br><span style="color:#ff66b3;">blending romance, fantasy, and emotional drama</span>,<br>now <span style="color:#00cccc;">available in Hindi dubbed</span>.</p><br><br><p>🎬 <span style="color:#ff944d;"><b>Your Ultimate Destination for Fast, Secure Anime Downloads!</b></span> 🎬</p><p>At <span style="color:#33cc33;"><b>FilmPlex</b></span>, dive into the world of<br><span style="color:#3399ff;">high-speed anime and movie downloads</span><br>with <span style="color:#ff4da6;">direct Google Drive (G-Drive) links</span>.<br>Enjoy <span style="color:#ffcc00;">blazing-fast access</span>,<br><span style="color:#cc66ff;">rock-solid security</span>,<br>and <span style="color:#00cc99;">zero waiting time</span>!</p>
  `,
});

const getMovieDetailsFlow = ai.defineFlow(
  {
    name: 'getMovieDetailsFlow',
    inputSchema: MovieDetailsInputSchema,
    outputSchema: MovieDetailsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);


export async function getMovieDetails(input: MovieDetailsInput): Promise<MovieDetailsOutput> {
  return getMovieDetailsFlow(input);
}
