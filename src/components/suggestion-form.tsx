
'use client';

import { useState, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { submitSuggestion } from '@/store/movieStore';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Loader2, Send } from 'lucide-react';

interface SuggestionFormProps {
  onSubmitted: () => void;
}

export default function SuggestionForm({ onSubmitted }: SuggestionFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [movieName, setMovieName] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Movie Name Required',
        description: 'Please enter the name of the movie or series.',
      });
      return;
    }

    startTransition(async () => {
      try {
        await submitSuggestion(movieName, comment);
        toast({
          title: 'Suggestion Sent!',
          description: "Thanks for your feedback. We'll look into it.",
        });
        setMovieName('');
        setComment('');
        onSubmitted();
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not send your suggestion. Please try again.',
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-8">
      <div className="space-y-2">
        <Label htmlFor="suggestion-movie-name">Movie / Series Name</Label>
        <Input
          id="suggestion-movie-name"
          value={movieName}
          onChange={(e) => setMovieName(e.target.value)}
          placeholder="e.g. The Matrix"
          disabled={isPending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="suggestion-comment">Your Suggestion (Optional)</Label>
        <Textarea
          id="suggestion-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Any specific details? e.g. 'Please upload in 4K quality'"
          rows={5}
          disabled={isPending}
        />
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        {isPending ? 'Sending...' : 'Send Suggestion'}
      </Button>
    </form>
  );
}
