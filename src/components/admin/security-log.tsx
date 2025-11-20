'use client';

import { useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { useMovieStore, fetchSecurityLogs } from '@/store/movieStore';
import { Separator } from '../ui/separator';
import { formatDistanceToNow, parseISO } from 'date-fns';
import FilmpilexLoader from '../ui/filmplex-loader';

export default function SecurityLog() {
  const { securityLogs, latestReleases, featuredMovies, isInitialized } = useMovieStore();

  useEffect(() => {
    // Fetch logs when the component mounts if not already initialized
    if (!isInitialized) {
        fetchSecurityLogs();
    }
  }, [isInitialized]);

  const latestUploads = useMemo(() => {
    const allMovies = [...latestReleases, ...featuredMovies].filter(
      (movie, index, self) => index === self.findIndex((m) => m.id === movie.id)
    );
    
    return allMovies
      .filter(movie => movie.createdAt) // Only include movies with a creation date
      .sort((a, b) => parseISO(b.createdAt!).getTime() - parseISO(a.createdAt!).getTime())
      .slice(0, 10);
  }, [latestReleases, featuredMovies]);

  if (!isInitialized) {
      return (
          <div className="flex justify-center items-center h-64">
              <FilmpilexLoader />
          </div>
      );
  }
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Security Log</CardTitle>
          <CardDescription>Track of all admin activities.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {securityLogs.length > 0 ? (
                  securityLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.admin}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{parseISO(log.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">No security logs found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Latest 10 Uploads</CardTitle>
          <CardDescription>A quick view of the most recently added movies and series.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead className="text-right">Uploaded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestUploads.map((movie) => (
                  <TableRow key={movie.id}>
                    <TableCell className="font-medium">{movie.title}</TableCell>
                    <TableCell>{movie.year}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDistanceToNow(parseISO(movie.createdAt!), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {latestUploads.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                    <p>No movies have been uploaded yet.</p>
                </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
