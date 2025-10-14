
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Upload, MessageCircle, User, Shield, Flame, List, LifeBuoy, MessagesSquare, Users, UserCircle as ProfileIcon, Target, Hourglass, ListChecks, AlertTriangle, Sparkles, Bell, Send } from 'lucide-react';
import { useMovieStore } from '@/store/movieStore';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { Progress } from '@/components/ui/progress';
import { format, parseISO, isAfter } from 'date-fns';
import { useMemo, useState, useEffect } from 'react';
import type { Movie, AdminTask } from '@/lib/data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import AdminTaskStatus from '@/components/admin/admin-task-status';
import { Button } from '@/components/ui/button';

function AdminTaskDialog() {
    const { adminProfile } = useAuth();
    const { allMovies } = useMovieStore();
    const [isOpen, setIsOpen] = useState(false);

    const unfinishedTask: AdminTask | undefined = useMemo(() => {
        return adminProfile?.tasks?.find(t => t.status === 'active' || t.status === 'incompleted');
    }, [adminProfile]);

    useEffect(() => {
        if (unfinishedTask) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [unfinishedTask]);


    if (!unfinishedTask) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-2xl">
                        <Target className="h-8 w-8 text-primary" />
                        My Current Task
                    </DialogTitle>
                    <DialogDescription>
                        This is your currently assigned task. The dialog will close once the task is completed.
                    </DialogDescription>
                </DialogHeader>
                <AdminTaskStatus task={unfinishedTask} allMovies={allMovies} adminName={adminProfile!.name} />
                <DialogFooter>
                    <Button asChild>
                        <Link href="/admin/upload-movie">
                            <Upload className="mr-2 h-4 w-4" />
                            Go to Upload
                        </Link>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

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
    title: 'Upcoming Releases',
    description: 'Manage upcoming movie announcements.',
    href: '/admin/upcoming-releases',
    icon: Bell,
    id: 'upcoming-releases',
  },
  {
    title: 'Send Push Notifications',
    description: 'Send notifications for new content.',
    href: '/admin/send-notifications',
    icon: Send,
    id: 'send-notifications',
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
  },
  {
    title: "What's New (Admin)",
    description: 'View all recent features and updates.',
    href: '/admin/whats-new',
    icon: Sparkles,
    id: 'whats-new-admin',
  }
];

export default function AdminDashboardPage() {
  const { suggestions, notifications } = useMovieStore();
  const { adminProfile } = useAuth();
  const suggestionCount = suggestions.length;
  const activeTodoTasksCount = adminProfile?.tasks?.filter(t => t.type === 'todo' && (t.status === 'active' || t.status === 'incompleted')).length || 0;

  return (
    <div className="container mx-auto py-8 md:py-12">
      <AdminTaskDialog />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
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
                      {section.id === 'upcoming-releases' && notifications.length > 0 && (
                        <Badge variant="secondary">
                          {notifications.length}
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
