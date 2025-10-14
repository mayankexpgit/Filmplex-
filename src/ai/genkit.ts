import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { firebase } from "@genkit-ai/firebase";

export const ai = genkit({
  plugins: [
    googleAI(),
    firebase(), // This plugin will automatically use GOOGLE_APPLICATION_CREDENTIALS on Vercel
  ],
  model: "googleai/gemini-pro",
});
