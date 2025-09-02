'use client';

import { useState, useMemo } from 'react';
import { useMovieStore } from '@/store/movieStore';
import { useAuth } from '@/hooks/use-auth';
import type { ManagementMember, Movie } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { Badge } from '../ui/badge';
import { Calendar, CheckCircle, Clock, Target, Hourglass } from 'lucide-react';
import FilmpilexLoader from '../ui/filmplex-loader';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';

const getDisplayName = (fullName: string) => {
    if (!fullName) return '';
    if (fullName.includes('.')) {
        return fullName.split('.').pop() || fullName;
    }
    return fullName;
}

const isUploadCompleted = (movie: Movie): boolean => {
    if (movie.contentType === 'movie') {
        return !!movie.downloadLinks && movie.downloadLinks.some(link => link.url);
    }
    if (movie.contentType === 'series') {
        const hasEpisodeLinks = movie.episodes && movie.episodes.some(ep => ep.downloadLinks.some(link => link.url));
        const hasSeasonLinks = movie.seasonDownloadLinks && movie.seasonDownloadLinks.some(link => link.url);
        return !!(hasEpisodeLinks || hasSeasonLinks);
    }
    return false;
}


function AdminAnalytics({ admin, movies }: { admin: ManagementMember, movies: Movie[] }) {
    
    const { adminMovies, completedMovies, pendingMovies } = useMemo(() => {
        const allAdminMovies = movies
            .filter(movie => movie.uploadedBy === admin.name)
            .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
        
        const completed = allAdminMovies.filter(isUploadCompleted);
        const pending = allAdminMovies.filter(m => !isUploadCompleted(m));

        return { adminMovies: allAdminMovies, completedMovies: completed, pendingMovies: pending };
    }, [admin, movies]);
    
    const now = new Date();
    const weeklyMovies = completedMovies.filter(m => isWithinInterval(new Date(m.createdAt!), { start: startOfWeek(now), end: endOfWeek(now) }));
    const monthlyMovies = completedMovies.filter(m => isWithinInterval(new Date(m.createdAt!), { start: startOfMonth(now), end: endOfMonth(now) }));

    const stats = [
        { label: 'Completed Uploads', value: completedMovies.length, icon: CheckCircle },
        { label: 'This Week', value: weeklyMovies.length, icon: Calendar },
        { label: 'This Month', value: monthlyMovies.length, icon: Clock },
    ];
    
    const taskProgress = admin.task ? (completedMovies.length / admin.task.targetUploads) * 100 : 0;

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stats.map(stat => (
                        <div key={stat.label} className="p-4 bg-secondary rounded-lg flex items-center gap-4">
                            <stat.icon className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {admin.task && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Current Task</CardTitle>
                        <CardDescription>Progress for the current {admin.task.timeframe} target.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-primary" />
                                <span className="font-medium">Target: {admin.task.targetUploads} uploads</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Hourglass className="h-5 w-5 text-primary" />
                                <span className="font-medium">Deadline: {format(parseISO(admin.task.deadline), 'PPp')}</span>
                            </div>
                        </div>
                        <Progress value={taskProgress} className="h-3" />
                         <p className="text-center text-muted-foreground text-sm">
                            {completedMovies.length} / {admin.task.targetUploads} uploads completed ({Math.round(taskProgress)}%)
                        </p>
                    </CardContent>
                </Card>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Completed Uploads ({completedMovies.length})</CardTitle>
                        <CardDescription>Content with valid download links.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px]">
                            <Table>
                                <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {completedMovies.length > 0 ? completedMovies.map(movie => (
                                        <TableRow key={movie.id}><TableCell>{movie.title}</TableCell><TableCell>{format(new Date(movie.createdAt!), 'PPP')}</TableCell></TableRow>
                                    )) : <TableRow><TableCell colSpan={2} className="text-center h-24">No completed uploads.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Uploads ({pendingMovies.length})</CardTitle>
                        <CardDescription>Content missing download links.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px]">
                            <Table>
                                <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {pendingMovies.length > 0 ? pendingMovies.map(movie => (
                                        <TableRow key={movie.id}><TableCell>{movie.title}</TableCell><TableCell>{format(new Date(movie.createdAt!), 'PPP')}</TableCell></TableRow>
                                    )) : <TableRow><TableCell colSpan={2} className="text-center h-24">No pending uploads.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}


export default function AdminProfile() {
    const { adminProfile, isLoading } = useAuth();
    const { managementTeam, allMovies } = useMovieStore();
    const [selectedAdminName, setSelectedAdminName] = useState<string | undefined>(undefined);

    const handleAdminChange = (name: string) => {
        setSelectedAdminName(name);
    }
    
    // Set default selected admin to the current user if they are a top-level user
    if (!selectedAdminName && adminProfile) {
        setSelectedAdminName(adminProfile.name);
    }

    const selectedAdmin = useMemo(() => {
        return managementTeam.find(m => m.name === selectedAdminName);
    }, [selectedAdminName, managementTeam]);


    if (isLoading || !adminProfile) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <FilmpilexLoader />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Admin Profile &amp; Analytics</CardTitle>
                <CardDescription>
                    {`Joined on ${format(new Date(selectedAdmin?.timestamp || Date.now()), 'MMMM d, yyyy')}`}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                     <Select value={selectedAdminName} onValueChange={handleAdminChange}>
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Select an admin to view stats" />
                        </SelectTrigger>
                        <SelectContent>
                            {managementTeam.map(member => (
                                <SelectItem key={member.id} value={member.name}>
                                    {getDisplayName(member.name)} <span className="text-xs text-muted-foreground ml-2">({member.info})</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {selectedAdmin && <Badge variant="secondary">{selectedAdmin.info}</Badge>}
                </div>
                
                <Separator />

                {selectedAdmin ? (
                    <AdminAnalytics admin={selectedAdmin} movies={allMovies} />
                ) : (
                    <div className="text-center py-16 text-muted-foreground">
                        <p>Select an admin to see their statistics.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
