
import { HomePageClient } from '@/components/home-page-client';
import { Header } from '@/components/layout/header';
import { Suspense } from 'react';
import FilmpilexLoader from '@/components/ui/filmplex-loader';

function HomePageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-background">
        <FilmpilexLoader />
    </div>
  );
}

export default function Home() {
  return (
    <div className="bg-background min-h-screen text-foreground">
      <Header />
      <main>
        <Suspense fallback={<HomePageLoader />}>
          <HomePageClient />
        </Suspense>
      </main>
    </div>
  );
}
