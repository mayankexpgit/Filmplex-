
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
    version: '1.9',
    date: 'November 4, 2025',
    title: 'Download Helper & UI Polish',
    changes: [
      '**Download Help:** Added an info icon with the message "Use vpn if not downloading" below all download link sections to proactively help users with common issues.',
      '**UI Refinements:** Small visual improvements and stability fixes for a smoother browsing experience.',
    ],
  },
  {
    version: '1.8',
    date: 'October 8, 2025',
    title: 'New Features & UI Polish',
    changes: [
      'Added a "What\'s New" changelog panel to keep you updated.',
      'Added an "18+ Adult" category to genre filters.',
      'Polished movie card UI by adding correct spacing for IMDb ratings.',
      'Refined pagination to keep the URL clean on the first page.',
    ],
  },
  {
    version: '1.7',
    date: 'July 23, 2025',
    title: 'URL-Driven Experience',
    changes: [
      'Implemented URL-based search queries (e.g., /?s=TheMatrix).',
      'Implemented URL-based genre filtering (e.g., /?genre=Action).',
      'Introduced URL-based pagination (e.g., /?page=2) for a smoother browsing experience.',
    ],
  },
  {
    version: '1.5',
    date: 'May 12, 2025',
    title: 'User Interaction & Feedback',
    changes: [
      'Users can now react to movies with emojis (Like, Love, Haha, etc.).',
      'Added a full-featured comments section on movie detail pages.',
      'Introduced a "Request Zone" for users to request new content and track its status.',
      'You can now see a list of the management team in the "Help Center".',
    ],
  },
  {
    version: '1.2',
    date: 'April 27, 2025',
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
    date: 'June 20, 2024',
    title: 'Initial Launch',
    changes: [
      'FILMPLEX is live!',
      'Core features include movie browsing, searching, and downloading.',
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
          Note: Some version updates are for admin-only features and are not listed here.
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
                      <span className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: change.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
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
