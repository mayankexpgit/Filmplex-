import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {firebase} from '@genkit-ai/firebase/plugin';

export const ai = genkit({
  plugins: [googleAI(), firebase()],
  model: 'googleai/gemini-2.0-flash',
});
