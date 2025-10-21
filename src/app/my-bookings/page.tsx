'use client';

import React, { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Ticket,
  CircleCheckBig,
  CircleX,
  TriangleAlert,
  RefreshCw,
  Bus,
  ArrowRight,
  Calendar,
  Clock,
  Armchair,
  Loader2,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Booking } from '@/lib/types';
import { mockBookings as initialBookings } from '@/lib/mock-data';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { sendOtp } from '@/ai/flows/send-otp-flow';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';


type BookingStatus = 'Booked' | 'Paid' | 'Canceled' | 'Expired' | 'Reissued';

const filterOptions: { label: BookingStatus | 'All'; icon: React.ElementType }[] = [
  { label: 'All', icon: Ticket },
  { label: 'Booked', icon: Ticket },
  { label: 'Paid', icon: CircleCheckBig },
  { label: 'Canceled', icon: CircleX },
  { label: 'Expired', icon: TriangleAlert },
  { label: 'Reissued', icon: RefreshCw },
];

const statusColors: Record<BookingStatus, string> = {
    Booked: 'bg-blue-100 text-blue-800 border-blue-300',
    Paid: 'bg-green-100 text-green-800 border-green-300',
    Canceled: 'bg-red-100 text-red-800 border-red-300',
    Expired: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Reissued: 'bg-purple-100 text-purple-800 border-purple-300',
};


const BookingCard = ({ booking, onCancel }: { booking: Booking, onCancel: (pnr: string) => void; }) => {
    const router = useRouter();

    const handleViewDetails = () => {
        sessionStorage.setItem(`booking-${booking.pnr}`, JSON.stringify(booking));
        router.push(`/invoice/${booking.pnr}`);
    }

    const canCancel = booking.status === 'Booked' || booking.status === 'Paid';

    return (
      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between bg-muted/50 p-4">
          <div className="flex flex-col">
            <p className="text-sm text-muted-foreground">PNR Number</p>
            <p className="font-bold text-lg">{booking.pnr}</p>
          </div>
           <Badge className={cn("text-sm", statusColors[booking.status as BookingStatus])}>
            {booking.status}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
            <div>
                <p className="font-bold text-primary text-xl">{booking.route.operator}</p>
                <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <span className="capitalize">{booking.route.from}</span>
                    <ArrowRight className="w-5 h-5 text-primary" />
                    <span className="capitalize">{booking.route.to}</span>
                </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">Journey Date</p>
                        <p>{new Date(booking.departureDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">Departure</p>
                        <p>{booking.route.departureTime}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <Bus className="w-4 h-4 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">Pickup Point</p>
                        <p>{booking.pickupPoint}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <Armchair className="w-4 h-4 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">Seats</p>
                        <p>{booking.selectedSeats.join(', ')}</p>
                    </div>
                </div>
            </div>
        </CardContent>
        <CardFooter className="bg-muted/50 p-4 flex justify-between items-center">
            <div>
                <p className="text-sm text-muted-foreground">Total Fare</p>
                <p className="font-bold text-xl text-primary">BDT {booking.totalAmount.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2">
                {canCancel && (
                    <Button variant="destructive" onClick={() => onCancel(booking.pnr)}>Cancel Booking</Button>
                )}
                <Button onClick={handleViewDetails}>View Details</Button>
            </div>
        </CardFooter>
      </Card>
    )
};

export default function MyBookingsPage() {
  const [activeFilter, setActiveFilter] = useState<BookingStatus | 'All'>('All');
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancelStep, setCancelStep] = useState<'initial' | 'otp'>('initial');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  const isDevMode = !process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID.startsWith('ACxxx');

  const handleOpenCancelDialog = (pnr: string) => {
    const booking = bookings.find(b => b.pnr === pnr);
    if (booking) {
      setBookingToCancel(booking);
      setCancelDialogOpen(true);
      setCancelStep('initial');
      setOtp('');
      setGeneratedOtp('');
    }
  }

  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setTimeout(() => {
        setBookingToCancel(null);
        setCancelStep('initial');
        setOtp('');
        setGeneratedOtp('');
    }, 300);
  }

  const handleSendCancelOtp = () => {
    if (!bookingToCancel) return;

    startTransition(async () => {
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(newOtp);

        const formattedNumber = `+88${bookingToCancel.contactMobile}`;

        const result = await sendOtp({ to: formattedNumber, otp: newOtp });

        if (result.success) {
            toast({
                title: 'OTP Sent',
                description: `An OTP has been sent to ${bookingToCancel.contactMobile}.`,
            });
            setCancelStep('otp');
        } else {
            toast({
                title: 'Failed to Send OTP',
                description: result.error || 'Please try again later.',
                variant: 'destructive',
            });
        }
    });
  }

  const handleConfirmCancel = () => {
    if (otp !== generatedOtp) {
      toast({
        title: 'Invalid OTP',
        description: 'The OTP you entered is incorrect.',
        variant: 'destructive',
      });
      return;
    }
    
    if (bookingToCancel) {
      setBookings(currentBookings =>
        currentBookings.map(b =>
          b.pnr === bookingToCancel.pnr ? { ...b, status: 'Canceled' } : b
        )
      );
      toast({
        title: 'Booking Canceled',
        description: 'Your refund will be processed within 7 working days.',
      });
    }
    handleCloseCancelDialog();
  }

  const filteredBookings = useMemo(() => {
    if (activeFilter === 'All') {
      return bookings;
    }
    return bookings.filter((booking) => booking.status === activeFilter);
  }, [activeFilter, bookings]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Filter Bookings</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 flex flex-wrap gap-2">
          {filterOptions.map(({ label, icon: Icon }) => (
            <Button
              key={label}
              variant={activeFilter === label ? 'default' : 'outline'}
              className={cn("gap-2", activeFilter !== label && "border-muted-foreground/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground")}
              onClick={() => setActiveFilter(label as BookingStatus | 'All')}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}
        </CardContent>
      </Card>

        <div className="mt-8 grid grid-cols-1 gap-6">
            {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                    <BookingCard key={booking.pnr} booking={booking} onCancel={handleOpenCancelDialog} />
                ))
            ) : (
                <div className="text-center py-16 col-span-full">
                    <h2 className="text-2xl font-semibold mb-2">No Bookings Found</h2>
                    <p className="text-muted-foreground">
                        You have no bookings with the status "{activeFilter}".
                    </p>
                </div>
            )}
        </div>
        
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <DialogContent className="sm:max-w-md">
                 {cancelStep === 'initial' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Confirm Cancellation</DialogTitle>
                            <DialogDescription>
                                An OTP will be sent to your registered mobile number ({bookingToCancel?.contactMobile}) to confirm the cancellation. Refunds are subject to the operator's policy.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={handleCloseCancelDialog}>Back</Button>
                            <Button variant="destructive" onClick={handleSendCancelOtp} disabled={isPending}>
                                {isPending ? <Loader2 className="animate-spin" /> : 'Send OTP'}
                            </Button>
                        </DialogFooter>
                    </>
                 )}
                 {cancelStep === 'otp' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Enter OTP to Cancel</DialogTitle>
                            <DialogDescription>
                                Please enter the 6-digit OTP sent to your mobile number.
                            </DialogDescription>
                        </DialogHeader>
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
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCancelStep('initial')}>Back</Button>
                             <Button onClick={handleConfirmCancel} className={cn(buttonVariants({ variant: "destructive" }))}>
                                Confirm Cancellation
                            </Button>
                        </DialogFooter>
                    </>
                 )}
            </DialogContent>
        </Dialog>
    </div>
  );
}

    