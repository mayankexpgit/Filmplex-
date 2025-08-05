export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-center">
        <a href="/" className="flex items-center gap-2">
          <div className="text-3xl font-bold flex items-center">
            <span className="text-4xl text-gold-metallic">F</span>
            <span className="text-3xl text-gold-metallic tracking-tighter scale-y-110">ILMPLE</span>
            <span className="text-4xl text-gold-metallic">X</span>
          </div>
        </a>
      </div>
    </header>
  );
}
