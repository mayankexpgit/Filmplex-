
'use server';
/**
 * @fileOverview An AI flow to enhance movie posters.
 *
 * - enhancePoster - A function that takes a URL to a movie poster,
 *   validates it, crops it to a 2:3 aspect ratio, enhances its resolution,
 *   and returns a Data URI of the enhanced poster.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { hollywood } from '@genkit-ai/googleai/experimental';

// Define the schema for the flow's input, which is a single URL string.
const EnhancePosterInputSchema = z.string().url();
export type EnhancePosterInput = z.infer<typeof EnhancePosterInputSchema>;

// Define the schema for the flow's output, which is a Data URI string.
const EnhancePosterOutputSchema = z.string();
export type EnhancePosterOutput = z.infer<typeof EnhancePosterOutputSchema>;

/**
 * Public-facing wrapper function to call the enhancePosterFlow.
 * @param url The URL of the poster image to enhance.
 * @returns A promise that resolves to the data URI of the enhanced image.
 */
export async function enhancePoster(url: EnhancePosterInput): Promise<EnhancePosterOutput> {
  return enhancePosterFlow(url);
}

// Define the Genkit flow.
const enhancePosterFlow = ai.defineFlow(
  {
    name: 'enhancePosterFlow',
    inputSchema: EnhancePosterInputSchema,
    outputSchema: EnhancePosterOutputSchema,
  },
  async (url) => {
    try {
      // Use the hollywood tool to edit the image.
      // This tool can perform multiple operations in a sequence.
      const { media } = await hollywood(
        {
          // We are providing the image via a URL.
          image: { url },
          // A sequence of editing operations to perform.
          edit: [
            // First, upscale the image to improve its resolution.
            { type: 'upscale' },
            // Second, crop the image to a standard 2:3 movie poster aspect ratio.
            { type: 'crop', options: { aspectRatio: '2:3' } },
          ],
        }
      );
      
      if (!media?.url) {
        throw new Error('AI enhancement did not return an image.');
      }
      
      // The tool returns a data URI which we can directly return.
      return media.url;
    } catch (error) {
      console.error('Error in enhancePosterFlow:', error);
      // If any step fails, throw a more user-friendly error.
      throw new Error('Failed to enhance poster. The URL may be invalid or the image is unsupported.');
    }
  }
);
