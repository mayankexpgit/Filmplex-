
import {genkit} from 'genkit';
import {googleAI, googleSearch} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI(), googleSearch()],
  model: 'googleai/gemini-2.0-flash',
});
