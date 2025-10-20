import Link from 'next/link';
import { Bus } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline text-primary">
          <Bus className="w-7 h-7" />
          <span>Shohoz Yatra</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="#" className="text-foreground/80 hover:text-primary transition-colors">
            My Bookings
          </Link>
          <Link href="#" className="text-foreground/80 hover:text-primary transition-colors">
            Help
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
