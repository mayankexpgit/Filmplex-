
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
  genre: z.string().optional().describe('The genre(s) of the movie, comma-separated.'),
  stars: z.string().optional().describe('The main actors, comma-separated.'),
  language: z.string().optional().describe('The primary language of the movie.'),
  quality: z.string().optional().describe('A short description of the available quality, e.g., "1080p, 720p & 480p".'),
  synopsis: z.string().optional().describe('A brief synopsis or plot summary of the movie to be expanded upon.'),
});
export type GenerateMovieDescriptionInput = z.infer<typeof GenerateMovieDescriptionInputSchema>;

export type GenerateMovieDescriptionOutput = string;

/**
 * Public-facing wrapper function to call the generateMovieDescriptionFlow.
 * @param input The movie details.
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
    output: { schema: z.string().nullable() },
    prompt: `
        You are an expert movie blogger for a high-end, clean, and professional website called FILMPLEX. Your task is to generate a compelling and well-formatted HTML description for a movie's download page.

        Use the following information about the movie. Some fields might be empty, so adapt your writing accordingly.
        - Title: {{title}}
        - Year: {{year}}
        - Genre(s): {{genre}}
        - Language(s): {{language}}
        - Star(s): {{stars}}
        - Available Quality: {{quality}}
        - Base Synopsis (to expand upon): {{{synopsis}}}

        Generate the content in the following HTML format. Do NOT include any other text, just the HTML. Ensure the tone is enthusiastic but professional. Avoid spammy keywords or mentioning other websites.

        1.  **DESCRIPTION Section**: Start with a catchy, professional line about downloading the movie on FILMPLEX. Mention the title, year, and available languages and qualities. Keep it concise and clean.
        2.  **STORYLINE Section**: If a Base Synopsis is provided, expand on it. Make it engaging and give more detail about the plot, but do not reveal any major spoilers. If no synopsis is provided, write a new, compelling one based on the movie's title, genre, and year.
        3.  **REVIEW Section**: Write a short, enthusiastic, and positive review of the movie. Mention what makes it special (e.g., acting by {{stars}}, direction, story). Avoid generic phrases and be specific if possible.

        Here is the required HTML structure:

        <strong>Download {{title}} ({{year}}) {{#if language}}Dual Audio [{{language}}] {{/if}}{{#if quality}}{{quality}} {{/if}}BluRay | Watch Online on FILMPLEX</strong>
        <br>
        <h4>DESCRIPTION:</h4>
        <p>Experience {{title}} ({{year}}), now available for download on FILMPLEX. This film, presented in {{language}}, is available in {{quality}} qualities. As a standout in the {{genre}} genre, this is a must-watch. Download now and enjoy the show.</p>
        <br>
        <h4>STORYLINE:</h4>
        <p>[Your generated storyline based on the provided details and synopsis goes here. Make it captivating.]</p>
        <br>
        <h4>REVIEW:</h4>
        <p>[Your generated positive and specific review goes here. Mention the great performances by {{stars}} if available.]</p>
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
