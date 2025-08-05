
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMovieStore, updateContactInfo as storeUpdateContactInfo } from '@/store/movieStore';
import { Loader2 } from 'lucide-react';

export default function ContactManager() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const contactInfo = useMovieStore((state) => state.contactInfo);

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Data is now fetched by the AdminLayout.
    // This component just needs to sync its local state when the store's data changes.
    if (contactInfo) {
      setEmail(contactInfo.email);
      setMessage(contactInfo.message);
    }
  }, [contactInfo]);

  const handleSave = () => {
    startTransition(async () => {
      try {
        await storeUpdateContactInfo({ email, message });
        toast({
          title: 'Success!',
          description: 'Contact information has been updated.',
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Database Error',
          description: 'Could not update contact information. Please try again.',
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="contact-email">Contact Email</Label>
          <Input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-message">Contact Message</Label>
          <Textarea
            id="contact-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isPending}
          />
        </div>
        <Button onClick={handleSave} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
}
