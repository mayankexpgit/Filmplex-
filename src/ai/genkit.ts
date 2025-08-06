
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {googleSearch} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI(), googleSearch()],
  model: 'googleai/gemini-2.0-flash',
});
