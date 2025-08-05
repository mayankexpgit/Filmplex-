
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '../ui/badge';

const suggestions = [
  { id: 1, user: 'Cinephile123', movie: 'The Matrix', suggestion: 'Please add The Matrix in 4K!', date: '2024-07-28' },
  { id: 2, user: 'ActionFan', movie: 'John Wick 4', suggestion: 'More action movies like John Wick would be great.', date: '2024-07-27' },
  { id: 3, user: 'AnimeWatcher', movie: 'Your Name', suggestion: 'Can we get more anime films? Your Name was amazing.', date: '2024-07-26' },
  { id: 4, user: 'ClassicLover', movie: 'The Godfather', suggestion: 'Requesting classic mob movies.', date: '2024-07-25' },
];

export default function SuggestionsBox() {
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
              <div key={item.id} className="p-3 bg-secondary rounded-lg">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-foreground font-semibold">{item.suggestion}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">by @{item.user}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
