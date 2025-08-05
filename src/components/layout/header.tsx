import { Clapperboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <Clapperboard className="h-8 w-8 text-primary" />
            <span className='font-bold text-foreground'>FILMPLEX</span>
          </a>
          <Separator orientation="vertical" className="h-6" />
          <nav className="hidden md:flex items-center gap-4">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Movies</Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">TV Shows</Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Animations</Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
