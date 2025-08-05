
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';

export default function MovieNotification() {
  const { toast } = useToast();

  const handleSendNotification = () => {
    toast({
      title: 'Notification Sent!',
      description: 'The movie notification has been sent to all users.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movie Notification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notification-title">Notification Title</Label>
          <Input id="notification-title" placeholder="e.g., New Movie Alert!" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notification-message">Message</Label>
          <Textarea id="notification-message" placeholder="Describe the new movie or update." />
        </div>
        <Button onClick={handleSendNotification}>Send Notification</Button>
      </CardContent>
    </Card>
  );
}
