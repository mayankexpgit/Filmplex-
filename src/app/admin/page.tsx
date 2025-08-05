import { Header } from '@/components/layout/header';
import ContactManager from '@/components/admin/contact-manager';
import MovieManager from '@/components/admin/movie-manager';

export default function AdminPage() {
  return (
    <div className="bg-background min-h-screen text-foreground">
      <Header />
      <main className="container mx-auto py-8 md:py-12 space-y-12">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ContactManager />
          <MovieManager />
        </div>
      </main>
    </div>
  );
}
