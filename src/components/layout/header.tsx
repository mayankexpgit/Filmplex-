import { Menu, Search, Clapperboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
          <a href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <Clapperboard className="h-8 w-8 text-red-600 -rotate-12" />
            <span className='italic'>HDHub4u</span>
          </a>
        </div>
        <div className="flex-1 flex justify-center px-4">
          <div className="w-full max-w-md">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search here..."
                className="w-full rounded-full bg-input pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                 <Search className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
