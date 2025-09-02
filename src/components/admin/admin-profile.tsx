
'use client';

import { useState, useMemo } from 'react';
import { useMovieStore } from '@/store/movieStore';
import { useAuth } from '@/hooks/use-auth';
import type { ManagementMember, Movie } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Badge } from '../ui/badge';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import FilmpilexLoader from '../ui/filmplex-loader';

const getDisplayName = (fullName: string) => {
    if (!fullName) return '';
    if (fullName.includes('.')) {
        return fullName.split('.').pop() || fullName;
    }
    return fullName;
}


function AdminAnalytics({ admin, movies }: { admin: ManagementMember, movies: Movie[] }) {
    
    const adminMovies = useMemo(() => {
        return movies
            .filter(movie => movie.uploadedBy === admin.name)
            .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    }, [admin, movies]);
    
    const now = new Date();
    const weeklyMovies = adminMovies.filter(m => isWithinInterval(new Date(m.createdAt!), { start: startOfWeek(now), end: endOfWeek(now) }));
    const monthlyMovies = adminMovies.filter(m => isWithinInterval(new Date(m.createdAt!), { start: startOfMonth(now), end: endOfMonth(now) }));

    const stats = [
        { label: 'Total Uploads', value: adminMovies.length, icon: CheckCircle },
        { label: 'This Week', value: weeklyMovies.length, icon: Calendar },
        { label: 'This Month', value: monthlyMovies.length, icon: Clock },
    ];

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

            <Card>
                <CardHeader>
                    <CardTitle>All Uploads</CardTitle>
                    <CardDescription>A complete list of all content uploaded by {getDisplayName(admin.name)}.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ScrollArea className="h-[400px]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Upload Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {adminMovies.length > 0 ? adminMovies.map(movie => (
                                    <TableRow key={movie.id}>
                                        <TableCell>{movie.title}</TableCell>
                                        <TableCell>{format(new Date(movie.createdAt!), 'PPP')}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center h-24">
                                            No movies uploaded by this admin yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
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
                <CardTitle>Admin Profile & Analytics</CardTitle>
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
