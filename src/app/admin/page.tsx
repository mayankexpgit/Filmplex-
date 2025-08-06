
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, MessageCircle, Bell, User, Shield, Flame, List, LifeBuoy } from 'lucide-react';

const adminSections = [
  {
    title: 'Upload Movie',
    description: 'Add new movies to the catalog.',
    href: '/admin/upload-movie',
    icon: Upload,
  },
  {
    title: 'Movie List',
    description: 'Edit, view, and manage all movies.',
    href: '/admin/movie-list',
    icon: List,
  },
  {
    title: 'Update Featured Movies',
    description: 'Update posters for the featured carousel.',
    href: '/admin/update-featured',
    icon: Flame,
  },
  {
    title: 'Help Center',
    description: 'Update contact links and details.',
    href: '/admin/help-center',
    icon: LifeBuoy,
  },
  {
    title: 'Movie Notification',
    description: 'Send notifications to users about new movies.',
    href: '/admin/movie-notification',
    icon: Bell,
  },
  {
    title: 'Suggestions Box',
    description: 'View user suggestions and requests.',
    href: '/admin/suggestions-box',
    icon: MessageCircle,
  },
  {
    title: 'Security Log',
    description: 'Track all admin activities.',
    href: '/admin/security-log',
    icon: Shield,
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {adminSections.map((section) => (
          <Link href={section.href} key={section.title} className="group">
            <Card className="h-full hover:border-primary transition-[transform,border-color] duration-300 ease-in-out transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center gap-4">
                <section.icon className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
