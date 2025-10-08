'use client';

import { useState, useMemo, useEffect } from 'react';
import type { AdminTask, Movie } from '@/lib/data';
import { useMovieStore } from '@/store/movieStore';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Hourglass, ListChecks, Target, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, differenceInSeconds, isAfter } from 'date-fns';

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

    return {
        completed: completedMoviesForTask.length,
        target: target,
    };
};

function Countdown({ deadline }: { deadline: string }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isOverdue, setIsOverdue] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const deadlineDate = parseISO(deadline);
            const diff = differenceInSeconds(deadlineDate, now);

            if (diff <= 0) {
                setIsOverdue(true);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                clearInterval(interval);
                return;
            }

            const days = Math.floor(diff / (60 * 60 * 24));
            const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
            const minutes = Math.floor((diff % (60 * 60)) / 60);
            const seconds = Math.floor(diff % 60);
            setTimeLeft({ days, hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(interval);
    }, [deadline]);

    if (isOverdue) {
        return <p className="text-2xl font-bold text-destructive">Deadline Passed</p>;
    }

    return (
        <div className="flex items-center gap-4">
            <div className="text-center">
                <p className="text-4xl font-bold text-primary">{String(timeLeft.days).padStart(2, '0')}</p>
                <p className="text-xs text-muted-foreground">Days</p>
            </div>
            <div className="text-4xl font-bold">:</div>
            <div className="text-center">
                <p className="text-4xl font-bold text-primary">{String(timeLeft.hours).padStart(2, '0')}</p>
                <p className="text-xs text-muted-foreground">Hours</p>
            </div>
             <div className="text-4xl font-bold">:</div>
            <div className="text-center">
                <p className="text-4xl font-bold text-primary">{String(timeLeft.minutes).padStart(2, '0')}</p>
                <p className="text-xs text-muted-foreground">Mins</p>
            </div>
             <div className="text-4xl font-bold">:</div>
            <div className="text-center">
                <p className="text-4xl font-bold text-primary">{String(timeLeft.seconds).padStart(2, '0')}</p>
                <p className="text-xs text-muted-foreground">Secs</p>
            </div>
        </div>
    );
}

interface AdminTaskStatusProps {
    task: AdminTask;
    allMovies: Movie[];
    adminName: string;
}

export default function AdminTaskStatus({ task, allMovies, adminName }: AdminTaskStatusProps) {
    const { completed, target } = useMemo(
        () => getTaskProgress(task, allMovies, adminName),
        [task, allMovies, adminName]
    );

    const progress = target > 0 ? (completed / target) * 100 : 0;
    const Icon = task.type === 'target' ? Target : ListChecks;
    const isOverdue = task.status === 'incompleted';

    return (
        <Card className="border-0 shadow-none">
            <CardHeader className="text-center px-0">
                <Icon className="mx-auto h-12 w-12 text-primary" />
                <CardTitle className="text-xl mt-2">{task.title}</CardTitle>
                <CardDescription>
                    Deadline: {format(parseISO(task.deadline), 'PPp')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
                <div className="flex justify-center">
                    <Countdown deadline={task.deadline} />
                </div>
                
                <div className="space-y-3">
                    <Progress value={progress} className="h-4" />
                    <p className="text-lg font-semibold">
                        {completed} / {target} 
                        <span className="text-muted-foreground"> uploads completed</span>
                    </p>
                </div>
                 {isOverdue && (
                    <Badge variant="destructive" className="text-base">
                        <XCircle className="mr-2 h-4 w-4" />
                        This task is overdue but can still be completed.
                    </Badge>
                )}
            </CardContent>
        </Card>
    );
}
