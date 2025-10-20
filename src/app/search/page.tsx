"use client";

import { Suspense, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { format, parse, parseISO } from 'date-fns';
import { ArrowRight, Calendar, SlidersHorizontal, User } from 'lucide-react';

import RouteList from './components/route-list';
import { mockBusRoutes } from '@/lib/mock-data';
import type { BusRoute } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import BookingSheetContent from './components/booking-sheet-content';
import { Sidebar, SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import FilterSidebar from './components/filter-sidebar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type PriceSort = 'low-to-high' | 'high-to-low' | '';
export type TimeFilter = 'early-morning' | 'morning' | 'afternoon' | 'evening' | 'night';
export type ClassFilter = 'non-ac' | 'ac-seater' | 'sleeper-ac' | 'business-ac';


function LoginDialog({ open, onOpenChange, onLoginSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, onLoginSuccess: () => void }) {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      // Reset state when dialog is closed
      setTimeout(() => {
        setStep('mobile');
        setMobileNumber('');
      }, 300);
    }
  };

  const handleSendOtp = () => {
    // In a real app, you would send an OTP here.
    if (mobileNumber) {
      setStep('otp');
    }
  };

  const handleLogin = () => {
    // In a real app, you would verify the OTP here.
    onLoginSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Login with Mobile</DialogTitle>
          <DialogDescription>
            {step === 'mobile'
              ? 'Please enter your mobile number to receive an OTP.'
              : `We've sent an OTP to ${mobileNumber}. Please enter it below.`}
          </DialogDescription>
        </DialogHeader>
        {step === 'mobile' ? (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mobile" className="text-right">
                Mobile
              </Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="+8801..."
                className="col-span-3"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </div>
            <Button onClick={handleSendOtp} className="w-full" disabled={!mobileNumber}>
              Send OTP
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="otp" className="text-right">
                OTP
              </Label>
              <Input id="otp" type="text" placeholder="123456" className="col-span-3" />
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={handleLogin} className="w-full">
                Verify & Login
              </Button>
              <Button variant="link" size="sm" onClick={() => setStep('mobile')} className="text-muted-foreground">
                Change mobile number
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


function SearchResults() {
  const searchParams = useSearchParams();
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // --- Mock Auth State ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<BusRoute | null>(null);
  // -----------------------

  // Filter states
  const [priceSort, setPriceSort] = useState<PriceSort>('');
  const [timeFilters, setTimeFilters] = useState<Set<TimeFilter>>(new Set());
  const [classFilters, setClassFilters] = useState<Set<ClassFilter>>(new Set());


  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const departureDateStr = searchParams.get('departureDate');
  const returnDateStr = searchParams.get('returnDate');

  const departureDate = departureDateStr ? parseISO(departureDateStr) : null;
  const returnDate = returnDateStr ? parseISO(returnDateStr) : null;
  
  const filteredRoutes = useMemo(() => {
    let routes: BusRoute[] = mockBusRoutes.filter(
      route => route.from.toLowerCase() === from?.toLowerCase() && route.to.toLowerCase() === to?.toLowerCase()
    );

    // Price Sort
    if (priceSort === 'low-to-high') {
      routes.sort((a, b) => a.price - b.price);
    } else if (priceSort === 'high-to-low') {
      routes.sort((a, b) => b.price - a.price);
    }

    // Time Filter
    if (timeFilters.size > 0) {
      routes = routes.filter(route => {
        const departureHour = parse(route.departureTime, 'hh:mm a', new Date()).getHours();
        return Array.from(timeFilters).some(filter => {
          if (filter === 'early-morning') return departureHour >= 4 && departureHour < 7;
          if (filter === 'morning') return departureHour >= 7 && departureHour < 12;
          if (filter === 'afternoon') return departureHour >= 12 && departureHour < 17;
          if (filter === 'evening') return departureHour >= 17 && departureHour < 21;
          if (filter === 'night') return departureHour >= 21 || departureHour < 4;
          return false;
        });
      });
    }
    
    // Class Filter
    if (classFilters.size > 0) {
      routes = routes.filter(route => classFilters.has(route.class));
    }

    return routes;
  }, [from, to, priceSort, timeFilters, classFilters]);

  const handleRouteSelect = (route: BusRoute) => {
    if (isLoggedIn) {
      setSelectedRoute(route);
      setIsSheetOpen(true);
    } else {
      setPendingRoute(route);
      setIsLoginDialogOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsLoginDialogOpen(false);
    if (pendingRoute) {
      setSelectedRoute(pendingRoute);
      setIsSheetOpen(true);
      setPendingRoute(null);
    }
  };
  
  const handleTimeFilterChange = (filter: TimeFilter) => {
    setTimeFilters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filter)) {
        newSet.delete(filter);
      } else {
        newSet.add(filter);
      }
      return newSet;
    });
  };
  
  const handleClassFilterChange = (filter: ClassFilter) => {
    setClassFilters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filter)) {
        newSet.delete(filter);
      } else {
        newSet.add(filter);
      }
      return newSet;
    });
  };

  return (
    <>
      <SidebarProvider>
      <div className="flex">
        <Sidebar collapsible="offcanvas">
           <FilterSidebar
             priceSort={priceSort}
             onPriceSortChange={setPriceSort}
             timeFilters={timeFilters}
             onTimeFilterChange={handleTimeFilterChange}
             classFilters={classFilters}
             onClassFilterChange={handleClassFilterChange}
            />
        </Sidebar>
        <SidebarInset>
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8 p-4 bg-muted rounded-lg">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xl md:text-2xl font-headline font-semibold">
                  <span className="capitalize">{from}</span>
                  <ArrowRight className="w-6 h-6 text-primary" />
                  <span className="capitalize">{to}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{departureDate ? format(departureDate, 'PPP') : 'N/A'}</span>
                  </div>
                  {returnDate && (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(returnDate, 'PPP')}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                   {isLoggedIn && (
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <User className="w-5 h-5" />
                      <span>Logged In</span>
                    </div>
                  )}
                  <div className="md:hidden">
                      <SidebarTrigger asChild>
                        <Button variant="outline">
                          <span>
                            <SlidersHorizontal className="mr-2" /> Filters
                          </span>
                        </Button>
                      </SidebarTrigger>
                  </div>
                </div>
              </div>
            </div>
            
            <RouteList routes={filteredRoutes} onSelectRoute={handleRouteSelect} />
          </div>
        </SidebarInset>
      </div>
      </SidebarProvider>

      <LoginDialog
        open={isLoginDialogOpen}
        onOpenChange={setIsLoginDialogOpen}
        onLoginSuccess={handleLoginSuccess}
      />

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl lg:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Complete Your Booking</SheetTitle>
          </SheetHeader>
          {selectedRoute && <BookingSheetContent route={selectedRoute} departureDate={departureDate} onClose={() => setIsSheetOpen(false)} />}
        </SheetContent>
      </Sheet>
    </>
  );
}

function SearchLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 p-4 bg-muted rounded-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xl md:text-2xl font-semibold">
            <Skeleton className="h-8 w-24" />
            <ArrowRight className="w-6 h-6 text-primary" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoadingSkeleton />}>
      <SearchResults />
    </Suspense>
  );
}
