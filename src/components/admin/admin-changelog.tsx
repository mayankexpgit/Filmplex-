
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { ScrollArea } from '../ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '../ui/badge';
import { CheckCircle } from 'lucide-react';

const adminChangelogData = [
   {
    version: '1.9',
    date: 'October 9, 2025',
    title: 'Admin Experience Enhancements',
    changes: [
      'Added a dedicated "What\'s New (Admin)" section to the dashboard for tracking all updates.',
      'User-facing changelog now includes a note about admin-only updates for clarity.',
      'Corrected release dates in the user changelog to reflect actual development milestones.',
    ],
  },
  {
    version: '1.8',
    date: 'October 8, 2025',
    title: 'New Features & UI Polish',
    changes: [
      'Added a "What\'s New" changelog panel for users.',
      'Added an "18+ Adult" category to genre filters.',
      'Polished movie card UI by adding correct spacing for IMDb ratings.',
      'Refined pagination to hide total page count for a cleaner look.',
      'Fixed a recurring "unique key prop" error in the admin movie list.',
    ],
  },
  {
    version: '1.7',
    date: 'July 23, 2025',
    title: 'URL-Driven Experience & Admin Analytics',
    changes: [
      'Implemented URL-based search, genre filtering, and pagination.',
      'Enhanced Admin Profile page with detailed upload analytics and task history.',
      'Admins can now view download analytics (total downloads, top movies).',
      'Added a floating task progress indicator for admins.',
    ],
  },
   {
    version: '1.6',
    date: 'July 15, 2025',
    title: 'Task Management System',
    changes: [
      'Introduced a full-featured admin task management system.',
      'Top-level admins can assign target-based or to-do-list tasks.',
      'Admins can view their active tasks and mark to-do items as complete.',
      'Task statuses (active, completed, incompleted) are updated automatically.',
    ],
  },
  {
    version: '1.5',
    date: 'May 12, 2025',
    title: 'User Interaction & Feedback',
    changes: [
      'Users can now react to movies with emojis.',
      'Added a full-featured comments section.',
      'Introduced a "Suggestions Box" for users.',
      'Enabled direct messaging to specific management members.',
    ],
  },
    {
    version: '1.4',
    date: 'May 5, 2025',
    title: 'Advanced Admin Controls',
    changes: [
      'Created the Management Team page for adding/removing admins.',
      'Implemented role-based permissions (Top-level vs. other admins).',
      'Added a Security Log to track all admin activities.',
      'Implemented AI-powered content fetching from TMDb for the upload form.',
    ],
  },
   {
    version: '1.3',
    date: 'May 1, 2025',
    title: 'Core Admin Dashboard',
    changes: [
      'Built the main Admin Dashboard with access to all management sections.',
      'Created the "Upload Movie" form with a live preview.',
      'Developed the "Movie List" page for editing and deleting content.',
      'Added "Update Featured" and "Help Center" management pages.',
    ],
  },
  {
    version: '1.2',
    date: 'April 27, 2025',
    title: 'Series Support & Enhanced UI',
    changes: [
      'Added full support for TV Series, including episodes and season downloads.',
      'Redesigned the movie detail page.',
      'Homepage carousel now autoplays.',
      'Improved the movie card layout.',
    ],
  },
   {
    version: '1.1',
    date: 'September 15, 2024',
    title: 'Backend & Store Foundation',
    changes: [
      'Set up Firebase for database management.',
      'Created a Zustand store (`movieStore`) to manage all application state.',
      'Implemented core services for fetching and updating data.',
    ],
  },
  {
    version: '1.0',
    date: 'June 20, 2024',
    title: 'Initial Launch',
    changes: [
      'FILMPLEX is live!',
      'Core features: movie browsing, searching, and downloading.',
      'Secure admin login system implemented.',
      'Basic UI layout with header and footer.',
    ],
  },
];

export default function AdminChangelog() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>What's New - Admin Changelog</CardTitle>
        <CardDescription>
          A detailed log of all features, updates, and bug fixes for the FILMPLEX
          application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh] pr-4">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="item-0"
          >
            {adminChangelogData.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>
                  <div className="flex flex-col items-start text-left">
                    <h3 className="font-semibold text-base text-foreground">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">v{item.version}</Badge>
                      <p className="text-xs text-muted-foreground">
                        {item.date}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 pl-4">
                    {item.changes.map((change, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                        <span className="text-muted-foreground">{change}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
