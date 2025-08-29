
'use client';

import { useState, useTransition, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMovieStore, addManagementMember, deleteManagementMember } from '@/store/movieStore';
import { Loader2, PlusCircle, Trash2, User } from 'lucide-react';
import type { ManagementMember } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const adminRoles = [
    'Regulator',
    'Founder',
    'Owner',
    'Admin',
    'Co-Founder',
    'Moderator',
    'Uploader',
    'Content Manager',
    'Support Head'
];

export default function ManagementManager() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const managementTeam = useMovieStore((state) => state.managementTeam);

  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const availableRoles = useMemo(() => {
    const assignedRoles = new Set(managementTeam.map(member => member.info));
    return adminRoles.filter(role => !assignedRoles.has(role));
  }, [managementTeam]);

  const handleAddMember = () => {
    if (!name || !selectedRole) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in the member name and select a role.',
      });
      return;
    }
    
    const newMember: Omit<ManagementMember, 'id'> = {
        name,
        info: selectedRole,
    };

    startTransition(async () => {
      try {
        await addManagementMember(newMember as any); // Type assertion for simplicity
        toast({
          title: 'Success!',
          description: `Team member "${name}" has been added with the role "${selectedRole}".`,
        });
        setName('');
        setSelectedRole('');
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Database Error',
          description: 'Could not add the team member.',
        });
      }
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Team Member</CardTitle>
          <CardDescription>
            Add a new member to the management team with a specific role. Each role can only be assigned once.
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
            <Label htmlFor="member-role">Role</Label>
             <Select value={selectedRole} onValueChange={setSelectedRole} disabled={isPending}>
                <SelectTrigger id="member-role">
                    <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                    {availableRoles.length > 0 ? (
                        availableRoles.map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))
                    ) : (
                        <div className="p-2 text-center text-sm text-muted-foreground">All roles assigned</div>
                    )}
                </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddMember} disabled={isPending || availableRoles.length === 0}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            {isPending ? 'Adding...' : 'Add Member'}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>Current Team</CardTitle>
              <CardDescription>
                  This is the current list of management team members. Members cannot be deleted from this panel.
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
                           {/* Per user request, the delete button is removed */}
                      </div>
                  ))
              )}
          </CardContent>
      </Card>

    </div>
  );
}
