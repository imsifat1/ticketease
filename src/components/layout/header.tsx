"use client";

import Link from 'next/link';
import { Bus, Ship, Hotel, Zap, Phone, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContext } from 'react';
import { AuthContext } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const Header = () => {
  const { isLoggedIn, logout, setLoginDialogOpen } = useContext(AuthContext);
  const router = useRouter();

  const handleLoginClick = () => {
    setLoginDialogOpen(true);
  };

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
          {isLoggedIn && (
            <Button asChild variant="warning">
              <Link href="/my-bookings">My Bookings</Link>
            </Button>
          )}
          {isLoggedIn ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span>My Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>User Name</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-bookings">My Tickets</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" onClick={handleLoginClick}>
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
