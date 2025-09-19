'use server';

/**
 * @fileOverview A Genkit flow for diagnosing plant leaf diseases from an image.
 *
 * - diagnoseLeafDisease - A function that takes a plant leaf image and returns a diagnosis.
 * - DiagnoseLeafDiseaseInput - The input type for the diagnoseLeafDisease function.
 * - DiagnoseLeafDiseaseOutput - The return type for the diagnoseLeafDisease function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnoseLeafDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant leaf, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DiagnoseLeafDiseaseInput = z.infer<typeof DiagnoseLeafDiseaseInputSchema>;

const DiagnoseLeafDiseaseOutputSchema = z.object({
  disease: z.string().describe('The name of the disease in the format "Plant___Disease_Name". If the plant is healthy, it should be "Plant___Healthy".'),
  confidence: z.number().describe('The confidence level of the prediction (from 0 to 1).'),
});
export type DiagnoseLeafDiseaseOutput = z.infer<typeof DiagnoseLeafDiseaseOutputSchema>;

export async function diagnoseLeafDisease(input: DiagnoseLeafDiseaseInput): Promise<DiagnoseLeafDiseaseOutput> {
  return diagnoseLeafDiseaseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseLeafDiseasePrompt',
  input: {schema: DiagnoseLeafDiseaseInputSchema},
  output: {schema: DiagnoseLeafDiseaseOutputSchema},
  prompt: `You are a plant pathologist AI. Analyze the provided image of a plant leaf.

  Your task is to:
  1. Identify the plant species (e.g., Tomato, Potato, Apple).
  2. Identify the disease affecting the leaf. If the leaf is healthy, identify it as "Healthy".
  3. Format your output as a single string: "PlantName___DiseaseName". Replace spaces in the disease name with underscores. For example: "Tomato___Late_blight" or "Apple___Apple_scab" or "Potato___Healthy".
  4. Provide a confidence score for your prediction. If you are very sure, provide a score close to 1.0. If you are uncertain, provide a lower score.
  
  Image to analyze: {{media url=photoDataUri}}`,
});

const diagnoseLeafDiseaseFlow = ai.defineFlow(
  {
    name: 'diagnoseLeafDiseaseFlow',
    inputSchema: DiagnoseLeafDiseaseInputSchema,
    outputSchema: DiagnoseLeafDiseaseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
