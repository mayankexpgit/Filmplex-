'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function ContactManager() {
  const { toast } = useToast();
  const [contactEmail, setContactEmail] = useState('admin@filmplex.com');
  const [contactMessage, setContactMessage] = useState('For any queries, please reach out to us.');

  const handleSave = () => {
    // Here you would typically make an API call to save the data
    console.log('Saving contact info:', { contactEmail, contactMessage });
    toast({
      title: 'Success!',
      description: 'Contact information has been updated.',
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
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-message">Contact Message</Label>
          <Textarea
            id="contact-message"
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
          />
        </div>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardContent>
    </Card>
  );
}
