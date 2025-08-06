
'use server';
/**
 * @fileOverview An AI flow to generate a detailed movie page description.
 *
 * - generateMovieDescription - Generates a description, storyline, and review for a movie.
 * - GenerateMovieDescriptionInput - The input type for the flow.
 * - GenerateMovieDescriptionOutput - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateMovieDescriptionInputSchema = z.object({
  title: z.string().describe('The title of the movie.'),
  year: z.number().describe('The release year of the movie.'),
  synopsis: z.string().describe('A brief synopsis or plot summary of the movie.'),
});
export type GenerateMovieDescriptionInput = z.infer<typeof GenerateMovieDescriptionInputSchema>;

export type GenerateMovieDescriptionOutput = string;

/**
 * Public-facing wrapper function to call the generateMovieDescriptionFlow.
 * @param input The movie details (title, year, synopsis).
 * @returns A promise that resolves to the formatted HTML string.
 */
export async function generateMovieDescription(
  input: GenerateMovieDescriptionInput
): Promise<GenerateMovieDescriptionOutput> {
  return generateMovieDescriptionFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateMovieDescriptionPrompt',
    input: { schema: GenerateMovieDescriptionInputSchema },
    output: { schema: z.string() },
    prompt: `
        You are an expert movie blogger for a website called FILMPLEX. Your task is to generate a compelling and well-formatted HTML description for a movie's download page.

        Use the following information about the movie:
        - Title: {{title}}
        - Year: {{year}}
        - Base Synopsis: {{{synopsis}}}

        Generate the content in the following HTML format. Do NOT include any other text, just the HTML.

        1.  **DESCRIPTION Section**: Start with a catchy line about downloading the movie on FILMPLEX. Mention the title, year, and that it's available in multiple qualities like 1080p, 720p & 480p. Keep it concise.
        2.  **STORYLINE Section**: Expand on the provided Base Synopsis. Make it engaging and give a little more detail about the plot, but do not reveal any major spoilers.
        3.  **REVIEW Section**: Write a short, enthusiastic, and positive review of the movie. Mention what makes it special (e.g., acting, direction, story). Avoid generic phrases.

        Here is the required HTML structure:

        <strong>Download {{title}} ({{year}}) Dual Audio [Hindi-English] 1080p, 720p & 480p BluRay | Watch Online on FILMPLEX</strong>
        <br>
        <h4>DESCRIPTION:</h4>
        <p>Watch {{title}} ({{year}}) Dual Audio [Hindi-English] Full Movie Online Free. The film is available in 1080p, 720p & 480p qualities. This is a Hindi movie and is available in 1080p, 720p & 480p qualities. This is one of the best movies based on Action, Adventure, Sci-Fi. This movie is now available in Hindi.</p>
        <br>
        <h4>STORYLINE:</h4>
        <p>[Your generated storyline based on the synopsis goes here]</p>
        <br>
        <h4>REVIEW:</h4>
        <p>[Your generated positive review goes here]</p>
    `,
});


const generateMovieDescriptionFlow = ai.defineFlow(
  {
    name: 'generateMovieDescriptionFlow',
    inputSchema: GenerateMovieDescriptionInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { output } = await prompt(input);
    return output || '';
  }
);
