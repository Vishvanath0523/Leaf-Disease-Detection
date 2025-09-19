"use client";

import { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { BrainCircuit, FileText, Download, Sparkles } from "lucide-react";

interface PredictionResultProps {
  disease: string;
  confidence: number;
  reasoning: string;
  report: string;
}

export function PredictionResult({ disease, confidence, reasoning, report }: PredictionResultProps) {
  const isHealthy = disease.includes('___Healthy');
  const formattedDiseaseName = isHealthy ? "Healthy" : disease.replace(/^[^_]+___/, '').replace(/_/g, ' ');
  const confidencePercent = Math.round(confidence * 100);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const input = reportRef.current;
    if (!input) return;

    // Temporarily set the accordion to open for capturing
    const accordionContent = input.querySelector('[data-state="closed"]');
    if (accordionContent) {
      (accordionContent.parentElement?.querySelector('button') as HTMLElement)?.click();
    }
    
    setTimeout(() => {
      html2canvas(input, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        let imgHeight = pdfWidth / ratio;
        let heightLeft = imgHeight;
        let position = 10; // top margin
  
        pdf.addImage(imgData, 'PNG', 10, position, pdfWidth - 20, imgHeight);
        heightLeft -= (pdf.internal.pageSize.getHeight() - 20);
  
        while (heightLeft > 0) {
          position = heightLeft - imgHeight + 10;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, position, pdfWidth - 20, imgHeight);
          heightLeft -= (pdf.internal.pageSize.getHeight() - 20);
        }
        
        pdf.save(`LeafAI_Report_${disease.replace(/___/g, '_')}.pdf`);

        // Close the accordion again if we opened it
        if (accordionContent) {
          (accordionContent.parentElement?.querySelector('button') as HTMLElement)?.click();
        }
      });
    }, 100); // Small delay to allow accordion to open
  };

  return (
    <div className="w-full text-left space-y-6 animate-fade-in">
      <div ref={reportRef}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              {isHealthy && <Sparkles className="h-7 w-7 text-primary" />}
              {formattedDiseaseName}
            </CardTitle>
            <CardDescription>AI Prediction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium text-muted-foreground">Confidence</span>
                <span className="text-lg font-bold text-primary">{confidencePercent}%</span>
              </div>
              <Progress value={confidencePercent} aria-label={`${confidencePercent}% confidence`} />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>AI Analysis</CardTitle>
              <CardDescription>An assessment of the prediction's confidence.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{reasoning}</p>
          </CardContent>
        </Card>
        
        {!isHealthy && (
          <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
            <AccordionItem value="item-1">
              <Card>
                <AccordionTrigger className="w-full p-0 hover:no-underline">
                  <CardHeader className="flex flex-row items-center gap-3 w-full justify-between">
                    <div className="flex items-center gap-3 text-left">
                      <FileText className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle>Disease Report</CardTitle>
                        <CardDescription>Information and treatment suggestions.</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </AccordionTrigger>
                <AccordionContent>
                    <CardContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-body">
                            {report}
                        </div>
                    </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          </Accordion>
        )}
      </div>
      
      <div className="w-full flex justify-center pt-4">
        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download Report as PDF
        </Button>
      </div>

    </div>
  );
}
