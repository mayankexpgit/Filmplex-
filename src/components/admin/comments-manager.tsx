
'use client';

import { useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useMovieStore, deleteComment as storeDeleteComment } from '@/store/movieStore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';

export default function CommentsManager() {
  const { allComments } = useMovieStore();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleDelete = (movieId: string, commentId: string) => {
    startTransition(async () => {
      try {
        await storeDeleteComment(movieId, commentId);
        toast({
          title: 'Comment Removed',
          description: `The comment has been successfully deleted.`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Database Error',
          description: 'Could not delete the comment. Please try again.',
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Comments</CardTitle>
        <CardDescription>View and delete comments from all movies.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {allComments.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No comments yet.</p>
          ) : (
            <div className="space-y-4">
              {allComments.map((item) => (
                <div key={item.id} className="p-3 bg-secondary rounded-lg flex justify-between items-start">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{(item as any).movieTitle || 'Unknown Movie'}</Badge>
                      <p className="text-sm text-foreground font-semibold">@{item.user}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                    <p className="text-xs text-muted-foreground pt-1">
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.movieId, item.id)} disabled={isPending}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
