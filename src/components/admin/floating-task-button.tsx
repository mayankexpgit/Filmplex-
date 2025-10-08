'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useMovieStore } from '@/store/movieStore';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMemo } from 'react';
import type { AdminTask, Movie } from '@/lib/data';
import { parseISO, isAfter, format } from 'date-fns';

const CIRCLE_RADIUS = 32;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

const isUploadCompleted = (movie: Movie): boolean => {
    if (movie.contentType === 'movie') {
        return !!movie.downloadLinks && movie.downloadLinks.some(link => link && link.url);
    }
    if (movie.contentType === 'series') {
        const hasEpisodeLinks = movie.episodes && movie.episodes.some(ep => ep.downloadLinks.some(link => link && link.url));
        const hasSeasonLinks = movie.seasonDownloadLinks && movie.seasonDownloadLinks.some(link => link && link.url);
        return !!(hasEpisodeLinks || hasSeasonLinks);
    }
    return false;
};

const getTaskProgress = (task: AdminTask, allMovies: Movie[], adminName: string) => {
    const taskStartDate = parseISO(task.startDate);
    const completedMoviesForTask = allMovies
        .filter(movie => movie.uploadedBy === adminName && movie.createdAt && isAfter(parseISO(movie.createdAt), taskStartDate))
        .filter(isUploadCompleted);

    let target = 0;
    if (task.type === 'target') {
        target = task.target || 0;
    } else if (task.type === 'todo') {
        target = task.items?.length || 0;
    }

    const completed = completedMoviesForTask.length;
    const progress = target > 0 ? Math.min(100, (completed / target) * 100) : 0;

    return {
        completed,
        target,
        progress,
    };
};


export default function FloatingTaskButton() {
  const { adminProfile } = useAuth();
  const { allMovies } = useMovieStore();

  const activeTask = useMemo(() => {
    return adminProfile?.tasks?.find(
      task => task.status === 'active' || task.status === 'incompleted'
    );
  }, [adminProfile]);

  const { completed, target, progress } = useMemo(() => {
    if (!activeTask || !adminProfile) return { completed: 0, target: 0, progress: 0 };
    return getTaskProgress(activeTask, allMovies, adminProfile.name);
  }, [activeTask, allMovies, adminProfile]);
  

  if (!activeTask) {
    return null;
  }
  
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE - (progress / 100) * CIRCLE_CIRCUMFERENCE;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="fixed bottom-8 right-8 z-50">
            <Link href="/admin/upload-movie" aria-label="Go to Upload Page">
                <div className="relative h-20 w-20">
                    <svg className="h-full w-full" viewBox="0 0 80 80">
                        <circle
                            className="text-secondary"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r={CIRCLE_RADIUS}
                            cx="40"
                            cy="40"
                        />
                        <circle
                            className="text-primary animate-progress-ring"
                            strokeWidth="8"
                            strokeDasharray={CIRCLE_CIRCUMFERENCE}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r={CIRCLE_RADIUS}
                            cx="40"
                            cy="40"
                            transform="rotate(-90 40 40)"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80 hover:bg-background/70 transition-colors">
                        <span className="text-xl font-bold text-foreground">
                            {completed}/{target}
                        </span>
                    </div>
                </div>
            </Link>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="space-y-1">
          <p className="font-bold">{activeTask.title}</p>
          <p>{completed}/{target} uploads completed.</p>
          <p className="text-xs text-muted-foreground">Deadline: {format(parseISO(activeTask.deadline), 'PP')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
