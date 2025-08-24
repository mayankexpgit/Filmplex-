'use server';
/**
 * @fileOverview An AI flow to correct spelling.
 *
 * - correctSpelling - A function that corrects spelling in a given text.
 * - SpellingInput - The input type for the correctSpelling function.
 * - SpellingOutput - The return type for the correctSpelling function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SpellingInputSchema = z.object({
  text: z.string().describe('The text to be spell-checked and corrected.'),
});
export type SpellingInput = z.infer<typeof SpellingInputSchema>;

const SpellingOutputSchema = z.object({
  correctedText: z.string().describe('The corrected version of the input text.'),
});
export type SpellingOutput = z.infer<typeof SpellingOutputSchema>;

const prompt = ai.definePrompt({
  name: 'spellCheckPrompt',
  input: { schema: SpellingInputSchema },
  output: { schema: SpellingOutputSchema },
  prompt: `You are a highly accurate spell-checker. Correct any spelling mistakes in the following text.
  The text is likely a movie title. If the spelling is already correct, return the original text.
  Only return the corrected text, nothing else.
  
  Text: {{{text}}}
  `,
});

const correctSpellingFlow = ai.defineFlow(
  {
    name: 'correctSpellingFlow',
    inputSchema: SpellingInputSchema,
    outputSchema: SpellingOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      return { correctedText: input.text };
    }
    return output;
  }
);

export async function correctSpelling(input: SpellingInput): Promise<SpellingOutput> {
  return correctSpellingFlow(input);
}
