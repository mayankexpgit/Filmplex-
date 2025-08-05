
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useMovieStore } from '@/store/movieStore';
import { useToast } from '@/hooks/use-toast';

export default function SuggestionsBox() {
  const { suggestions, deleteSuggestion } = useMovieStore((state) => ({
    suggestions: state.suggestions,
    deleteSuggestion: state.deleteSuggestion,
  }));
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    deleteSuggestion(id);
    toast({
      title: 'Suggestion Removed',
      description: `Suggestion with ID ${id} has been deleted.`,
    });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Suggestions Box</CardTitle>
        <CardDescription>Suggestions and requests from users.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px] pr-4">
          <div className="space-y-4">
            {suggestions.map((item) => (
              <div key={item.id} className="p-3 bg-secondary rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-sm text-foreground font-semibold">{item.suggestion}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">by @{item.user}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
