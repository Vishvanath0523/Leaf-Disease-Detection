'use server';

import { diagnoseLeafDisease } from '@/ai/flows/diagnose-leaf-disease';
import { reasonAboutPrediction } from '@/ai/flows/reason-about-prediction';
import { generateDiseaseReport } from '@/ai/flows/generate-disease-report';

function formatDiseaseName(disease: string): string {
  // Removes the plant type prefix (e.g., "Tomato___") and replaces underscores with spaces.
  return disease.replace(/^[^_]+___/, '').replace(/_/g, ' ');
}

export async function getAIDiagnosis(photoDataUri: string) {
  try {
    // Step 1: Get the initial disease diagnosis from the image.
    const predictionResult = await diagnoseLeafDisease({ photoDataUri });
    const { disease, confidence } = predictionResult;
    
    // Step 2: Get the AI-powered analysis and report based on the prediction.
    const formattedDisease = formatDiseaseName(disease);

    // If the plant is healthy, we don't need a full disease report.
    if (disease.includes('___Healthy')) {
      const reasoningResult = await reasonAboutPrediction({
        photoDataUri,
        diseasePrediction: 'Healthy',
        confidenceLevel: confidence,
      });
      return {
        prediction: predictionResult,
        diagnosis: {
          reasoning: reasoningResult.confidenceAssessment,
          report: 'The plant appears to be healthy. No disease report is necessary. Continue to monitor for any changes.',
        }
      };
    }

    const [reasoningResult, reportResult] = await Promise.all([
      reasonAboutPrediction({
        photoDataUri,
        diseasePrediction: formattedDisease,
        confidenceLevel: confidence,
      }),
      generateDiseaseReport({ diseaseName: formattedDisease }),
    ]);

    return {
      prediction: predictionResult,
      diagnosis: {
        reasoning: reasoningResult.confidenceAssessment,
        report: reportResult.report,
      }
    };
  } catch (error: any) {
    console.error('Error getting AI diagnosis:', error.message || error);
    // Check if the error is due to a missing or invalid API key.
    if (error.message && (error.message.includes('API key not found') || error.message.includes('API key is invalid'))) {
       return {
         error: 'Failed to analyze image. The GOOGLE_API_key is missing or invalid. Please add it to your environment variables.'
       };
    }
    
    return {
      error: 'An error occurred while analyzing the image. The AI model may be unavailable or experienced an issue. Please try again later.',
    };
  }
}
