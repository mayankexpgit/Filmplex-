import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-6 w-6" />
              <span className="sr-only">Settings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>Admin panel</DropdownMenuItem>
            <DropdownMenuItem>Contact</DropdownMenuItem>
            <DropdownMenuItem>Suggestion</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <a href="/" className="flex items-center gap-2">
          <div className="text-5xl font-bold flex items-center">
            <span className="text-6xl text-primary">F</span>
            <span className="text-5xl text-primary tracking-tighter scale-y-110">
              ILMPLE
            </span>
            <span className="text-6xl text-primary">X</span>
          </div>
        </a>

        {/* Empty div for spacing to keep logo centered */}
        <div className="w-10" />
      </div>
    </header>
  );
}
