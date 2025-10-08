
'use client';

import { useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useMovieStore, deleteSuggestion as storeDeleteSuggestion } from '@/store/movieStore';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export default function SuggestionsBox() {
  const { suggestions } = useMovieStore();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await storeDeleteSuggestion(id);
        toast({
          title: 'Suggestion Removed',
          description: `The suggestion has been deleted.`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Database Error',
          description: 'Could not delete suggestion. Please try again.',
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggestions Box</CardTitle>
        <CardDescription>Suggestions and requests from users.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {suggestions.length > 0 ? (
            <div className="space-y-4">
              {suggestions.map((item) => (
                <div key={item.id} className="p-3 bg-secondary rounded-lg flex justify-between items-start">
                  <div className="flex-1 space-y-2">
                    <p className="text-base text-foreground font-semibold">{item.movieName}</p>
                    <p className="text-sm text-muted-foreground">{item.comment}</p>
                    <p className="text-xs text-muted-foreground pt-1">
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} disabled={isPending}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center text-muted-foreground py-16">
                <p>No suggestions yet.</p>
              </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
