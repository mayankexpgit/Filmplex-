'use client';

import { useState, useTransition } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMovieStore, updateAdminTask } from '@/store/movieStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Hourglass, ListChecks, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FilmpilexLoader from '../ui/filmplex-loader';

export default function MyTasks() {
  const { adminProfile, isLoading } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const todoTasks = adminProfile?.tasks?.filter(task => task.type === 'todo' && task.status === 'active') || [];

  const handleTodoItemToggle = (taskId: string, itemIndex: number, completed: boolean) => {
    startTransition(async () => {
        try {
            await updateAdminTask(adminProfile!.id, taskId, itemIndex, completed);
            toast({
                title: 'Task Updated',
                description: 'Your to-do list has been updated.',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Could not update the task. Please try again.',
            });
        }
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><FilmpilexLoader /></div>;
  }
  
  if (todoTasks.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>My To-Do Tasks</CardTitle>
                <CardDescription>A list of movies you need to upload.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center py-16 text-muted-foreground">
                    <CheckCircle className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-medium">All Clear!</h3>
                    <p className="mt-1 text-sm">You have no active to-do list tasks.</p>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My To-Do Tasks</CardTitle>
        <CardDescription>A list of movies you need to upload. Check them off as you complete them.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full" defaultValue={`item-${todoTasks[0].id}`}>
          {todoTasks.map(task => (
            <AccordionItem key={task.id} value={`item-${task.id}`}>
              <AccordionTrigger>
                <div className="flex justify-between items-center w-full pr-4">
                    <span>{task.title}</span>
                    <div className="flex items-center gap-2">
                        <Badge variant={task.items?.every(i => i.completed) ? 'success' : 'default'}>
                            {task.items?.filter(i => i.completed).length}/{task.items?.length} Completed
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                           <Hourglass className="h-3 w-3"/>
                           <span>{format(parseISO(task.deadline), 'PP')}</span>
                        </div>
                    </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2 pl-4">
                    {task.items?.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3">
                            <Checkbox
                                id={`task-${task.id}-item-${index}`}
                                checked={item.completed}
                                onCheckedChange={(checked) => handleTodoItemToggle(task.id!, index, !!checked)}
                                disabled={isPending}
                            />
                            <Label 
                                htmlFor={`task-${task.id}-item-${index}`}
                                className={cn("text-base", item.completed && "line-through text-muted-foreground")}
                            >
                                {item.text}
                            </Label>
                        </div>
                    ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
