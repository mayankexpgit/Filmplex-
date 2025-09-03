
import {genkit} from 'genkit';
import {googleAI, firebase} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI(), firebase()],
  model: 'googleai/gemini-2.0-flash',
});
