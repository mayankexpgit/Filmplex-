
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutDashboard, LogOut } from 'lucide-react';
import { useMovieStore, fetchAdminData } from '@/store/movieStore';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isInitialized } = useMovieStore();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && !isInitialized) {
      fetchAdminData();
    }
  }, [isAuthenticated, isInitialized]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="bg-background min-h-screen text-foreground flex items-center justify-center">
        <div className="space-y-8 max-w-4xl w-full p-4">
          <CardSkeleton />
          <CardSkeleton withTable />
        </div>
      </div>
    );
  }


  return (
    <div className="bg-background min-h-screen text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
             <LayoutDashboard className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold uppercase text-primary">ADMIN DASHBOARD</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Site
              </Link>
            </Button>
             <Button variant="destructive" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main>
        {!isInitialized ? (
          <div className="container mx-auto py-8 md:py-12">
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
