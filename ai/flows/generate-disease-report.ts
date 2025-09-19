'use server';

/**
 * @fileOverview A flow for generating a disease report based on a predicted disease.
 *
 * - generateDiseaseReport - A function that generates a disease report.
 * - GenerateDiseaseReportInput - The input type for the generateDiseaseReport function.
 * - GenerateDiseaseReportOutput - The return type for the generateDiseaseReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDiseaseReportInputSchema = z.object({
  diseaseName: z.string().describe('The name of the predicted plant disease.'),
});
export type GenerateDiseaseReportInput = z.infer<typeof GenerateDiseaseReportInputSchema>;

const GenerateDiseaseReportOutputSchema = z.object({
  report: z.string().describe('A report containing information about the disease and common treatments.'),
});
export type GenerateDiseaseReportOutput = z.infer<typeof GenerateDiseaseReportOutputSchema>;

export async function generateDiseaseReport(input: GenerateDiseaseReportInput): Promise<GenerateDiseaseReportOutput> {
  return generateDiseaseReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDiseaseReportPrompt',
  input: {schema: GenerateDiseaseReportInputSchema},
  output: {schema: GenerateDiseaseReportOutputSchema},
  prompt: `You are an expert in plant diseases. Generate a report about the following disease, including common treatments:

Disease: {{{diseaseName}}}`,
});

const generateDiseaseReportFlow = ai.defineFlow(
  {
    name: 'generateDiseaseReportFlow',
    inputSchema: GenerateDiseaseReportInputSchema,
    outputSchema: GenerateDiseaseReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
