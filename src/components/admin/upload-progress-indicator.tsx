
'use client';

import { useState, useEffect } from 'react';
import { Bot, ShieldCheck, Database, Server, CheckCircle, Link as LinkIcon } from 'lucide-react';

const STEP_DURATION = 1200; // 1.2 seconds per step

interface UploadProgressIndicatorProps {
    hasDownloadLinks: boolean;
}

export default function UploadProgressIndicator({ hasDownloadLinks }: UploadProgressIndicatorProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { text: 'Analyzing Data...', icon: Bot, key: 'analyze' },
    { text: 'Validating Integrity...', icon: ShieldCheck, key: 'validate' },
    { 
      text: hasDownloadLinks ? 'Verifying Download Links...' : 'Skipping Link Verification...', 
      icon: LinkIcon, 
      key: 'verify-links' 
    },
    { text: 'Encrypting & Uploading...', icon: Database, key: 'upload' },
    { text: 'Finalizing on Server...', icon: Server, key: 'finalize' },
    { text: 'Upload Complete!', icon: CheckCircle, key: 'complete' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, STEP_DURATION);

    return () => clearInterval(interval);
  }, [steps.length]);

  const CurrentIcon = steps[currentStep].icon;
  const currentText = steps[currentStep].text;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center">
          <div className="relative flex h-48 w-48 items-center justify-center">
            <div className="absolute inset-0 animate-[pulse-glow_3s_ease-in_out_infinite] rounded-full" />
            <CurrentIcon className="relative z-10 h-24 w-24 text-primary" />
          </div>
          <p className="mt-8 text-2xl font-bold text-foreground">{currentText}</p>
        </div>
    </div>
  );
}
