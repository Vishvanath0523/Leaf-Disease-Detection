import { config } from 'dotenv';
config();

import '@/ai/flows/diagnose-leaf-disease.ts';
import '@/ai/flows/reason-about-prediction.ts';
import '@/ai/flows/generate-disease-report.ts';
