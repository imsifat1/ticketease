'use client';

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
} from "@/components/ui/alert-dialog"


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
        // Store in session storage to make sure the invoice page can find it,
        // especially if it's not in the static mockBookings array (e.g. a new booking).
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
  const [cancelAlertOpen, setCancelAlertOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  const handleOpenCancelDialog = (pnr: string) => {
    setBookingToCancel(pnr);
    setCancelAlertOpen(true);
  }

  const handleConfirmCancel = () => {
    if (bookingToCancel) {
      setBookings(currentBookings =>
        currentBookings.map(b =>
          b.pnr === bookingToCancel ? { ...b, status: 'Canceled' } : b
        )
      );
    }
    setCancelAlertOpen(false);
    setBookingToCancel(null);
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
        
        <AlertDialog open={cancelAlertOpen} onOpenChange={setCancelAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently cancel your booking. 
                Refunds are subject to the operator's policy.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Back</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmCancel} className={cn(buttonVariants({ variant: "destructive" }))}>
                Confirm Cancellation
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

    </div>
  );
}
