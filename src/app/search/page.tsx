"use client";

import { Suspense, useState, useMemo, useTransition, useContext, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { format, parse, parseISO } from 'date-fns';
import { ArrowRight, Calendar, SlidersHorizontal, User, Loader2 } from 'lucide-react';

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
import { useToast } from '@/hooks/use-toast';
import { sendOtp } from '@/ai/flows/send-otp-flow';
import { AuthContext } from '@/context/auth-context';

export type PriceSort = 'low-to-high' | 'high-to-low' | '';
export type TimeFilter = 'early-morning' | 'morning' | 'afternoon' | 'evening' | 'night';
export type ClassFilter = 'non-ac' | 'ac-seater' | 'sleeper-ac' | 'business-ac';


function LoginDialog({ open, onOpenChange, onLoginSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, onLoginSuccess: () => void }) {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  const isDevMode = !process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID.startsWith('ACxxx');

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      // Reset state when dialog is closed
      setTimeout(() => {
        setStep('mobile');
        setMobileNumber('');
        setOtp('');
        setGeneratedOtp('');
      }, 300);
    }
  };

  const handleSendOtp = () => {
    const mobileRegex = /^01[0-9]{9}$/;
    if (!mobileRegex.test(mobileNumber)) {
      toast({
        title: 'Invalid Mobile Number',
        description: 'Please enter a valid 11-digit Bangladeshi mobile number starting with 01.',
        variant: 'destructive',
      });
      return;
    }
    
    startTransition(async () => {
        // Generate a 6-digit OTP
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(newOtp);

        // Twilio expects E.164 format, so we'll prepend +88
        const formattedNumber = `+88${mobileNumber}`;

        const result = await sendOtp({ to: formattedNumber, otp: newOtp });

        if (result.success) {
            toast({
                title: 'OTP Sent',
                description: 'An OTP has been sent to your mobile number.',
            });
            setStep('otp');
        } else {
            toast({
                title: 'Failed to Send OTP',
                description: result.error || 'Please try again later.',
                variant: 'destructive',
            });
        }
    });
  };

  const handleLogin = () => {
    // In a real app, you would verify the OTP here against a server-side value.
    // For now, we'll just check against the one we "sent".
    if (otp === generatedOtp) {
        onLoginSuccess();
    } else {
        toast({
            title: 'Invalid OTP',
            description: 'The OTP you entered is incorrect. Please try again.',
            variant: 'destructive',
        });
    }
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
                placeholder="01..."
                className="col-span-3"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                maxLength={11}
              />
            </div>
            <Button onClick={handleSendOtp} className="w-full" disabled={!mobileNumber || isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : 'Send OTP'}
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="otp" className="text-right">
                OTP
              </Label>
              <Input 
                id="otp" 
                type="text" 
                placeholder="123456" 
                className="col-span-3"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
            </div>
             {isDevMode && generatedOtp && (
              <div className="text-center text-sm text-muted-foreground bg-muted p-2 rounded-md">
                Demo OTP: <span className="font-bold text-foreground">{generatedOtp}</span>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Button onClick={handleLogin} className="w-full" disabled={!otp || isPending}>
                 {isPending ? <Loader2 className="animate-spin" /> : 'Verify & Login'}
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
  
  const { isLoggedIn, login, isLoginDialogOpen, setLoginDialogOpen } = useContext(AuthContext);
  const [pendingRoute, setPendingRoute] = useState<BusRoute | null>(null);
  const { toast } = useToast();

  // Filter states
  const [priceSort, setPriceSort] = useState<PriceSort>('');
  const [timeFilters, setTimeFilters] = useState<Set<TimeFilter>>(new Set());
  const [classFilters, setClassFilters] = useState<Set<ClassFilter>>(new Set());

  // Check for login query param on initial render
  useEffect(() => {
    if (searchParams.get('login') === 'true') {
      if (!isLoggedIn) {
        setLoginDialogOpen(true);
      }
    }
  }, [searchParams, isLoggedIn, setLoginDialogOpen]);


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
      setLoginDialogOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    login(); // Use context login function
    toast({
      title: 'Login Successful!',
      description: 'You can now proceed with your booking.',
    });
    setLoginDialogOpen(false);
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
        onOpenChange={setLoginDialogOpen}
        onLoginSuccess={handleLoginSuccess}
      />

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl lg:max-w-4xl overflow-y-auto">
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
