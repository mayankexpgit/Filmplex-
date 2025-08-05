import { Header } from '@/components/layout/header';
import ContactManager from '@/components/admin/contact-manager';
import UploadMovie from '@/components/admin/upload-movie';
import MovieNotification from '@/components/admin/movie-notification';
import SuggestionsBox from '@/components/admin/suggestions-box';
import SecurityLog from '@/components/admin/security-log';

export default function AdminPage() {
  return (
    <div className="bg-background min-h-screen text-foreground">
      <Header />
      <main className="container mx-auto py-8 md:py-12 space-y-12">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <UploadMovie />
          <ContactManager />
          <MovieNotification />
          <SuggestionsBox />
          <SecurityLog />
        </div>
      </main>
    </div>
  );
}
