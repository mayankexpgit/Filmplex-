
'use client';

import { useState, useTransition, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMovieStore, addManagementMember, deleteManagementMember as storeDeleteManagementMember, updateManagementMemberTask, removeManagementMemberTask, checkAndUpdateOverdueTasks } from '@/store/movieStore';
import { Loader2, PlusCircle, User, Trash2, KeyRound, Lock, Unlock, Calendar as CalendarIcon, Briefcase, TrendingUp, CheckCircle, XCircle, AlertCircle, History, Archive } from 'lucide-react';
import type { ManagementMember, AdminTask, Movie } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format, addWeeks, setHours, setMinutes, setSeconds, isWithinInterval, startOfWeek, parseISO, isAfter, startOfDay } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

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

const isUploadCompleted = (movie: Movie): boolean => {
    if (movie.contentType === 'movie') {
        return !!movie.downloadLinks && movie.downloadLinks.some(link => link && link.url);
    }
    if (movie.contentType === 'series') {
        const hasEpisodeLinks = movie.episodes && movie.episodes.some(ep => ep.downloadLinks.some(link => link && link.url));
        const hasSeasonLinks = movie.seasonDownloadLinks && movie.seasonDownloadLinks.some(link => link && link.url);
        return !!(hasEpisodeLinks || hasSeasonLinks);
    }
    return false;
};

// Performance calculation logic
const calculatePerformanceScore = (admin: ManagementMember, allMovies: Movie[]): number => {
    
    let taskScore = 0;
    if (admin.pastTasks && admin.pastTasks.length > 0) {
        const lastTask = admin.pastTasks[admin.pastTasks.length - 1];
         if (lastTask.status === 'completed') {
            taskScore = 6;
        } else if (lastTask.status === 'incompleted') {
            taskScore = -4;
        }
    } else if (admin.task?.status === 'completed') {
        taskScore = 6;
    } else if (admin.task?.status === 'incompleted') {
        taskScore = -4;
    }

    const completedAdminMovies = allMovies
        .filter(movie => movie.uploadedBy === admin.name)
        .filter(isUploadCompleted);
    
    const totalUploadsScore = Math.min(3, (completedAdminMovies.length / 50) * 3);

    const now = new Date();
    const lastWeekMovies = completedAdminMovies.filter(m => m.createdAt && isWithinInterval(new Date(m.createdAt), { start: startOfWeek(now, { weekStartsOn: 1 }), end: now }));
    const recentActivityScore = Math.min(1, (lastWeekMovies.length / 5) * 1);

    const finalScore = taskScore + totalUploadsScore + recentActivityScore;
    return Math.max(0, Math.min(10, Math.round(finalScore * 10) / 10));
};

const TaskStatusBadge = ({ task }: { task?: AdminTask }) => {
    if (!task) return <Badge variant="secondary">No Task</Badge>;

    switch(task.status) {
        case 'active':
            return <Badge variant="default"><AlertCircle className="mr-1 h-3 w-3" />Active</Badge>;
        case 'completed':
            return <Badge variant="success"><CheckCircle className="mr-1 h-3 w-3" />Completed</Badge>;
        case 'incompleted':
            return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Incompleted</Badge>;
        case 'cancelled':
            return <Badge variant="outline"><Archive className="mr-1 h-3 w-3" />Cancelled</Badge>;
        default:
            return <Badge variant="secondary">No Task</Badge>;
    }
};

function TaskHistoryDialog({ member, onTaskSet, onTaskRemove }: { member: ManagementMember; onTaskSet: (id: string, task: AdminTask) => void; onTaskRemove: (id: string) => void; }) {
    const { toast } = useToast();
    const [targetUploads, setTargetUploads] = useState<number>(member.task?.targetUploads || 10);
    const [deadline, setDeadline] = useState<Date | undefined>(member.task?.deadline ? new Date(member.task.deadline) : undefined);
    const [isSetPending, startSetTransition] = useTransition();
    const [isRemovePending, startRemoveTransition] = useTransition();
    
    const handleSaveTask = () => {
        if (!deadline || !targetUploads) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please set a target and a deadline.' });
            return;
        }
        if (isAfter(new Date(), deadline)) {
            toast({ variant: 'destructive', title: 'Invalid Date', description: 'Deadline must be in the future.' });
            return;
        }
        const task: AdminTask = {
            targetUploads,
            deadline: deadline.toISOString(),
            startDate: new Date().toISOString(),
            status: 'active',
        };
        startSetTransition(() => onTaskSet(member.id, task));
    }

    const handleRemoveTask = () => {
        startRemoveTransition(() => onTaskRemove(member.id));
    }
    
    const sortedPastTasks = [...(member.pastTasks || [])].sort((a,b) => parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime());

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Task History & Management for {member.name.split('.').pop()}</DialogTitle>
                <DialogDescription>View past performance and manage the current task.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[60vh]">
                {/* Left Side: Set/Update Task */}
                <div className="space-y-4 p-4 border rounded-lg">
                     <h3 className="font-semibold text-lg">{member.task ? 'Update Active Task' : 'Set New Task'}</h3>
                    <div className="space-y-2">
                        <Label htmlFor="target-uploads">Target Uploads</Label>
                        <Input id="target-uploads" type="number" value={targetUploads} onChange={e => setTargetUploads(Number(e.target.value))} min="1" />
                    </div>
                    <div className="space-y-2">
                        <Label>Deadline</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal', !deadline && 'text-muted-foreground')}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {deadline ? format(deadline, 'PPP') : <span>Pick a date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={deadline} onSelect={setDeadline} initialFocus /></PopoverContent>
                        </Popover>
                    </div>
                    <Button onClick={handleSaveTask} disabled={isSetPending} className="w-full">
                        {isSetPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {member.task ? 'Update Task' : 'Set Task'}
                    </Button>
                     {member.task && (
                        <Button variant="destructive" onClick={handleRemoveTask} disabled={isRemovePending} className="w-full">
                            {isRemovePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Remove Active Task
                        </Button>
                    )}
                </div>

                {/* Right Side: Task History */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><History className="h-5 w-5"/> Task Log</h3>
                    <ScrollArea className="h-[45vh] pr-4">
                        <div className="space-y-3">
                             {member.task && (
                                <div className="p-3 bg-secondary rounded-lg border-l-4 border-primary">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold">Active Task</p>
                                        <TaskStatusBadge task={member.task} />
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">Target: {member.task.targetUploads} uploads by {format(parseISO(member.task.deadline), 'PP')}</p>
                                </div>
                            )}
                            {sortedPastTasks.length > 0 ? sortedPastTasks.map((task, index) => (
                                <div key={index} className="p-3 bg-secondary/50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold">{format(parseISO(task.startDate), 'PP')} - {task.endDate ? format(parseISO(task.endDate), 'PP') : 'N/A'}</p>
                                        <TaskStatusBadge task={task} />
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">Target: {task.targetUploads} | Completed: {task.completedUploads ?? 0}</p>
                                </div>
                            )) : (
                               !member.task && <p className="text-center text-muted-foreground py-10">No task history for this member.</p>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}

export default function ManagementManager() {
  const { toast } = useToast();
  const [addPending, startAddTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const { managementTeam, allMovies } = useMovieStore(state => ({
      managementTeam: state.managementTeam,
      allMovies: state.allMovies
  }));
  const { adminProfile } = useAuth();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ManagementMember | null>(null);

  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const [managementKey, setManagementKey] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  const canManageTeam = adminProfile && topLevelRoles.includes(adminProfile.info);

  useEffect(() => {
    // This effect will run once when the component mounts, or when `allMovies` changes.
    // It checks for any overdue tasks and updates their status in the database.
    const checkTasks = async () => {
        const updated = await checkAndUpdateOverdueTasks();
        if (updated) {
            toast({
                title: "Tasks Updated",
                description: "Overdue task statuses have been automatically updated.",
            });
        }
    };
    if (canManageTeam && managementTeam.length > 0 && allMovies.length > 0) {
        checkTasks();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManageTeam, managementTeam, allMovies]);

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
        await addManagementMember(newMember);
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
            description: 'You can now add or remove team members.',
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

  const handleTaskRemove = async (memberId: string) => {
    try {
        await removeManagementMemberTask(memberId);
        toast({
            title: 'Task Removed!',
            description: 'The task has been successfully removed.',
        });
        setIsTaskDialogOpen(false);
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Database Error',
            description: 'Could not remove the task.',
        });
    }
  }

  const isFormDisabled = addPending || !isUnlocked || !canManageTeam;

  const getPerformanceBadgeVariant = (score: number): "destructive" | "secondary" | "success" => {
    if (score < 4) return "destructive";
    if (score < 7.5) return "secondary";
    return "success";
  }

  return (
    <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Add New Team Member</CardTitle>
            <CardDescription>
              Add or remove members. Requires the management key to be unlocked. Each role can only be assigned once.
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
                disabled={isFormDisabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-role">Role</Label>
               <Select value={selectedRole} onValueChange={setSelectedRole} disabled={isFormDisabled}>
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
            <Button onClick={handleAddMember} disabled={isFormDisabled || availableRoles.length === 0}>
              {addPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              {addPending ? 'Adding...' : 'Add Member'}
            </Button>
            {!canManageTeam && <p className="text-xs text-destructive mt-2">You do not have permission to manage the team.</p>}
            {canManageTeam && !isUnlocked && <p className="text-xs text-muted-foreground mt-2">Unlock controls below to add or remove members.</p>}
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Current Team</CardTitle>
                <CardDescription>
                    This is the current list of management team members with their performance score and task status.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {sortedTeam.length === 0 ? (
                    <p className="text-muted-foreground text-center">No team members added yet.</p>
                ) : (
                    sortedTeam.map(member => {
                        const performanceScore = calculatePerformanceScore(member, allMovies);
                        return (
                            <div key={member.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                                <div className="flex items-center gap-4">
                                <User className="h-6 w-6 text-primary" />
                                <div>
                                    <p className="font-semibold">{member.name}</p>
                                    <p className="text-sm text-muted-foreground">{member.info}</p>
                                </div>
                                </div>
                                <div className="flex items-center gap-2">
                                <TaskStatusBadge task={member.task} />
                                <Badge variant={getPerformanceBadgeVariant(performanceScore)} className="flex items-center gap-1.5">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    <span>{performanceScore.toFixed(1)} / 10</span>
                                </Badge>
                                {canManageTeam && (
                                    <Button 
                                    variant="outline" 
                                    size="icon" 
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
                        )
                    })
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
                        <Label htmlFor="management-key" className="text-xs text-muted-foreground">Unlock Add/Remove Controls</Label>
                        <div className="flex gap-2">
                            <Input 
                                id="management-key" 
                                type="password"
                                placeholder="Enter management key..."
                                value={managementKey}
                                onChange={(e) => setManagementKey(e.target.value)}
                            />
                            <Button variant="outline" onClick={handleUnlock}>
                                <Unlock className="mr-2 h-4 w-4" />
                                Unlock
                            </Button>
                        </div>
                    </div>
                )}
              </CardFooter>
            )}
        </Card>

      </div>
      {selectedMember && <TaskHistoryDialog member={selectedMember} onTaskSet={handleTaskSet} onTaskRemove={handleTaskRemove} />}
    </Dialog>
  );
}
