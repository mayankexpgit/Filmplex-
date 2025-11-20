'use client';

import { useTransition, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useMovieStore, updateRequestStatus, deleteRequest, fetchRequests } from '@/store/movieStore';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { UserRequest } from '@/lib/data';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import FilmpilexLoader from '../ui/filmplex-loader';

export default function GetAnythingManager() {
  const { requests, isInitialized } = useMovieStore();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Fetch requests when the component mounts if not already initialized
    if (!isInitialized) {
        fetchRequests();
    }
  }, [isInitialized]);

  // Sort requests by timestamp so newest appear first
  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime());
  }, [requests]);

  const handleStatusChange = (id: string, status: UserRequest['status']) => {
    startTransition(async () => {
      try {
        await updateRequestStatus(id, status);
        toast({
          title: 'Status Updated',
          description: `The request status has been changed to "${status}".`,
          variant: 'success'
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: 'Could not update the request status.',
        });
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteRequest(id);
        toast({
          title: 'Request Deleted',
          description: 'The user request has been successfully deleted.',
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Delete Failed',
          description: 'Could not delete the request.',
        });
      }
    });
  };
  
    const getStatusBadge = (status: UserRequest['status']) => {
        switch(status) {
        case 'pending':
            return <Badge variant="outline">Pending</Badge>;
        case 'uploaded':
            return <Badge variant="success">Uploaded</Badge>;
        case 'unavailable':
            return <Badge variant="destructive">Unavailable</Badge>;
        case 'soon':
            return <Badge variant="default" className="bg-blue-500">Coming Soon</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
        }
    }

    if (!isInitialized) {
        return (
            <div className="flex justify-center items-center h-64">
                <FilmpilexLoader />
            </div>
        );
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get Anything - User Requests</CardTitle>
        <CardDescription>Manage movie and series requests from users.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh] pr-4">
          {sortedRequests.length > 0 ? (
            <div className="space-y-4">
              {sortedRequests.map((item) => (
                <div key={item.id} className="p-4 bg-secondary rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg text-foreground font-semibold">{item.movieName}</h3>
                        {getStatusBadge(item.status)}
                    </div>
                    {item.comment && <p className="text-sm text-muted-foreground italic">"{item.comment}"</p>}
                    <p className="text-xs text-muted-foreground pt-1">
                      {formatDistanceToNow(parseISO(item.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select onValueChange={(status: UserRequest['status']) => handleStatusChange(item.id, status)} defaultValue={item.status} disabled={isPending}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="uploaded">Uploaded</SelectItem>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
                        <SelectItem value="soon">Soon</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id)} disabled={isPending}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center text-muted-foreground py-16">
                <p>No user requests yet.</p>
              </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
