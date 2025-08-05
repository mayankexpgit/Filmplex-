
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '../ui/scroll-area';

const logs = [
  { id: 1, admin: 'admin_john', action: 'Uploaded Movie: "Chrono Rift"', timestamp: '2024-07-28 10:00 AM' },
  { id: 2, admin: 'admin_jane', action: 'Updated Contact Info', timestamp: '2024-07-28 09:30 AM' },
  { id: 3, admin: 'admin_john', action: 'Deleted Suggestion ID: 15', timestamp: '2024-07-27 05:00 PM' },
  { id: 4, admin: 'admin_jane', action: 'Sent Notification: "New Horror Movies Added"', timestamp: '2024-07-27 02:15 PM' },
];

export default function SecurityLog() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Log</CardTitle>
        <CardDescription>Track of all admin activities.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.admin}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{log.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
