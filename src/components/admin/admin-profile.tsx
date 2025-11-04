

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useMovieStore, calculateAllWallets } from '@/store/movieStore';
import { useAuth } from '@/hooks/use-auth';
import type { ManagementMember, Movie, AdminTask, TodoItem, Wallet, Settlement } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { format, parseISO, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, startOfToday, endOfToday, getDaysInMonth, isAfter } from 'date-fns';
import { Badge } from '../ui/badge';
import { Calendar, CheckCircle, Clock, Target, Hourglass, BarChart2, Download, History, AlertCircle, XCircle, Archive, ListChecks, Wallet as WalletIcon, IndianRupee, HelpCircle, Film, Tv, TrendingDown, BookCheck, TimerOff, CircleDollarSign } from 'lucide-react';
import FilmpilexLoader from '../ui/filmplex-loader';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { fetchDownloadAnalytics } from '@/services/movieService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

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
        return !!movie.downloadLinks && movie.downloadLinks.some(link => link && link.url);
    }
    if (movie.contentType === 'series') {
        const hasEpisodeLinks = movie.episodes && movie.episodes.some(ep => ep.downloadLinks.some(link => link && link.url));
        const hasSeasonLinks = movie.seasonDownloadLinks && movie.seasonDownloadLinks.some(link => link && link.url);
        return !!(hasEpisodeLinks || hasSeasonLinks);
    }
    return false;
}

const TaskStatusBadge = ({ task }: { task?: AdminTask }) => {
    if (!task) return <Badge variant="secondary">No Task</Badge>;

    switch(task.status) {
        case 'active':
            return <Badge variant="default"><AlertCircle className="mr-1 h-3 w-3" />Active</Badge>;
        case 'completed':
            return <Badge variant="success"><CheckCircle className="mr-1 h-3 w-3" />Completed</Badge>;
        case 'incompleted':
            return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Incompleted</Badge>;
        case 'cancelled':
            return <Badge variant="outline"><Archive className="mr-1 h-3 w-3" />Cancelled</Badge>;
        default:
            return <Badge variant="secondary">No Task</Badge>;
    }
};

function DownloadAnalytics({ allMovies }: { allMovies: Movie[] }) {
    const [analyticsData, setAnalyticsData] = useState<{ date: string; downloads: number }[]>([]);
    const [topMovies, setTopMovies] = useState<{ title: string; count: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | 'all'>('7d');
    const [allDownloadRecords, setAllDownloadRecords] = useState<{ id: string, movieId: string, timestamp: string }[]>([]);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            const records = await fetchDownloadAnalytics();
            setAllDownloadRecords(records);
            setIsLoading(false);
        }
        fetchAllData();
    }, []);

    useEffect(() => {
        if (isLoading) return;
        
        let startDate: Date;
        const now = endOfToday();

        switch (timeFilter) {
            case '7d':
                startDate = startOfToday();
                startDate.setDate(startDate.getDate() - 6);
                break;
            case '30d':
                startDate = startOfToday();
                startDate.setDate(startDate.getDate() - 29);
                break;
            case 'all':
                startDate = allDownloadRecords.length > 0 ? parseISO(allDownloadRecords[allDownloadRecords.length - 1].timestamp) : now;
                break;
        }

        const filteredRecords = allDownloadRecords.filter(record => {
            const recordDate = parseISO(record.timestamp);
            return timeFilter === 'all' || isWithinInterval(recordDate, { start: startDate, end: now });
        });
        
        // Process data for the line chart
        const dailyCounts: { [key: string]: number } = {};
        
        if (timeFilter !== 'all') {
            const dateRange = Array.from({ length: timeFilter === '7d' ? 7 : 30 }, (_, i) => {
                const d = subDays(new Date(), i);
                return format(d, 'yyyy-MM-dd');
            }).reverse();

            dateRange.forEach(date => { dailyCounts[date] = 0; });
            
            filteredRecords.forEach(record => {
                const recordDate = format(parseISO(record.timestamp), 'yyyy-MM-dd');
                if (dailyCounts[recordDate] !== undefined) {
                    dailyCounts[recordDate]++;
                }
            });
             const chartData = Object.entries(dailyCounts).map(([date, downloads]) => ({
                date: format(new Date(date), 'MMM d'),
                downloads,
            }));
            setAnalyticsData(chartData);

        } else { // Handle "All Time" grouping by month
            const monthlyCounts: { [key: string]: number } = {};
            filteredRecords.forEach(record => {
                const monthKey = format(parseISO(record.timestamp), 'yyyy-MM');
                monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
            });
            const chartData = Object.entries(monthlyCounts).sort(([a], [b]) => a.localeCompare(b)).map(([month, downloads]) => ({
                date: format(new Date(month + '-02'), 'yyyy-MM-dd'), // Using day 02 to avoid timezone issues
                downloads
            }));
            setAnalyticsData(chartData);
        }

        // Process data for top 5 downloaded movies for the selected period
        const movieDownloadCounts: { [key: string]: number } = {};
        filteredRecords.forEach(record => {
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

    }, [timeFilter, allMovies, isLoading, allDownloadRecords]);
    
    const totalDownloads = useMemo(() => {
        let startDate: Date;
        const now = endOfToday();

        switch (timeFilter) {
            case '7d': startDate = subDays(now, 6); break;
            case '30d': startDate = subDays(now, 29); break;
            case 'all': return allDownloadRecords.length;
        }
        
        return allDownloadRecords.filter(record => 
            isWithinInterval(parseISO(record.timestamp), { start: startDate, end: now })
        ).length;

    }, [timeFilter, allDownloadRecords]);

    if (isLoading && allDownloadRecords.length === 0) {
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
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart2 className="h-6 w-6" />
                            Download Analytics
                        </CardTitle>
                        <CardDescription>Total downloads this period: <span className="font-bold text-foreground">{totalDownloads}</span></CardDescription>
                    </div>
                     <Select value={timeFilter} onValueChange={(val: '7d' | '30d' | 'all') => setTimeFilter(val)}>
                        <SelectTrigger className="w-[180px]">
                             <History className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 Days</SelectItem>
                            <SelectItem value="30d">Last 30 Days</SelectItem>
                            <SelectItem value="all">All Time</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Downloads Over Time</h3>
                    <div className="h-[250px] w-full">
                         {analyticsData.length > 0 ? (
                            <ResponsiveContainer>
                                <LineChart data={analyticsData}>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                                    <Line type="monotone" dataKey="downloads" stroke="hsl(var(--primary))" strokeWidth={2} dot={{r: 4, fill: "hsl(var(--primary))"}} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                No download data for this period.
                            </div>
                        )}
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
                        <p className="text-center text-muted-foreground py-4">No download data available for this period.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

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

function WalletCard({ wallet, isCalculating }: { wallet?: Wallet, isCalculating: boolean }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <WalletIcon className="h-7 w-7 text-primary" />
                    Virtual Admin Wallet
                </CardTitle>
                <CardDescription>Earnings from your content uploads.</CardDescription>
            </CardHeader>
            <CardContent>
            {isCalculating ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2">
                    <FilmpilexLoader />
                    <p className="text-muted-foreground">Calculating balances...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">This Week</p>
                        <p className="text-2xl font-bold flex items-center justify-center gap-1">
                            <IndianRupee className="h-5 w-5" />{wallet?.weekly.toFixed(2) || '0.00'}
                        </p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">This Month</p>
                        <p className="text-2xl font-bold flex items-center justify-center gap-1">
                            <IndianRupee className="h-5 w-5" />{wallet?.monthly.toFixed(2) || '0.00'}
                        </p>
                    </div>
                    <div className="p-4 bg-primary/20 border border-primary/50 rounded-lg">
                        <p className="text-sm text-primary/80">Total Earnings</p>
                        <p className="text-3xl font-bold text-primary flex items-center justify-center gap-1">
                            <IndianRupee className="h-6 w-6" />{wallet?.total.toFixed(2) || '0.00'}
                        </p>
                    </div>
                </div>
            )}
            </CardContent>
            <CardFooter className="pt-4 border-t">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-0">
                        <AccordionTrigger>
                            <div className="flex items-center gap-2 text-sm">
                                <HelpCircle className="h-4 w-4" />
                                How is this calculated?
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2">
                             <div>
                                <h4 className="font-semibold text-base mb-2">New Uploads (On or After Nov 4, 2025)</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground pl-4">
                                    <li className="flex items-start gap-2">
                                        <Film className="h-4 w-4 mt-1 text-primary"/>
                                        <span><b>Movies:</b> ₹0.15 for every 2 valid links (max ₹0.40 per movie).</span>
                                    </li>
                                     <li className="flex items-start gap-2">
                                        <Tv className="h-4 w-4 mt-1 text-primary"/>
                                        <span><b>Web Series:</b> ₹0.30 for every 2 valid links (no maximum limit).</span>
                                    </li>
                                </ul>
                            </div>
                             <div>
                                <h4 className="font-semibold text-base mb-2">Legacy Uploads (Before Nov 4, 2025)</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground pl-4">
                                     <li className="flex items-start gap-2">
                                        <Archive className="h-4 w-4 mt-1 text-primary"/>
                                        <span>A flat rate of ₹0.50 for every movie or series with at least one valid download link.</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-base mb-2">Penalties</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground pl-4">
                                     <li className="flex items-start gap-2">
                                        <TrendingDown className="h-4 w-4 mt-1 text-destructive"/>
                                        <span>A penalty of <b>₹0.50</b> is deducted from the total earnings for each task that is not completed by its deadline.</span>
                                    </li>
                                </ul>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardFooter>
        </Card>
    )
}

const SettlementStatusBadge = ({ status }: { status: Settlement['status'] }) => {
    switch (status) {
        case 'pending':
            return <Badge variant="outline" className="text-amber-500 border-amber-500"><Hourglass className="mr-1 h-3 w-3"/>Pending</Badge>;
        case 'credited':
            return <Badge variant="success"><CheckCircle className="mr-1 h-3 w-3"/>Credited</Badge>;
        case 'penalty':
            return <Badge variant="destructive"><TimerOff className="mr-1 h-3 w-3"/>Penalty</Badge>;
    }
}

function MonthlyStatement({ settlements }: { settlements: Settlement[] }) {
    const sortedSettlements = [...settlements].sort((a, b) => b.month.localeCompare(a.month));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <BookCheck className="h-7 w-7 text-primary" />
                    Monthly Statement
                </CardTitle>
                <CardDescription>History of your monthly earnings and their settlement status.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[200px] pr-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Month</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedSettlements.length > 0 ? sortedSettlements.map((s, i) => (
                                <TableRow key={i}>
                                    <TableCell>{format(parseISO(`${s.month}-02`), 'MMMM yyyy')}</TableCell>
                                    <TableCell>
                                        <span className="flex items-center gap-1"><IndianRupee className="h-4 w-4" />{s.amount.toFixed(2)}</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <SettlementStatusBadge status={s.status} />
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">No settlement history found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

function AdminAnalytics({ admin, movies, isCalculatingWallet }: { admin: ManagementMember, movies: Movie[], isCalculatingWallet: boolean }) {
    
    const { completedMovies, pendingMovies } = useMemo(() => {
        const sortMoviesByDate = (a: Movie, b: Movie) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime();
        };

        const allAdminMovies = movies.filter(movie => movie.uploadedBy === admin.name);
        
        const completed = allAdminMovies.filter(isUploadCompleted).sort(sortMoviesByDate);
        const pending = allAdminMovies.filter(m => !isUploadCompleted(m)).sort(sortMoviesByDate);
        
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
    
    const allTasks = admin.tasks || [];
    const sortedTasks = [...allTasks].sort((a, b) => parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime());
    const activeTasks = admin.tasks?.filter(t => t.status === 'active' || t.status === 'incompleted') || [];

    return (
        <div className="space-y-6">
            <WalletCard wallet={admin.wallet} isCalculating={isCalculatingWallet} />

            <MonthlyStatement settlements={admin.settlements || []} />

             <Card>
                <CardHeader>
                    <CardTitle>Upload Overview</CardTitle>
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

            {activeTasks.length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Current Active Tasks</CardTitle>
                        <CardDescription>Progress for all current targets.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {activeTasks.map(task => {
                             const { completed, target, progress } = getTaskProgress(task, movies, admin.name);
                             const Icon = task.type === 'target' ? Target : ListChecks;

                             return (
                                <div key={task.id} className="p-3 border rounded-lg">
                                    <div className="flex justify-between items-center gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Icon className="h-5 w-5 text-primary" />
                                            <span className="font-medium">{task.title}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Hourglass className="h-5 w-5 text-primary" />
                                            <span className="font-medium">Deadline: {format(parseISO(task.deadline), 'PPp')}</span>
                                        </div>
                                    </div>
                                    <Progress value={progress} className="h-3 my-2" />
                                     <p className="text-center text-muted-foreground text-sm">
                                        {completed} / {target} completed ({Math.round(progress)}%)
                                    </p>
                                </div>
                             )
                        })}
                    </CardContent>
                </Card>
            )}

             <Card>
                <CardHeader>
                    <CardTitle>Task History</CardTitle>
                    <CardDescription>Record of all assigned tasks.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[300px]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Task Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Deadline</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedTasks.length > 0 ? sortedTasks.map((task) => (
                                    <TableRow key={task.id}>
                                        <TableCell>{task.title}</TableCell>
                                        <TableCell><Badge variant="outline" className="capitalize">{task.type}</Badge></TableCell>
                                        <TableCell>{format(parseISO(task.deadline), 'PP')}</TableCell>
                                        <TableCell><TaskStatusBadge task={task} /></TableCell>
                                    </TableRow>
                                )) : <TableRow key="no-tasks"><TableCell colSpan={4} className="text-center h-24">No task history.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>

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
                                    {completedMovies.length > 0 ? completedMovies.map((movie, index) => (
                                        <TableRow key={`${movie.id}-${index}`}><TableCell>{movie.title}</TableCell><TableCell>{movie.createdAt ? format(new Date(movie.createdAt), 'PPP') : 'N/A'}</TableCell></TableRow>
                                    )) : <TableRow key="no-completed-uploads"><TableCell colSpan={2} className="text-center h-24">No completed uploads.</TableCell></TableRow>}
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
                                    {pendingMovies.length > 0 ? pendingMovies.map((movie, index) => (
                                        <TableRow key={`${movie.id}-${index}`}><TableCell>{movie.title}</TableCell><TableCell>{movie.createdAt ? format(new Date(movie.createdAt), 'PPP') : 'N/A'}</TableCell></TableRow>
                                    )) : <TableRow key="no-pending-uploads"><TableCell colSpan={2} className="text-center h-24">No pending uploads.</TableCell></TableRow>}
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
    const [isCalculating, setIsCalculating] = useState(false);

    const isTopLevelAdmin = adminProfile && topLevelRoles.includes(adminProfile.info);

    useEffect(() => {
      if (adminProfile && !selectedAdminName) {
        setSelectedAdminName(adminProfile.name);
      }
    }, [adminProfile, selectedAdminName]);

    useEffect(() => {
        const triggerWalletCalculation = async () => {
            if (managementTeam.length > 0 && allMovies.length > 0) {
                setIsCalculating(true);
                try {
                    await calculateAllWallets(managementTeam, allMovies);
                } catch (error) {
                    console.error("Wallet calculation failed:", error);
                } finally {
                    setIsCalculating(false);
                }
            }
        };
        triggerWalletCalculation();
    }, [managementTeam, allMovies]);


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
                    <AdminAnalytics admin={selectedAdmin} movies={allMovies} isCalculatingWallet={isCalculating} />
                ) : (
                    <div className="text-center py-16 text-muted-foreground">
                        <p>Select an admin to see their statistics.</p>
                    </div>
                )}
            </CardContent>
        </Card>

        {isTopLevelAdmin && <DownloadAnalytics allMovies={allMovies} />}
      </div>
    )
}
