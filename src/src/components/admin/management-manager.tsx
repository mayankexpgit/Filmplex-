
'use client';

import { useState, useTransition, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMovieStore, addManagementMember, deleteManagementMember as storeDeleteManagementMember } from '@/store/movieStore';
import { Loader2, PlusCircle, User, Trash2, KeyRound, Lock, Unlock } from 'lucide-react';
import type { ManagementMember } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '../ui/separator';

const adminRoles = [
    'Regulator',
    'Admin',
    'Co-Founder',
    'Moderator',
    'Uploader',
    'Content Manager',
    'Support Head'
];

const MANAGEMENT_KEY = 'Manager29@role';

export default function ManagementManager() {
  const { toast } = useToast();
  const [addPending, startAddTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const managementTeam = useMovieStore((state) => state.managementTeam);

  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const [managementKey, setManagementKey] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  const sortedTeam = useMemo(() => {
    return [...managementTeam].sort((a, b) => {
        if (a.timestamp && b.timestamp) {
            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        }
        return 0;
    });
  }, [managementTeam]);

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
    
    const newMember: Omit<ManagementMember, 'id' | 'timestamp'> = {
        name,
        info: selectedRole,
    };

    startAddTransition(async () => {
      try {
        await addManagementMember(newMember as any);
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

  const handleUnlock = () => {
    if (managementKey === MANAGEMENT_KEY) {
        setIsUnlocked(true);
        toast({
            title: 'Controls Unlocked',
            description: 'You can now delete team members.',
        });
    } else {
        toast({
            variant: 'destructive',
            title: 'Incorrect Key',
            description: 'The management key you entered is wrong.',
        });
    }
  }

  const handleDeleteMember = (id: string, memberName: string) => {
    startDeleteTransition(async () => {
        try {
            await storeDeleteManagementMember(id);
            toast({
                title: 'Member Removed',
                description: `Team member "${memberName}" has been deleted.`,
            });
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Database Error',
                description: 'Could not remove the team member.',
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
              disabled={addPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="member-role">Role</Label>
             <Select value={selectedRole} onValueChange={setSelectedRole} disabled={addPending}>
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
          <Button onClick={handleAddMember} disabled={addPending || availableRoles.length === 0}>
            {addPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            {addPending ? 'Adding...' : 'Add Member'}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>Current Team</CardTitle>
              <CardDescription>
                  This is the current list of management team members. Deletion requires a management key.
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              {sortedTeam.length === 0 ? (
                  <p className="text-muted-foreground text-center">No team members added yet.</p>
              ) : (
                  sortedTeam.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                          <div className="flex items-center gap-4">
                            <User className="h-6 w-6 text-primary" />
                            <div>
                                <p className="font-semibold">{member.name}</p>
                                <p className="text-sm text-muted-foreground">{member.info}</p>
                            </div>
                          </div>
                           {isUnlocked && (
                             <Button 
                                variant="destructive" 
                                size="icon" 
                                onClick={() => handleDeleteMember(member.id, member.name)}
                                disabled={deletePending}
                             >
                                <Trash2 className="h-4 w-4" />
                             </Button>
                           )}
                      </div>
                  ))
              )}
          </CardContent>
          <CardFooter className="bg-secondary/50 p-4 border-t">
            {isUnlocked ? (
                 <div className='w-full text-center'>
                    <Button variant="ghost" onClick={() => setIsUnlocked(false)}><Lock className="mr-2 h-4 w-4" /> Lock Controls</Button>
                 </div>
            ) : (
                <div className="w-full space-y-2">
                    <Label htmlFor="management-key" className="text-xs text-muted-foreground">Unlock Controls</Label>
                    <div className="flex gap-2">
                        <Input 
                            id="management-key" 
                            type="password"
                            placeholder="Enter management key..."
                            value={managementKey}
                            onChange={(e) => setManagementKey(e.target.value)}
                        />
                        <Button variant="outline" onClick={handleUnlock}>
                            <KeyRound className="mr-2 h-4 w-4" />
                            Unlock
                        </Button>
                    </div>
                </div>
            )}
          </CardFooter>
      </Card>

    </div>
  );
}
