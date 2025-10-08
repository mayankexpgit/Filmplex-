'use client';

import { useState, useTransition, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMovieStore, addManagementMember, deleteManagementMember as storeDeleteManagementMember, updateManagementMemberTask, removeManagementMemberTask, checkAndUpdateOverdueTasks } from '@/store/movieStore';
import { Loader2, PlusCircle, User, Trash2, KeyRound, Lock, Unlock, Calendar as CalendarIcon, Briefcase, TrendingUp, CheckCircle, XCircle, AlertCircle, History, Archive, ListChecks, Target, X, Eye } from 'lucide-react';
import type { ManagementMember, AdminTask, Movie, TodoItem } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format, parseISO, isAfter } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';

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

// Performance calculation logic - remains unchanged
const calculatePerformanceScore = (admin: ManagementMember, allMovies: Movie[]): number => {
    
    const targetTasks = admin.tasks?.filter(t => t.type === 'target') || [];
    let taskScore = 0;
    if (targetTasks.length > 0) {
        const lastTask = targetTasks[targetTasks.length-1];
        if (lastTask.status === 'completed') taskScore = 6;
        else if (lastTask.status === 'incompleted') taskScore = -4;
    }

    const completedAdminMovies = allMovies
        .filter(movie => movie.uploadedBy === admin.name)
        .filter(isUploadCompleted);
    
    const totalUploadsScore = Math.min(3, (completedAdminMovies.length / 50) * 3);

    const now = new Date();
    const lastWeekMovies = completedAdminMovies.filter(m => m.createdAt && isAfter(parseISO(m.createdAt), new Date(now.setDate(now.getDate() - 7))));
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

const getTaskProgress = (task: AdminTask, allMovies: Movie[], adminName: string) => {
    if (task.type === 'target') {
        const taskStartDate = parseISO(task.startDate);
        const completedMoviesForTask = allMovies
            .filter(movie => movie.uploadedBy === adminName && movie.createdAt && isAfter(parseISO(movie.createdAt), taskStartDate))
            .filter(isUploadCompleted);
        
        return {
            completed: completedMoviesForTask.length,
            target: task.target || 0,
            progress: task.target ? (completedMoviesForTask.length / task.target) * 100 : 0
        };
    }
    if (task.type === 'todo') {
        const completedCount = task.items?.filter(item => item.completed).length || 0;
        const totalCount = task.items?.length || 0;
        return {
            completed: completedCount,
            target: totalCount,
            progress: totalCount > 0 ? (completedCount / totalCount) * 100 : 0
        };
    }
    return { completed: 0, target: 0, progress: 0 };
};

function TaskDetailsDialog({ task, allMovies, adminName, onClose }: { task: AdminTask, allMovies: Movie[], adminName: string, onClose: () => void }) {
    const { completed, target, progress } = getTaskProgress(task, allMovies, adminName);
    
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Task Details: {task.title}</DialogTitle>
                    <DialogDescription>
                        <span className="capitalize">{task.type} Task</span> assigned to {adminName.split('.').pop()}.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    {task.type === 'target' ? (
                        <div className="space-y-4">
                            <h3 className="font-semibold">Task Progress</h3>
                            <Progress value={progress} className="h-4" />
                            <p className="text-center text-lg font-semibold">
                                {completed} / {target}
                                <span className="text-muted-foreground"> uploads completed</span>
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                             <h3 className="font-semibold">To-Do List Progress</h3>
                             <ScrollArea className="h-[250px] pr-4">
                                <ul className="space-y-2">
                                    {(task.items || []).map((item, index) => (
                                        <li key={index} className="flex items-center gap-3">
                                            {item.completed ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                                            <span className={cn(item.completed && "line-through text-muted-foreground")}>{item.text}</span>
                                        </li>
                                    ))}
                                </ul>
                             </ScrollArea>
                        </div>
                    )}
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function TaskHistoryDialog({ member, allMovies, onTaskSet, onTaskRemove, onClose }: { member: ManagementMember; allMovies: Movie[], onTaskSet: (memberId: string, task: Omit<AdminTask, 'id' | 'status' | 'startDate'>) => void; onTaskRemove: (memberId: string, taskId: string) => void; onClose: () => void }) {
    const { toast } = useToast();
    const [title, setTitle] = useState('');
    const [deadline, setDeadline] = useState<Date | undefined>();
    const [taskType, setTaskType] = useState<'target' | 'todo'>('target');
    const [targetUploads, setTargetUploads] = useState<number>(10);
    const [todoList, setTodoList] = useState('');
    const [isSetPending, startSetTransition] = useTransition();
    const [viewingTask, setViewingTask] = useState<AdminTask | null>(null);

    const hasUnfinishedTask = member.tasks?.some(t => t.status === 'active' || t.status === 'incompleted');

    const handleSaveTask = () => {
        if (!deadline || !title) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please set a title and a deadline.' });
            return;
        }
        if (isAfter(new Date(), deadline)) {
            toast({ variant: 'destructive', title: 'Invalid Date', description: 'Deadline must be in the future.' });
            return;
        }
        
        let taskData: Omit<AdminTask, 'id' | 'status' | 'startDate'>;

        if (taskType === 'target') {
            if (!targetUploads || targetUploads < 1) {
                 toast({ variant: 'destructive', title: 'Error', description: 'Target uploads must be at least 1.' });
                 return;
            }
            taskData = {
                title,
                type: 'target',
                target: targetUploads,
                deadline: deadline.toISOString(),
            };
        } else { // todo
            const items = todoList.split('\n').filter(item => item.trim() !== '').map(item => ({ text: item.trim(), completed: false }));
             if (items.length === 0) {
                 toast({ variant: 'destructive', title: 'Error', description: 'Please add at least one item to the to-do list.' });
                 return;
            }
            taskData = {
                title,
                type: 'todo',
                items: items,
                deadline: deadline.toISOString(),
            };
        }
        
        startSetTransition(() => onTaskSet(member.id, taskData));
    }

    const sortedTasks = [...(member.tasks || [])].sort((a,b) => parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime());

    return (
        <>
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Task History & Management for {member.name.split('.').pop()}</DialogTitle>
                <DialogDescription>View past performance and assign a new task.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg">Assign New Task</h3>
                    
                    {hasUnfinishedTask ? (
                         <div className="text-center py-10 px-4 bg-amber-900/20 text-amber-400 border border-amber-500/30 rounded-lg">
                            <AlertCircle className="mx-auto h-10 w-10" />
                            <h4 className="mt-2 font-semibold">Task in Progress</h4>
                            <p className="text-sm text-amber-300">This admin has an active or incompleted task. A new task cannot be assigned until the current one is completed or cancelled.</p>
                        </div>
                    ) : (
                    <>
                        <div className="space-y-2">
                            <Label>Task Type</Label>
                            <RadioGroup defaultValue="target" value={taskType} onValueChange={(v: 'target'|'todo') => setTaskType(v)} className="flex gap-4">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="target" id="r-target" /><Label htmlFor="r-target">Target Based</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="todo" id="r-todo" /><Label htmlFor="r-todo">To-do List</Label></div>
                            </RadioGroup>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="task-title">Task Title</Label>
                            <Input id="task-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Weekly Uploads" />
                        </div>

                        {taskType === 'target' ? (
                            <div className="space-y-2">
                                <Label htmlFor="target-uploads">Target Uploads</Label>
                                <Input id="target-uploads" type="number" value={targetUploads} onChange={e => setTargetUploads(Number(e.target.value))} min="1" />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="todo-list">Movie To-Do List (one per line)</Label>
                                <Textarea id="todo-list" value={todoList} onChange={e => setTodoList(e.target.value)} placeholder="The Matrix&#10;Inception&#10;Interstellar" rows={5}/>
                            </div>
                        )}

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
                            Set Task
                        </Button>
                    </>
                    )}
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><History className="h-5 w-5"/> Task Log</h3>
                    <ScrollArea className="h-[45vh] pr-4">
                        <div className="space-y-3">
                            {sortedTasks.length > 0 ? sortedTasks.map((task) => (
                                <div key={task.id} className="p-3 bg-secondary/50 rounded-lg">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <p className="font-semibold">{task.title}</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {format(parseISO(task.startDate), 'PP')} - {task.endDate ? format(parseISO(task.endDate), 'PP') : 'Ongoing'}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                            <TaskStatusBadge task={task} />
                                             <div className="flex gap-1">
                                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setViewingTask(task)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {(task.status === 'active' || task.status === 'incompleted') && (
                                                    <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => onTaskRemove(member.id, task.id)} disabled={isSetPending}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-muted-foreground py-10">No task history for this member.</p>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onClose}>Close</Button>
            </DialogFooter>
        </DialogContent>

        {viewingTask && <TaskDetailsDialog task={viewingTask} allMovies={allMovies} adminName={member.name} onClose={() => setViewingTask(null)} />}
        </>
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
    const checkTasks = async () => {
        const updated = await checkAndUpdateOverdueTasks(managementTeam, allMovies);
        if (updated) {
            console.log("Overdue task statuses have been automatically updated.");
        }
    };
    if (canManageTeam && managementTeam.length > 0 && allMovies.length > 0) {
        checkTasks();
    }
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
        tasks: [],
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

  const handleTaskSet = useCallback(async (memberId: string, task: Omit<AdminTask, 'id' | 'status' | 'startDate'>) => {
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
  }, [toast]);

  const handleTaskRemove = useCallback(async (memberId: string, taskId: string) => {
    try {
        await removeManagementMemberTask(memberId, taskId);
        toast({
            title: 'Task Cancelled!',
            description: 'The active task has been successfully cancelled.',
        });
        // We need to refetch the member to update the dialog, or close it.
        // For simplicity, let's close it.
        const updatedMember = useMovieStore.getState().managementTeam.find(m => m.id === memberId);
        if (updatedMember) {
            setSelectedMember(updatedMember);
        } else {
            setIsTaskDialogOpen(false);
        }
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Database Error',
            description: 'Could not remove the task.',
        });
    }
  }, [toast]);

  const handleOpenTaskDialog = (member: ManagementMember) => {
    setSelectedMember(member);
    setIsTaskDialogOpen(true);
  }

  const handleCloseTaskDialog = () => {
    setIsTaskDialogOpen(false);
    setSelectedMember(null);
  }

  const isFormDisabled = addPending || !isUnlocked || !canManageTeam;

  const getPerformanceBadgeVariant = (score: number): "destructive" | "secondary" | "success" => {
    if (score < 4) return "destructive";
    if (score < 7.5) return "secondary";
    return "success";
  }

  return (
    <>
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
                        const activeTasks = member.tasks?.filter(t => t.status === 'active' || t.status === 'incompleted') || [];
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
                                <Badge variant={getPerformanceBadgeVariant(performanceScore)} className="flex items-center gap-1.5">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    <span>{performanceScore.toFixed(1)} / 10</span>
                                </Badge>
                                <Badge variant={activeTasks.length > 0 ? 'destructive' : 'success'} className="flex items-center gap-1.5">
                                    {activeTasks.length > 0 ? <AlertCircle className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                                    <span>{activeTasks.length} Active Task(s)</span>
                                </Badge>
                                {canManageTeam && (
                                    <Button 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={() => handleOpenTaskDialog(member)}
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
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        {selectedMember && <TaskHistoryDialog member={selectedMember} allMovies={allMovies} onTaskSet={handleTaskSet} onTaskRemove={handleTaskRemove} onClose={handleCloseTaskDialog} />}
      </Dialog>
    </>
  );
}
