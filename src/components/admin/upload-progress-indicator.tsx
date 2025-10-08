
'use client';

import { useState, useEffect } from 'react';
import { Bot, ShieldCheck, Database, Server, CheckCircle, Link } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

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
      icon: Link, 
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

  const { icon: Icon, text, key } = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative flex h-48 w-48 items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, ease: 'backOut' }}
            className="absolute flex flex-col items-center justify-center"
          >
            <Icon className="h-24 w-24 text-primary" />
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="mt-8 text-2xl font-bold text-foreground">{text}</p>
    </div>
  );
}
