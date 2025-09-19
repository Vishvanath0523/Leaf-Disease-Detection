'use server';

/**
 * @fileOverview Provides a Genkit flow to reason about the correctness of a plant disease prediction.
 *
 * - reasonAboutPrediction - A function that takes a plant image and a disease prediction and returns a confidence assessment.
 * - ReasonAboutPredictionInput - The input type for the reasonAboutPrediction function.
 * - ReasonAboutPredictionOutput - The return type for the reasonAboutPrediction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReasonAboutPredictionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of a plant leaf, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'    ),
  diseasePrediction: z.string().describe('The predicted disease of the plant leaf.'),
  confidenceLevel: z.number().describe('The confidence level of the disease prediction (0-1).'),
});

export type ReasonAboutPredictionInput = z.infer<typeof ReasonAboutPredictionInputSchema>;

const ReasonAboutPredictionOutputSchema = z.object({
  confidenceAssessment: z.string().describe('An assessment of the confidence in the disease prediction.'),
});

export type ReasonAboutPredictionOutput = z.infer<typeof ReasonAboutPredictionOutputSchema>;

export async function reasonAboutPrediction(
  input: ReasonAboutPredictionInput
): Promise<ReasonAboutPredictionOutput> {
  return reasonAboutPredictionFlow(input);
}

const reasonAboutPredictionPrompt = ai.definePrompt({
  name: 'reasonAboutPredictionPrompt',
  input: {schema: ReasonAboutPredictionInputSchema},
  output: {schema: ReasonAboutPredictionOutputSchema},
  prompt: `You are an expert plant pathologist confirming a diagnosis. An AI model has predicted "{{diseasePrediction}}" with a confidence of {{confidenceLevel}}.

Your task is to:
1.  State whether the plant is healthy or has a disease based on the "{{diseasePrediction}}".
2.  Explain *why* this diagnosis is correct by analyzing the visual evidence in the provided image ({{media url=photoDataUri}}).
3.  Describe the specific symptoms (e.g., spots, discoloration, lesions) that are characteristic of "{{diseasePrediction}}".

Your explanation must directly support and be consistent with the initial prediction. Do not contradict the prediction.`,
});

const reasonAboutPredictionFlow = ai.defineFlow(
  {
    name: 'reasonAboutPredictionFlow',
    inputSchema: ReasonAboutPredictionInputSchema,
    outputSchema: ReasonAboutPredictionOutputSchema,
  },
  async input => {
    const {output} = await reasonAboutPredictionPrompt(input);
    return output!;
  }
);
