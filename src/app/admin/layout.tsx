
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutDashboard, LogOut, UserCircle, Loader2 } from 'lucide-react';
import { useMovieStore, fetchInitialData } from '@/store/movieStore';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import FilmpilexLoader from '@/components/ui/filmplex-loader';
import { useToast } from '@/hooks/use-toast';
import FloatingTaskButton from '@/components/admin/floating-task-button';
import CoinAnimation from '@/components/admin/coin-animation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isInitialized } = useMovieStore();
  const { isAuthenticated, isLoading, logout, adminProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isIconLoading, setIsIconLoading] = useState(true);


  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  useEffect(() => {
    if (isAuthenticated && !isInitialized) {
      // Fetch all data, including admin-specific data like suggestions
      fetchInitialData(true);
    }
  }, [isAuthenticated, isInitialized]);

  // If we are on the login page, let it render without the layout shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }


  if (isLoading || !isAuthenticated || !isInitialized) {
    return (
      <div className="bg-background min-h-screen text-foreground flex items-center justify-center">
        <FilmpilexLoader />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen text-foreground">
      <CoinAnimation />
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
             <LayoutDashboard className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold uppercase text-primary">ADMIN DASHBOARD</h1>
          </div>
          <div className="flex items-center gap-4">
             <Button variant="outline" asChild id="admin-wallet-button" className="gap-2">
              <Link href="/admin/profile">
                 {isIconLoading && <Loader2 className="h-6 w-6 animate-spin" />}
                 <Image 
                    src="https://i.ibb.co/fYspK9Nf/1000496834-removebg-preview.png" 
                    alt="Wallet" 
                    width={24} 
                    height={24} 
                    onLoad={() => setIsIconLoading(false)}
                    className={isIconLoading ? 'hidden' : 'inline'}
                  />
                <span className="font-bold">{adminProfile?.wallet?.total?.toFixed(2) || '0.00'}</span>
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/profile">
                <UserCircle className="mr-2 h-4 w-4" />
                My Profile
              </Link>
            </Button>
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
      <main className="relative">
        {children}
        <FloatingTaskButton />
      </main>
    </div>
  );
}
