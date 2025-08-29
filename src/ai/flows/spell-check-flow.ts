
'use server';
/**
 * @fileOverview An AI flow to correct spelling and intent from a user's search query.
 *
 * - correctSpelling - A function that takes a potentially incorrect search query
 *   and returns the corrected name of the movie or series.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Movie } from '@/lib/data';

// This function will be called from the store, so it's not a flow itself, but uses a flow.
export async function correctSpelling(text: string, allMovies: Movie[]): Promise<string> {
    if (!text) {
        return '';
    }
    try {
        const result = await spellCheckFlow({ text, movieTitles: allMovies.map(m => m.title) });
        return result.correctedText;
    } catch (error) {
        console.error("Spell check flow failed, returning original text.", error);
        // Fallback to original text if AI fails
        return text;
    }
}


const SpellCheckInputSchema = z.object({
  text: z.string().describe('The user\'s search query, which might have typos or be inaccurate.'),
  movieTitles: z.array(z.string()).describe('A list of all available movie titles in the database.'),
});

const SpellCheckOutputSchema = z.object({
  correctedText: z.string().describe('The corrected name of the movie or series that the user most likely meant.'),
});


const prompt = ai.definePrompt({
  name: 'spellCheckPrompt',
  input: { schema: SpellCheckInputSchema },
  output: { schema: SpellCheckOutputSchema },
  prompt: `You are an intelligent search assistant for a movie website. Your task is to correct a user's search query to match a title from the provided list of movie titles.

User's search query: "{{text}}"

List of available movie titles:
{{#each movieTitles}}
- {{this}}
{{/each}}

Analyze the user's query. It might have spelling mistakes, be incomplete, or use different wording. Your goal is to find the single most likely movie title from the list that the user is looking for.

Return ONLY the corrected movie title. For example, if the user types "adngear" and the list contains "Andor", you should return "Andor". If the user types "Dark Night Rises", you should return "The Dark Knight Rises".

If no clear match is found, return the original search query.
`,
});

const spellCheckFlow = ai.defineFlow(
  {
    name: 'spellCheckFlow',
    inputSchema: SpellCheckInputSchema,
    outputSchema: SpellCheckOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      return { correctedText: input.text };
    }
    return output;
  }
);
