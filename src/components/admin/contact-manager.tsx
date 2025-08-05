
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMovieStore } from '@/store/movieStore';

export default function ContactManager() {
  const { toast } = useToast();
  const { contactInfo, updateContactInfo } = useMovieStore((state) => ({
    contactInfo: state.contactInfo,
    updateContactInfo: state.updateContactInfo,
  }));

  const [email, setEmail] = useState(contactInfo.email);
  const [message, setMessage] = useState(contactInfo.message);

  useEffect(() => {
    setEmail(contactInfo.email);
    setMessage(contactInfo.message);
  }, [contactInfo]);

  const handleSave = () => {
    updateContactInfo({ email, message });
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-message">Contact Message</Label>
          <Textarea
            id="contact-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardContent>
    </Card>
  );
}
