import Link from 'next/link';
import { Bus, Ship, Hotel, Zap, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline text-primary">
          <Bus className="w-7 h-7" />
          <span>Shohoz Yatra</span>
        </Link>
        
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors">
            <Bus className="w-5 h-5" />
            <span>Bus</span>
          </Link>
          <Link href="#" className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors">
            <Ship className="w-5 h-5" />
            <span>Ship</span>
          </Link>
          <Link href="#" className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors">
            <Hotel className="w-5 h-5" />
            <span>Hotel</span>
          </Link>
          <Link href="#" className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors">
            <Zap className="w-5 h-5" />
            <span>Flash Deals</span>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
           <Button variant="destructive">
            <Phone className="w-4 h-4 mr-2" />
            Hotline: 16374
          </Button>
          <Button variant="warning">
            My Bookings
          </Button>
          <Button variant="outline">
            Login
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
