
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMovieStore, updateContactInfo as storeUpdateContactInfo } from '@/store/movieStore';
import { Loader2 } from 'lucide-react';
import type { ContactInfo } from '@/store/movieStore';

const initialFormState: ContactInfo = {
  telegramUrl: '',
  whatsappUrl: '',
  instagramUrl: '',
  email: '',
  whatsappNumber: ''
};

export default function HelpCenterManager() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const contactInfo = useMovieStore((state) => state.contactInfo);
  
  const [formData, setFormData] = useState<ContactInfo>(initialFormState);

  useEffect(() => {
    // Data is now fetched by the AdminLayout.
    // This component just needs to sync its local state when the store's data changes.
    if (contactInfo) {
      setFormData(contactInfo);
    }
  }, [contactInfo]);

  const handleInputChange = (field: keyof ContactInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        await storeUpdateContactInfo(formData);
        toast({
          title: 'Success!',
          description: 'Help Center information has been updated.',
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Database Error',
          description: 'Could not update Help Center information. Please try again.',
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Help Center Management</CardTitle>
        <CardDescription>Update the contact links and details that users will see.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="telegram-url">Telegram URL</Label>
          <Input
            id="telegram-url"
            value={formData.telegramUrl || ''}
            onChange={(e) => handleInputChange('telegramUrl', e.target.value)}
            placeholder="https://t.me/yourchannel"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp-url">WhatsApp URL</Label>
          <Input
            id="whatsapp-url"
            value={formData.whatsappUrl || ''}
            onChange={(e) => handleInputChange('whatsappUrl', e.target.value)}
            placeholder="https://wa.me/yournumber"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagram-url">Instagram URL</Label>
          <Input
            id="instagram-url"
            value={formData.instagramUrl || ''}
            onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
            placeholder="https://instagram.com/yourprofile"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">Contact Email</Label>
          <Input
            id="contact-email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="contact@example.com"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp-number">WhatsApp Display Number</Label>
          <Input
            id="whatsapp-number"
            value={formData.whatsappNumber || ''}
            onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
            placeholder="+1 234 567 890"
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
