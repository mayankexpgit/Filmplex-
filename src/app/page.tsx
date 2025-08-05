import { HomePageClient } from '@/components/home-page-client';
import { Header } from '@/components/layout/header';

export default function Home() {
  return (
    <div className="bg-background min-h-screen text-foreground">
      <Header />
      <main>
        <HomePageClient />
      </main>
    </div>
  );
}
