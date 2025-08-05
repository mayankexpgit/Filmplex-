export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-center">
        <a href="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center font-bold text-6xl">
            <span className="text-gold-metallic tracking-wider">FILMPLEX</span>
          </div>
        </a>
      </div>
    </header>
  );
}
