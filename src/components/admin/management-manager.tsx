
'use client';

import { useState, useTransition, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMovieStore, addManagementMember, deleteManagementMember as storeDeleteManagementMember, updateManagementMemberTask } from '@/store/movieStore';
import { Loader2, PlusCircle, User, Trash2, KeyRound, Lock, Unlock, Calendar as CalendarIcon, Briefcase } from 'lucide-react';
import type { ManagementMember, AdminTask } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format, addWeeks, setHours, setMinutes, setSeconds } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';

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
const topLevelRoles = ['Regulator', 'Co-Founder'];

function TaskManagerDialog({ member, onTaskSet }: { member: ManagementMember; onTaskSet: (id: string, task: AdminTask) => void; }) {
    const [targetUploads, setTargetUploads] = useState<number>(member.task?.targetUploads || 10);
    const [timeframe, setTimeframe] = useState<'daily' | 'weekly'>(member.task?.timeframe || 'weekly');
    const [deadline, setDeadline] = useState<Date | undefined>(member.task?.deadline ? new Date(member.task.deadline) : undefined);
    const [isPending, startTransition] = useTransition();

    const handleSetDefaultDeadline = (selectedTimeframe: 'daily' | 'weekly') => {
        const now = new Date();
        const endOfDay = setSeconds(setMinutes(setHours(now, 23), 59), 59);
        if (selectedTimeframe === 'daily') {
            setDeadline(endOfDay);
        } else {
            setDeadline(addWeeks(endOfDay, 1));
        }
    }

    const handleTimeframeChange = (value: 'daily' | 'weekly') => {
        setTimeframe(value);
        if(!deadline) { // Only set default if no deadline is set
            handleSetDefaultDeadline(value);
        }
    }
    
    const handleSaveTask = () => {
        if (!deadline || !targetUploads) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please set a target and a deadline.',
            });
            return;
        }
        const task: AdminTask = {
            targetUploads,
            timeframe,
            deadline: deadline.toISOString(),
        };
        startTransition(() => {
            onTaskSet(member.id, task);
        });
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Set Task for {member.name.split('.').pop()}</DialogTitle>
                <DialogDescription>Assign an upload target and deadline for this team member.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="target-uploads">Target Uploads</Label>
                    <Input 
                        id="target-uploads" 
                        type="number" 
                        value={targetUploads} 
                        onChange={e => setTargetUploads(Number(e.target.value))}
                        min="1"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="timeframe">Timeframe</Label>
                    <Select value={timeframe} onValueChange={handleTimeframeChange}>
                        <SelectTrigger id="timeframe">
                            <SelectValue placeholder="Select timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Deadline</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={'outline'}
                            className={cn( 'w-full justify-start text-left font-normal', !deadline && 'text-muted-foreground' )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {deadline ? format(deadline, 'PPP') : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={deadline} onSelect={setDeadline} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button onClick={handleSaveTask} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Set Task
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}

export default function ManagementManager() {
  const { toast } = useToast();
  const [addPending, startAddTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const managementTeam = useMovieStore((state) => state.managementTeam);
  const { adminProfile } = useAuth();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ManagementMember | null>(null);

  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const [managementKey, setManagementKey] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  const canManageTeam = adminProfile && topLevelRoles.includes(adminProfile.info);

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

  const handleTaskSet = async (memberId: string, task: AdminTask) => {
    try {
        await updateManagementMemberTask(memberId, task);
        toast({
            title: 'Task Set!',
            description: 'The task has been successfully assigned.',
        });
        setIsTaskDialogOpen(false);
    } catch (error) {
         toast({
            variant: 'destructive',
            title: 'Database Error',
            description: 'Could not set the task.',
        });
    }
  }


  return (
    <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
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
                disabled={addPending || !canManageTeam}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-role">Role</Label>
               <Select value={selectedRole} onValueChange={setSelectedRole} disabled={addPending || !canManageTeam}>
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
            <Button onClick={handleAddMember} disabled={addPending || availableRoles.length === 0 || !canManageTeam}>
              {addPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              {addPending ? 'Adding...' : 'Add Member'}
            </Button>
            {!canManageTeam && <p className="text-xs text-destructive mt-2">You do not have permission to add members.</p>}
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Current Team</CardTitle>
                <CardDescription>
                    This is the current list of management team members.
                    {canManageTeam ? " Deletion and task assignment requires a management key." : ""}
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
                            <div className="flex gap-2">
                              {canManageTeam && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => {setSelectedMember(member); setIsTaskDialogOpen(true)}}
                                >
                                    <Briefcase className="h-4 w-4" />
                                </Button>
                              )}
                              {isUnlocked && canManageTeam && (
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
                        </div>
                    ))
                )}
            </CardContent>
            {canManageTeam && (
              <CardFooter className="bg-secondary/50 p-4 border-t">
                {isUnlocked ? (
                    <div className='w-full text-center'>
                        <Button variant="ghost" onClick={() => setIsUnlocked(false)}><Lock className="mr-2 h-4 w-4" /> Lock Controls</Button>
                    </div>
                ) : (
                    <div className="w-full space-y-2">
                        <Label htmlFor="management-key" className="text-xs text-muted-foreground">Unlock Deletion Controls</Label>
                        <div className="flex gap-2">
                            <Input 
                                id="management-key" 
                                type="password"
                                placeholder="Enter management key to delete members..."
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
            )}
        </Card>

      </div>
      {selectedMember && <TaskManagerDialog member={selectedMember} onTaskSet={handleTaskSet} />}
    </Dialog>
  );
}
