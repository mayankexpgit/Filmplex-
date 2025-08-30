
'use client';

import { useState, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { submitSuggestion } from '@/store/movieStore';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Loader2, Send } from 'lucide-react';
import type { ManagementMember } from '@/lib/data';

interface SuggestionFormProps {
  onSubmitted: () => void;
  recipient?: ManagementMember | null;
}

export default function SuggestionForm({ onSubmitted, recipient = null }: SuggestionFormProps) {
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
    
    // If there is a recipient, we prefix the comment.
    const finalComment = recipient ? `@${recipient.name}: ${comment}` : comment;

    startTransition(async () => {
      try {
        await submitSuggestion(movieName, finalComment);
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
        <Label htmlFor="suggestion-movie-name">{recipient ? 'Subject' : 'Movie / Series Name'}</Label>
        <Input
          id="suggestion-movie-name"
          value={movieName}
          onChange={(e) => setMovieName(e.target.value)}
          placeholder={recipient ? `Message to ${recipient.name}` : "e.g. The Matrix"}
          disabled={isPending || !!recipient}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="suggestion-comment">{recipient ? 'Your Message' : 'Your Suggestion (Optional)'}</Label>
        <Textarea
          id="suggestion-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={recipient ? `Write your message to ${recipient.name}...` : "Any specific details? e.g. 'Please upload in 4K quality'"}
          rows={5}
          disabled={isPending}
        />
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        {isPending ? 'Sending...' : (recipient ? 'Send Message' : 'Send Suggestion')}
      </Button>
    </form>
  );
}
