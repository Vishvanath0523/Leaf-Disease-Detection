"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Leaf, X } from 'lucide-react';
import { ImageUploader } from '@/components/image-uploader';
import { PredictionResult } from '@/components/prediction-result';
import { getAIDiagnosis } from './actions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<{ disease: string; confidence: number } | null>(null);
  const [diagnosis, setDiagnosis] = useState<{ reasoning: string; report: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setPrediction(null);
    setDiagnosis(null);
    setImage(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const imageDataUri = reader.result as string;
        const result = await getAIDiagnosis(imageDataUri);
        
        if (result.error) {
          throw new Error(result.error);
        }

        if (!result.prediction || !result.diagnosis) {
          throw new Error('Failed to get a complete diagnosis from the AI.');
        }

        setPrediction(result.prediction);
        setDiagnosis(result.diagnosis);
      } catch (e: any) {
        setError(e.message || 'An error occurred while analyzing the image. Please try again.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the image file.');
      setIsLoading(false);
    };
  };

  const handleReset = () => {
    setImage(null);
    setImagePreview(null);
    setPrediction(null);
    setDiagnosis(null);
    setIsLoading(false);
    setError(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-6 border-b">
        <div className="container mx-auto flex items-center gap-2">
          <Leaf className="text-primary h-8 w-8" />
          <h1 className="text-2xl font-bold font-headline">LeafAI</h1>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-8">
          {!imagePreview && (
            <div className="w-full flex flex-col items-center gap-4 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">Identify Plant Leaf Diseases Instantly</h2>
              <p className="text-lg text-muted-foreground">Upload an image of a plant leaf, and our AI will analyze it for diseases.</p>
              <ImageUploader onImageUpload={handleImageUpload} disabled={isLoading} />
            </div>
          )}

          {imagePreview && (
            <div className="w-full space-y-6 animate-fade-in">
              <div className="relative w-full max-w-md mx-auto aspect-square rounded-lg overflow-hidden shadow-lg border">
                <Image src={imagePreview} alt="Uploaded leaf" layout="fill" objectFit="cover" />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2 rounded-full h-8 w-8 z-10" onClick={handleReset}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove image</span>
                </Button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="w-full space-y-6">
              <Skeleton className="h-10 w-3/4 mx-auto" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          )}
          
          {error && (
            <div className="text-destructive p-4 border border-destructive/50 rounded-md bg-destructive/10 animate-fade-in">
              {error}
            </div>
          )}

          {!isLoading && diagnosis && prediction && (
            <PredictionResult 
              disease={prediction.disease}
              confidence={prediction.confidence}
              reasoning={diagnosis.reasoning}
              report={diagnosis.report}
            />
          )}

        </div>
      </main>
      <footer className="py-4 px-6 border-t mt-auto">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>LeafAI is for educational purposes only. For critical applications, please consult a professional.</p>
        </div>
      </footer>
    </div>
  );
}
