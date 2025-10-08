
'use client';

import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from './ui/badge';
import { CheckCircle } from 'lucide-react';

const changelogData = [
  {
    version: '1.8',
    date: 'July 28, 2024',
    title: 'Advanced Admin Controls & UI Polish',
    changes: [
      'Added a "What\'s New" changelog panel for users.',
      'Fixed a bug where the movie list would crash due to incorrect key props.',
      'Refined pagination URL logic to keep the base URL clean for page 1.',
      'Added an "18+ Adult" category to genre filters.',
      'Polished movie card UI by adding correct spacing for IMDb ratings.',
      'Resolved a critical "fetchInitialData is not defined" error.',
    ],
  },
  {
    version: '1.7',
    date: 'July 27, 2024',
    title: 'URL-Driven Experience',
    changes: [
      'Implemented URL-based search queries (e.g., /?s=TheMatrix).',
      'Implemented URL-based genre filtering (e.g., /?genre=Action).',
      'Introduced URL-based pagination (e.g., /?page=2) for a smoother browsing experience.',
      'Fixed a visual bug with a duplicate "Close" button in the admin task dialog.',
    ],
  },
  {
    version: '1.6',
    date: 'July 26, 2024',
    title: 'AI-Powered Content & Admin UX',
    changes: [
      'Introduced AI-powered movie detail fetching from TMDb.',
      'Streamlined the movie upload form with an AI "Auto-fill" feature.',
      'Enhanced admin profile page with download analytics charts.',
      'Added a floating task progress button for admins for quick access.',
    ],
  },
  {
    version: '1.5',
    date: 'July 25, 2024',
    title: 'Task Management System',
    changes: [
      'Launched a complete task management system for the admin team.',
      'Admins can now view and manage target-based and to-do list tasks.',
      'Added a "My Tasks" page for admins to track their personal assignments.',
      'Implemented automatic status updates for overdue or completed tasks.',
    ],
  },
  {
    version: '1.4',
    date: 'July 24, 2024',
    title: 'User Interaction & Feedback',
    changes: [
      'Users can now react to movies with emojis (Like, Love, Haha, etc.).',
      'Added a full-featured comments section on movie detail pages.',
      'Introduced a "Suggestions Box" for users to request new content.',
      'Admins can now manage all comments and reactions from the dashboard.',
    ],
  },
  {
    version: '1.3',
    date: 'July 23, 2024',
    title: 'Admin Dashboard V2',
    changes: [
      'Redesigned the admin dashboard for better navigation.',
      'Added a Management Team page to add/remove admins and assign roles.',
      'Introduced a Security Log to track all admin activities.',
      'Created a Help Center management page to update contact links.',
    ],
  },
  {
    version: '1.2',
    date: 'July 22, 2024',
    title: 'Series Support & Enhanced UI',
    changes: [
      'Added full support for TV Series, including episodes and season downloads.',
      'Redesigned the movie detail page to be more informative and visually appealing.',
      'Homepage carousel now autoplays for a more dynamic feel.',
      'Improved the movie card layout to show more info.',
    ],
  },
  {
    version: '1.0',
    date: 'July 20, 2024',
    title: 'Initial Launch',
    changes: [
      'FILMPLEX is live!',
      'Core features include movie browsing, searching, and downloading.',
      'Basic admin panel for uploading and managing movies.',
      'Secure admin login system implemented.',
    ],
  },
];

export default function Changelog() {
  return (
    <>
      <SheetHeader>
        <SheetTitle>What's New in FILMPLEX</SheetTitle>
        <SheetDescription>
          Check out the latest features, bug fixes, and improvements we've made.
        </SheetDescription>
      </SheetHeader>
      <ScrollArea className="h-[calc(100%-4rem)] pr-4 mt-4">
        <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
          {changelogData.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>
                <div className="flex flex-col items-start text-left">
                  <h3 className="font-semibold text-base text-foreground">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">v{item.version}</Badge>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
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
    </>
  );
}
