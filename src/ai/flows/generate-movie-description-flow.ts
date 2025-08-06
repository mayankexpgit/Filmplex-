
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

        Use the following information about the movie to write three distinct sections. Some fields might be empty, so adapt your writing accordingly.
        - Title: {{title}}
        - Year: {{year}}
        - Genre(s): {{genre}}
        - Language(s): {{language}}
        - Star(s): {{stars}}
        - Available Quality: {{quality}}
        - Base Synopsis (to expand upon): {{{synopsis}}}

        Generate the content in the following HTML format. Do NOT include any other text, just the HTML. Ensure the tone is enthusiastic but professional. Avoid spammy keywords or mentioning other websites.

        Your response MUST be ONLY the HTML content, starting with <strong> and ending with </p>.

        1.  **First Line (as <strong> tag)**: Create a catchy, professional line about downloading the movie on FILMPLEX. Mention the title, year, and if available, the languages and qualities.
            Example: <strong>Download {{title}} ({{year}}) Dual Audio [{{language}}] {{quality}} BluRay | Watch Online on FILMPLEX</strong>

        2.  **DESCRIPTION Section (<h4> and <p> tags)**: Write a paragraph that introduces the movie. Mention it's available on FILMPLEX, its genre, and why it's a must-watch. Customize this section based on the provided movie details.

        3.  **STORYLINE Section (<h4> and <p> tags)**:
            - If a "Base Synopsis" is provided (in the 'synopsis' field), expand on it. Make it more engaging, add more detail about the plot, but do not reveal any major spoilers.
            - If no synopsis is provided, write a new, compelling one from scratch based on the movie's title, genre, and year. It should be captivating and give a good sense of the plot.

        4.  **REVIEW Section (<h4> and <p> tags)**: Write a short, enthusiastic, and positive review.
            - If "Star(s)" are provided, mention their standout performances.
            - Comment on what makes the movie special (e.g., direction, story, visuals) based on its genre.
            - Avoid generic phrases. Make the review sound authentic and specific to a movie of this type.

        Here is the required HTML structure:

        <strong>Download {{title}} ({{year}}){{#if language}} Dual Audio [{{language}}]{{/if}}{{#if quality}} {{quality}}{{/if}} BluRay | Watch Online on FILMPLEX</strong>
        <br>
        <h4>DESCRIPTION:</h4>
        <p>Experience the thrill of {{title}} ({{year}}), now available for download exclusively on FILMPLEX. This acclaimed film, presented in {{#if language}}{{language}}{{else}}multiple languages{{/if}}{{#if quality}} and available in {{quality}} qualities{{/if}}, is a brilliant entry in the {{#if genre}}{{genre}}{{else}}cinematic{{/if}} world. A true must-watch for enthusiasts, ready for you to download and enjoy the show.</p>
        <br>
        <h4>STORYLINE:</h4>
        <p>{{#if synopsis}}Expanding on the provided story, {{{synopsis}}}{{else}}Delve into the captivating plot of {{title}}. [AI: Based on the title, genre, and year, write a compelling, original storyline here of 2-3 sentences. Do not mention that you are an AI.]{{/if}}</p>
        <br>
        <h4>REVIEW:</h4>
        <p>{{#if stars}}Anchored by standout performances from {{stars}}, t{{else}}T{{/if}}his film is an unforgettable experience. The direction is masterful, and the plot is both intelligent and gripping, making it a cinematic gem that will stay with you. It's a highly recommended masterpiece for any fan of the {{#if genre}}{{genre}}{{else}}film{{/if}} genre.</p>
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
