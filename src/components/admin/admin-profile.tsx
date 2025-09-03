
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useMovieStore } from '@/store/movieStore';
import { useAuth } from '@/hooks/use-auth';
import type { ManagementMember, Movie, DownloadRecord } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { format, parseISO, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, formatISO } from 'date-fns';
import { Badge } from '../ui/badge';
import { Calendar, CheckCircle, Clock, Target, Hourglass, BarChart2, Download } from 'lucide-react';
import FilmpilexLoader from '../ui/filmplex-loader';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { fetchDownloadAnalytics } from '@/services/movieService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const topLevelRoles = ['Regulator', 'Co-Founder'];

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

function DownloadAnalytics({ allMovies }: { allMovies: Movie[] }) {
    const [analyticsData, setAnalyticsData] = useState<{ date: string; downloads: number }[]>([]);
    const [topMovies, setTopMovies] = useState<{ title: string; count: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const processAnalytics = async () => {
            setIsLoading(true);
            const downloadRecords = await fetchDownloadAnalytics();

            // Process data for the line chart (last 7 days)
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = subDays(new Date(), i);
                return format(d, 'yyyy-MM-dd');
            }).reverse();

            const dailyCounts: { [key: string]: number } = last7Days.reduce((acc, date) => {
                acc[date] = 0;
                return acc;
            }, {} as { [key: string]: number });

            downloadRecords.forEach(record => {
                const recordDate = format(parseISO(record.timestamp), 'yyyy-MM-dd');
                if (dailyCounts[recordDate] !== undefined) {
                    dailyCounts[recordDate]++;
                }
            });

            const chartData = last7Days.map(date => ({
                date: format(new Date(date), 'MMM d'),
                downloads: dailyCounts[date]
            }));
            setAnalyticsData(chartData);

            // Process data for top 5 downloaded movies
            const movieDownloadCounts: { [key: string]: number } = {};
            downloadRecords.forEach(record => {
                movieDownloadCounts[record.movieId] = (movieDownloadCounts[record.movieId] || 0) + 1;
            });
            
            const top5 = Object.entries(movieDownloadCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([movieId, count]) => {
                    const movie = allMovies.find(m => m.id === movieId);
                    return { title: movie?.title || 'Unknown Movie', count };
                });

            setTopMovies(top5);
            setIsLoading(false);
        };

        processAnalytics();
    }, [allMovies]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader><CardTitle>Download Analytics</CardTitle></CardHeader>
                <CardContent className="h-64 flex items-center justify-center">
                    <FilmpilexLoader />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-6 w-6" />
                    Download Analytics
                </CardTitle>
                <CardDescription>Real-time download statistics for your content.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Downloads in Last 7 Days</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer>
                            <LineChart data={analyticsData}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                                <Line type="monotone" dataKey="downloads" stroke="hsl(var(--primary))" strokeWidth={2} dot={{r: 4, fill: "hsl(var(--primary))"}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                 <Separator />
                <div>
                    <h3 className="text-lg font-semibold mb-2">Top 5 Downloaded Movies</h3>
                    {topMovies.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Rank</TableHead>
                                    <TableHead>Movie Title</TableHead>
                                    <TableHead className="text-right">Downloads</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topMovies.map((movie, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{movie.title}</TableCell>
                                        <TableCell className="text-right font-bold">{movie.count}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center text-muted-foreground py-4">No download data available yet.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}


function AdminAnalytics({ admin, movies }: { admin: ManagementMember, movies: Movie[] }) {
    
    const { completedMovies, pendingMovies } = useMemo(() => {
        const allAdminMovies = movies
            .filter(movie => movie.uploadedBy === admin.name)
            .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
        
        const completed = allAdminMovies.filter(isUploadCompleted);
        const pending = allAdminMovies.filter(m => !isUploadCompleted(m));

        return { completedMovies: completed, pendingMovies: pending };
    }, [admin, movies]);
    
    const now = new Date();
    const weeklyMovies = completedMovies.filter(m => m.createdAt && isWithinInterval(new Date(m.createdAt), { start: startOfWeek(now), end: endOfWeek(now) }));
    const monthlyMovies = completedMovies.filter(m => m.createdAt && isWithinInterval(new Date(m.createdAt), { start: startOfMonth(now), end: endOfMonth(now) }));

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

    const isTopLevelAdmin = adminProfile && topLevelRoles.includes(adminProfile.info);

    useEffect(() => {
      // When the component loads, if there's an admin profile,
      // set the selected admin to the currently logged-in admin.
      if (adminProfile && !selectedAdminName) {
        setSelectedAdminName(adminProfile.name);
      }
    }, [adminProfile, selectedAdminName]);

    const handleAdminChange = (name: string) => {
        setSelectedAdminName(name);
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
      <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Admin Profile &amp; Analytics</CardTitle>
                <CardDescription>
                    {`Viewing profile for ${selectedAdmin ? getDisplayName(selectedAdmin.name) : '...'}. Joined on ${selectedAdmin && selectedAdmin.timestamp ? format(new Date(selectedAdmin.timestamp), 'MMMM d, yyyy') : '...'}`}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 {isTopLevelAdmin ? (
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
                 ) : (
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold">{getDisplayName(adminProfile.name)}</h3>
                        <Badge variant="secondary">{adminProfile.info}</Badge>
                    </div>
                 )}
                
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

        <DownloadAnalytics allMovies={allMovies} />
      </div>
    )
}
