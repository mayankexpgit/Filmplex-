
'use server';
/**
 * @fileOverview An AI flow to fetch movie/series metadata from the web.
 * 
 * - fetchMovieMetadata - A function that takes a title and type (movie/series)
 *   and returns structured metadata about it.
 * - FetchMovieMetadataInput - The input type for the flow.
 * - FetchMovieMetadataOutput - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { search } from '@genkit-ai/googleai';

// Define schemas for input and output
const FetchMovieMetadataInputSchema = z.object({
    title: z.string().describe('The title of the movie or series.'),
    type: z.enum(['movie', 'series']).describe('The type of content.'),
});
export type FetchMovieMetadataInput = z.infer<typeof FetchMovieMetadataInputSchema>;

const FetchMovieMetadataOutputSchema = z.object({
    year: z.number().optional().describe('The release year of the content.'),
    genres: z.array(z.string()).describe('A list of genres associated with the content.'),
    cast: z.array(z.string()).describe('A list of main cast members.'),
    directors: z.array(z.string()).describe('A list of directors or creators.'),
    synopsis: z.string().optional().describe('A brief plot synopsis.'),
    posterUrl: z.string().url().optional().describe('A URL to a high-quality poster image.'),
    tags: z.array(z.string()).optional().describe('A list of relevant tags (e.g., "Superhero", "Mind-bending").')
}).nullable();
export type FetchMovieMetadataOutput = z.infer<typeof FetchMovieMetadataOutputSchema>;


/**
 * Public-facing wrapper function to call the fetchMovieMetadataFlow.
 * @param input The movie/series title and type.
 * @returns A promise that resolves to the structured metadata or null.
 */
export async function fetchMovieMetadata(
  input: FetchMovieMetadataInput
): Promise<FetchMovieMetadataOutput> {
  return fetchMovieMetadataFlow(input);
}


// Define the tool for searching
const movieSearch = search({
    engine: "default",
    options: {
        resultCount: 5,
        siteSearch: ["imdb.com", "themoviedb.org", "wikipedia.org"],
    }
});


const fetchMovieMetadataFlow = ai.defineFlow(
  {
    name: 'fetchMovieMetadataFlow',
    inputSchema: FetchMovieMetadataInputSchema,
    outputSchema: FetchMovieMetadataOutputSchema,
  },
  async (input) => {
    
    const llmResponse = await ai.generate({
        prompt: `
            Based on the following search results for the ${input.type} titled "${input.title}", extract the requested information.
            If you cannot find a specific piece of information, leave it out.
            Prioritize information from IMDb or The Movie Database (TMDb).
            For the posterUrl, find a high-quality vertical poster image if possible.
        `,
        tools: [movieSearch],
        model: 'googleai/gemini-2.0-flash',
        output: {
            schema: FetchMovieMetadataOutputSchema,
        }
    });

    return llmResponse.output;
  }
);
