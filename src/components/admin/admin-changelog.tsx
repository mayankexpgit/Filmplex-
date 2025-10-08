
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
      'A new dedicated "What\'s New (Admin)" section has been added to the dashboard. This serves as a comprehensive log for all backend and frontend updates, ensuring the team stays informed about every change, big or small.',
      'User-facing changelog now includes a note about admin-only updates for clarity.',
      'Corrected release dates in the user changelog to reflect actual development milestones.',
    ],
  },
  {
    version: '1.8',
    date: 'October 8, 2025',
    title: 'New Features & UI Polish',
    changes: [
      'Added a "What\'s New" changelog panel for users, improving transparency and engagement.',
      'Introduced an "18+ Adult" category to genre filters for better content segmentation.',
      'Polished movie card UI by adding correct spacing for IMDb ratings, ensuring a cleaner look.',
      'Refined pagination on the homepage to hide the total page count, providing a less cluttered browsing experience.',
      'Fixed a recurring "unique key prop" error in the admin movie list for smoother performance.',
    ],
  },
  {
    version: '1.7',
    date: 'July 23, 2025',
    title: 'URL-Driven Experience & Advanced Analytics',
    changes: [
      "The entire user browsing experience is now URL-driven. This means search queries, genre filters, and page numbers are stored in the URL, allowing users to share links to specific, pre-filtered views of the content library.",
      "The Admin Profile page has been supercharged with detailed analytics. Admins can now track their upload performance (weekly, monthly, all-time), view a complete history of their past and present tasks, and monitor their progress.",
      "A new Download Analytics module allows top-level admins to view site-wide download trends over various time periods (7 days, 30 days, all-time) and identify the top 5 most downloaded movies, providing valuable insights into user engagement.",
      "A floating task progress indicator has been added. This circular widget stays visible on all admin pages, providing a constant, at-a-glance view of the current task's completion status (e.g., 5/10 uploads) and the remaining deadline.",
    ],
  },
   {
    version: '1.6',
    date: 'July 15, 2025',
    title: 'Full-Featured Task Management System',
    changes: [
      'Introduced a powerful and comprehensive task management system designed to streamline content uploading and team coordination. This system allows top-level admins to create and assign tasks to other team members, ensuring a clear workflow and accountability.',
      'Two types of tasks can be assigned: (1) Target-based tasks, where an admin must upload a specific number of movies by a deadline (e.g., "Upload 15 movies this week"), and (2) To-do list tasks, which provide a specific checklist of movies to upload.',
      'Admins can view their assigned tasks on the "My Tasks" page. For to-do lists, they can check off each movie as they upload it. Task progress is tracked automatically based on actual movie uploads with valid download links.',
      'Task statuses (active, completed, incompleted, cancelled) are updated automatically. Tasks are marked "incompleted" if the deadline passes, but can still be finished. A dialog on the dashboard keeps the current task front and center for the assigned admin.',
    ],
  },
  {
    version: '1.5',
    date: 'May 12, 2025',
    title: 'User Interaction & Feedback System',
    changes: [
      'Users can now react to movies with a set of emojis (Like, Love, Haha, Wow, Sad, Angry), providing a quick and easy way to share their feelings about the content. All reactions are tallied and displayed on the movie page.',
      'A full-featured comments section has been integrated. Users can post comments on any movie page, and admins have the ability to view and delete any comment from the "Manage Comments" section in the admin panel.',
      'A "Suggestions Box" has been added, allowing users to request specific movies or series they\'d like to see on the platform. These suggestions are visible to admins for review.',
      'Enabled direct messaging to specific management members. Users can now select an admin from the "Contact Management" list and send them a private message, which appears in the same Suggestions Box but is marked with the recipient\'s name.',
    ],
  },
    {
    version: '1.4',
    date: 'May 5, 2025',
    title: 'Advanced Admin Controls & AI Integration',
    changes: [
      'Created the "Management Team" page, where top-level admins can add or remove team members and assign specific roles. This feature is protected by a management key for security.',
      'Implemented a role-based permission system. "Regulator" and "Co-Founder" roles have top-level access, including the ability to manage the team and assign tasks, while other roles have more limited permissions.',
      'Added a "Security Log" to track all important admin activities, such as movie uploads, deletions, and user management changes. This provides a transparent audit trail for all administrative actions.',
      'Integrated AI-powered content fetching. When uploading a movie, admins can now search for a title, and the system uses the TMDb API and a Genkit AI flow to automatically fill in most of the form fields, including synopsis, cast, and poster URL, saving significant time.',
    ],
  },
   {
    version: '1.3',
    date: 'May 1, 2025',
    title: 'Core Admin Dashboard',
    changes: [
      'Built the main Admin Dashboard, which serves as the central hub for all content management activities. It provides quick access to all key sections of the admin panel.',
      'Created the "Upload Movie" form, featuring a live preview pane that shows how the movie page will look to the user as the admin fills in the details. This improves accuracy and reduces the need for post-upload edits.',
      'Developed the "Movie List" page, allowing admins to view, search, edit, and delete any content in the database. This page also allows toggling a movie\'s "featured" status.',
      'Added "Update Featured" and "Help Center" management pages. Admins can now easily change the posters on the homepage carousel and update all contact links for the site.',
    ],
  },
  {
    version: '1.2',
    date: 'April 27, 2025',
    title: 'Series Support & Enhanced UI',
    changes: [
      'Added full support for TV Series. The system can now handle individual episodes with their own download links, as well as separate download links for the full season.',
      'Redesigned the movie detail page for a more modern and informative layout.',
      'The homepage carousel now autoplays to create a more dynamic and engaging user experience.',
      'Improved the movie card layout to display more information, such as IMDb rating and language.',
    ],
  },
   {
    version: '1.1',
    date: 'September 15, 2024',
    title: 'Backend & Store Foundation',
    changes: [
      'Set up Firebase Firestore as the primary database for managing all application data, including movies, user comments, and admin information.',
      'Created a centralized Zustand store (`movieStore`) to manage all application state. This ensures data consistency across all components and simplifies data flow.',
      'Implemented core services for fetching data from and writing data to Firebase, laying the groundwork for all future features.',
    ],
  },
  {
    version: '1.0',
    date: 'June 20, 2024',
    title: 'Initial Launch',
    changes: [
      'FILMPLEX is live! The initial version of the website is deployed and accessible.',
      'Core features include browsing the movie catalog, searching for specific titles, and accessing download links for movies.',
      'A secure admin login system has been implemented to protect the administrative sections of the site.',
      'The basic UI layout, including the header, footer, and homepage structure, is in place.',
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
