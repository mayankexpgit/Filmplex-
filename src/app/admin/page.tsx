'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Upload, MessageCircle, Bell, User, Shield, Flame, List, LifeBuoy, MessagesSquare, Users, UserCircle as ProfileIcon, Target, Hourglass, ListChecks } from 'lucide-react';
import { useMovieStore } from '@/store/movieStore';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { Progress } from '@/components/ui/progress';
import { format, parseISO, isAfter } from 'date-fns';
import { useMemo } from 'react';
import type { Movie } from '@/lib/data';

const topLevelRoles = ['Regulator', 'Co-Founder'];

const adminSections = [
  {
    title: 'Upload Movie',
    description: 'Add new movies to the catalog.',
    href: '/admin/upload-movie',
    icon: Upload,
    id: 'upload-movie',
  },
  {
    title: 'Movie List',
    description: 'Edit, view, and manage all movies.',
    href: '/admin/movie-list',
    icon: List,
    id: 'movie-list',
  },
  {
    title: 'My Tasks',
    description: 'View and manage your assigned tasks.',
    href: '/admin/my-tasks',
    icon: ListChecks,
    id: 'my-tasks',
  },
  {
    title: 'Update Featured Movies',
    description: 'Update posters for the featured carousel.',
    href: '/admin/update-featured',
    icon: Flame,
    id: 'update-featured',
  },
  {
    title: 'Help Center',
    description: 'Update contact links and details.',
    href: '/admin/help-center',
    icon: LifeBuoy,
    id: 'help-center',
  },
  {
    title: 'Management Team',
    description: 'Add or remove team members.',
    href: '/admin/management',
    icon: Users,
    id: 'management',
  },
  {
    title: 'Movie Notification',
    description: 'Send notifications to users about new movies.',
    href: '/admin/movie-notification',
    icon: Bell,
    id: 'movie-notification',
  },
  {
    title: 'Manage Comments',
    description: 'View comments and reactions for each movie.',
    href: '/admin/comments',
    icon: MessagesSquare,
    id: 'manage-comments',
  },
  {
    title: 'Suggestions Box',
    description: 'View user suggestions and requests.',
    href: '/admin/suggestions-box',
    icon: MessageCircle,
    id: 'suggestions-box',
  },
  {
    title: 'Security Log',
    description: 'Track all admin activities.',
    href: '/admin/security-log',
    icon: Shield,
    id: 'security-log',
  },
  {
    title: 'Admin Profile',
    description: 'View upload analytics for the team.',
    href: '/admin/profile',
    icon: ProfileIcon,
    id: 'admin-profile',
  }
];

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
}

function AdminTaskCard() {
    const { adminProfile } = useAuth();
    const { allMovies } = useMovieStore();

    const { completedMoviesCount, taskProgress, activeTodoTasks } = useMemo(() => {
        if (!adminProfile?.tasks || adminProfile.tasks.length === 0) return { completedMoviesCount: 0, taskProgress: 0, activeTodoTasks: 0 };
        
        const targetTask = adminProfile.tasks.find(t => t.type === 'target' && t.status === 'active');
        const todoTasks = adminProfile.tasks.filter(t => t.type === 'todo' && t.status === 'active');

        if (!targetTask) return { completedMoviesCount: 0, taskProgress: 0, activeTodoTasks: todoTasks.length };

        const taskStartDate = parseISO(targetTask.startDate);

        const completed = allMovies
            .filter(movie => movie.uploadedBy === adminProfile.name)
            .filter(movie => movie.createdAt && isAfter(parseISO(movie.createdAt), taskStartDate))
            .filter(isUploadCompleted);

        const progress = targetTask.target ? (completed.length / targetTask.target) * 100 : 0;
        return { completedMoviesCount: completed.length, taskProgress: progress, activeTodoTasks: todoTasks.length };
    }, [adminProfile, allMovies]);

    const targetTask = adminProfile?.tasks?.find(t => t.type === 'target' && t.status === 'active');

    if (!targetTask) {
        return null;
    }

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 bg-card/50 border-primary/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="h-6 w-6 text-primary" />
                    <span>Your Current Upload Target</span>
                </CardTitle>
                <CardDescription>
                    Your current assigned target is <span className="font-bold text-foreground">{targetTask.target}</span> completed uploads.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">Progress</span>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-semibold">
                        <Hourglass className="h-4 w-4" />
                        <span>Deadline: {format(parseISO(targetTask.deadline), 'PPp')}</span>
                    </div>
                </div>
                <Progress value={taskProgress} className="h-3" />
                <p className="text-center text-muted-foreground text-sm">
                    {completedMoviesCount} / {targetTask.target} uploads completed ({Math.round(taskProgress)}%)
                </p>
            </CardContent>
        </Card>
    );
}

export default function AdminDashboardPage() {
  const { suggestions, adminProfile } = useMovieStore();
  const suggestionCount = suggestions.length;
  const activeTodoTasksCount = adminProfile?.tasks?.filter(t => t.type === 'todo' && t.status === 'active').length || 0;

  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:col-span-3 gap-8">
        
        <AdminTaskCard />

        {adminSections.map((section) => (
            <Link href={section.href} key={section.title} className="group">
              <Card className="h-full hover:border-primary transition-[transform,border-color] duration-300 ease-in-out transform hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center gap-4">
                  <section.icon className="h-8 w-8 text-primary" />
                  <div className="flex-1">
                    <CardTitle className="flex items-center justify-between">
                      <span>{section.title}</span>
                       {section.id === 'my-tasks' && activeTodoTasksCount > 0 && (
                        <Badge variant="destructive" className="animate-pulse">
                          {activeTodoTasksCount}
                        </Badge>
                      )}
                      {section.id === 'suggestions-box' && suggestionCount > 0 && (
                        <Badge variant="destructive" className="animate-pulse">
                          {suggestionCount}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
      </div>
    </div>
  );
}
