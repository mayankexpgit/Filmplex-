// src/ai/genkit.ts

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
// import { firebase } from '@genkit-ai/firebase'; // temporarily commented to avoid build errors

export const ai = genkit({
  plugins: [
    googleAI(),
    // firebase(), // enable this only after using a compatible version
  ],
  model: 'googleai/gemini-2.0-flash',
});
