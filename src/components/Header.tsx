
"use client";

import Link from "next/link";
import { Bus, LogOut, Ticket, UserCog, Building, Route, TrendingUp, XCircle, MessageSquareWarning } from "lucide-react";
import { useUser } from "@/firebase/auth/use-user";
import { useAuthSheet } from "@/hooks/use-auth-sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { signOut } from "firebase/auth";
import { useAuth } from "@/firebase";
import { useAdmin } from "@/hooks/use-admin";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

export function Header() {
  const { user, loading: userLoading } = useUser();
  const { open } = useAuthSheet();
  const auth = useAuth();
  const { admin: adminUser, logout: adminLogout, loading: adminStateLoading } = useAdmin();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const isAdmin = !!adminUser;
  const loading = !isClient || userLoading || adminStateLoading;

  const handleSignOut = async () => {
    if (isClient) {
        // Handle demo user logout
        if (user?.uid === 'demo-user-uid') {
            localStorage.removeItem('demo-user');
             if (typeof window !== 'undefined') {
                document.dispatchEvent(new CustomEvent('demo-user-update', { detail: { currentUser: null } }));
            }
        } 
        // Handle regular firebase user logout
        else if (auth) {
            await signOut(auth);
        }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <Bus className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold font-headline tracking-tight">
            TicketEase
          </span>
        </Link>

        {/* Right: Nav + Buttons */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" asChild>
            <Link href="/bus-operators">
              <Building className="mr-2 h-4 w-4" />
              Bus Operators
            </Link>
          </Button>

          {/* Admin Panel */}
          {loading ? (
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          ) : isClient && isAdmin ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/admin">
                  <UserCog className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/admin/bookings">
                  <Ticket className="mr-2 h-4 w-4" />
                  All Bookings
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/admin/trips">
                  <Route className="mr-2 h-4 w-4" />
                  Manage Trips
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/admin/reports">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Income Reports
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={adminLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Admin Log Out
              </Button>
            </>
          ) : null}

          {/* User Avatar / Login */}
          {loading ? (
            <Skeleton className="h-9 w-9 rounded-full" />
          ) : isClient && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all">
                  <AvatarImage
                    src={user.photoURL || undefined}
                    alt={user.displayName || "User"}
                  />
                  <AvatarFallback>
                    {user.displayName
                      ? user.displayName.charAt(0).toUpperCase()
                      : (user.phoneNumber || "U").slice(-4, -3)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user.displayName || user.phoneNumber}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/my-bookings">
                    <Ticket className="mr-2 h-4 w-4" />
                    My Bookings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/cancel-ticket">
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Ticket
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/complaints">
                    <MessageSquareWarning className="mr-2 h-4 w-4" />
                    Complaints
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : isClient && !isAdmin ? (
            <Button onClick={() => open()}>Login</Button>
          ) : null}
        </div>
      </div>
    </header>


  );
}
