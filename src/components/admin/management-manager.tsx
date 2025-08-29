
'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMovieStore, addManagementMember, deleteManagementMember } from '@/store/movieStore';
import { Loader2, PlusCircle, Trash2, User, LinkIcon } from 'lucide-react';
import type { ManagementMember } from '@/lib/data';

export default function ManagementManager() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const managementTeam = useMovieStore((state) => state.managementTeam);

  const [name, setName] = useState('');
  const [info, setInfo] = useState('');

  const handleAddMember = () => {
    if (!name || !info) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all fields for the team member.',
      });
      return;
    }
    
    if (managementTeam.some(m => m.name === name)) {
       toast({
        variant: 'destructive',
        title: 'Already Exists',
        description: 'A team member with this name already exists.',
      });
      return;
    }

    const newMember: Omit<ManagementMember, 'id' | 'contact'> = {
        name,
        info,
    };

    startTransition(async () => {
      try {
        await addManagementMember(newMember as any); // Type assertion for simplicity
        toast({
          title: 'Success!',
          description: `Team member "${name}" has been added.`,
        });
        setName('');
        setInfo('');
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Database Error',
          description: 'Could not add the team member.',
        });
      }
    });
  };

  const handleDeleteMember = (id: string) => {
    startTransition(async () => {
      try {
        await deleteManagementMember(id);
        toast({
          title: 'Success!',
          description: 'Team member has been removed.',
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Database Error',
          description: 'Could not remove the team member.',
        });
      }
    });
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Team Member</CardTitle>
          <CardDescription>
            Add a new member to the management team. This will be visible to users in the Help Center.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="member-name">Member Name</Label>
            <Input
              id="member-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="member-info">Role / Info</Label>
            <Input
              id="member-info"
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              placeholder="e.g. Head of Support"
              disabled={isPending}
            />
          </div>
          <Button onClick={handleAddMember} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            {isPending ? 'Adding...' : 'Add Member'}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>Current Team</CardTitle>
              <CardDescription>
                  This is the current list of management team members.
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              {managementTeam.length === 0 ? (
                  <p className="text-muted-foreground text-center">No team members added yet.</p>
              ) : (
                  managementTeam.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                          <div className="flex items-center gap-4">
                            <User className="h-6 w-6 text-primary" />
                            <div>
                                <p className="font-semibold">{member.name}</p>
                                <p className="text-sm text-muted-foreground">{member.info}</p>
                            </div>
                          </div>
                          <Button variant="destructive" size="icon" onClick={() => handleDeleteMember(member.id)} disabled={isPending}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                      </div>
                  ))
              )}
          </CardContent>
      </Card>

    </div>
  );
}
