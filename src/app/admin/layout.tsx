
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useMovieStore, fetchAdminData } from '@/store/movieStore';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isInitialized } = useMovieStore();

  useEffect(() => {
    // Fetch all data required for the admin section when the layout mounts.
    if (!isInitialized) {
      fetchAdminData();
    }
  }, [isInitialized]);

  return (
    <div className="bg-background min-h-screen text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <h1 className="text-3xl font-bold uppercase text-foreground">ADMIN DASHBOARD</h1>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Site
            </Link>
          </Button>
        </div>
      </header>
      <main>
        {!isInitialized ? (
          <div className="container mx-auto py-8 md:py-12">
            {/* A generic loading skeleton for the entire admin section */}
            <div className="space-y-8 max-w-4xl mx-auto">
              <CardSkeleton />
              <CardSkeleton withTable />
            </div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}

const CardSkeleton = ({ withTable = false }) => (
  <div className="space-y-4 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-4 w-3/4" />
    <div className="space-y-4 pt-4">
      {withTable ? (
        <>
          <div className="flex justify-between">
            <Skeleton className="h-10 w-1/3" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-10 w-28" />
        </>
      )}
    </div>
  </div>
);
