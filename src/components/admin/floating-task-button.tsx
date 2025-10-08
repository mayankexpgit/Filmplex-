'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function FloatingTaskButton() {
  const { adminProfile } = useAuth();

  const hasActiveTask = adminProfile?.tasks?.some(
    task => task.status === 'active' || task.status === 'incompleted'
  );

  if (!hasActiveTask) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg z-50 animate-[pulse-glow_2s_infinite]"
          >
            <Link href="/admin/upload-movie">
              <Target className="h-8 w-8" />
              <span className="sr-only">Go to Upload Page</span>
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>You have an active task. Click to upload.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
