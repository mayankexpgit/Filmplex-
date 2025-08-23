
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
  description: z.string().describe('A longer, more detailed description or review of the movie. This should be suitable for an HTML display.'),
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
  - A detailed description or review.`,
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
