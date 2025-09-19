"use client";

import { useState, useRef, type DragEvent } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  disabled?: boolean;
}

export function ImageUploader({ onImageUpload, disabled = false }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file (e.g., JPG, PNG, WEBP).",
          variant: "destructive",
        });
      }
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleClick = () => {
    if (!disabled) fileInputRef.current?.click();
  };

  return (
    <div
      className={cn(
        "w-full max-w-lg p-8 border-2 border-dashed rounded-lg transition-colors duration-300 ease-in-out cursor-pointer",
        "flex flex-col items-center justify-center text-center",
        isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-accent/50",
        disabled ? "cursor-not-allowed opacity-50" : ""
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !disabled && handleClick()}
      aria-disabled={disabled}
      aria-label="Image uploader with drag and drop"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
        disabled={disabled}
      />
      <UploadCloud className="h-12 w-12 text-primary mb-4" />
      <p className="font-semibold text-foreground">Drag & drop an image here</p>
      <p className="text-muted-foreground text-sm">or click to select a file</p>
      <p className="text-xs text-muted-foreground mt-2">PNG, JPG, GIF up to 10MB</p>
    </div>
  );
}
