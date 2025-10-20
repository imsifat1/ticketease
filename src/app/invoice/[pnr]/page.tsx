'use client';

import React, { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import QRCode from 'react-qr-code';
import { Bus, Calendar, Clock, Armchair, User, Phone, Printer, ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { mockBookings } from '@/lib/mock-data';

// This would typically be a more complex type from a DB
type BookingDetails = any;

const TicketDetails = ({ booking }: { booking: BookingDetails }) => {
  if (!booking) return null;
  
  const qrValue = JSON.stringify({
    pnr: booking.pnr,
    name: booking.contactName,
    from: booking.route.from,
    to: booking.route.to,
    date: booking.departureDate,
  });

  return (
    <Card className="max-w-3xl mx-auto printable-ticket" id="printable-ticket">
        <CardHeader className="bg-primary text-primary-foreground p-4 flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-2xl font-bold">Shohoz Yatra</CardTitle>
                <p className="text-sm">Your e-Ticket</p>
            </div>
            <Bus className="w-8 h-8"/>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-primary">{booking.route.operator}</h3>
                    <p className="text-muted-foreground">{booking.route.class}</p>
                    <div className="flex items-center gap-2 mt-2 font-semibold text-lg">
                        <span className="capitalize">{booking.route.from}</span> &rarr; <span className="capitalize">{booking.route.to}</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">PNR Number</p>
                    <p className="font-mono text-lg font-bold">{booking.pnr}</p>
                </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-semibold">Journey Date</p>
                        <p>{format(parseISO(booking.departureDate), 'EEE, dd MMM yyyy')}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-semibold">Departure Time</p>
                        <p>{booking.route.departureTime}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <Bus className="w-5 h-5 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-semibold">Pickup Point</p>
                        <p className="capitalize">{booking.pickupPoint}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <Armchair className="w-5 h-5 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-semibold">Seat(s)</p>
                        <p className="font-bold">{booking.selectedSeats.join(', ')}</p>
                    </div>
                </div>
            </div>

            <Separator />
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-semibold mb-2">Passenger Details</h4>
                    <div className="flex items-start gap-3 mb-2">
                        <User className="w-5 h-5 text-muted-foreground mt-1" />
                        <div>
                            <p className="font-bold">{booking.contactName}</p>
                            <p className="text-sm text-muted-foreground">Primary Passenger</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-muted-foreground mt-1" />
                        <div>
                            <p>{booking.contactMobile}</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                    <div className="bg-white p-2 rounded-md border">
                        <QRCode value={qrValue} size={128} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Scan this QR code at the counter</p>
                </div>
             </div>

        </CardContent>
        <CardFooter className="bg-muted/50 p-4 flex justify-between items-center">
             <div>
                <p className="text-sm text-muted-foreground">Total Fare</p>
                <p className="font-bold text-xl text-primary">BDT {booking.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <p className="text-xs text-muted-foreground">Wishing you a safe and pleasant journey!</p>
        </CardFooter>
    </Card>
  );
}

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { pnr } = params;

  useEffect(() => {
    if (typeof pnr !== 'string') {
      notFound();
      return;
    }

    let foundBooking = null;
    const bookingDataString = sessionStorage.getItem(`booking-${pnr}`);
    if (bookingDataString) {
      foundBooking = JSON.parse(bookingDataString);
    } else {
      // If not in session storage, try finding it in the mock data
      // This makes the "My Bookings" view details link work on hard refresh
      foundBooking = mockBookings.find(b => b.pnr === pnr);
    }

    if (foundBooking) {
      setBooking(foundBooking);
    } else {
      notFound();
    }
    
    setLoading(false);
  }, [pnr]);

  const handlePrint = () => {
    window.print();
  };
  
  if (loading) {
      return (
          <div className="container mx-auto px-4 py-8">
              <Skeleton className="max-w-3xl mx-auto h-[700px]" />
          </div>
      )
  }

  if (!booking) {
    // notFound will be called by the effect, but this is a fallback.
    return null;
  }

  return (
    <div className="bg-muted min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto mb-4 flex justify-between items-center no-print">
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2" /> Back
            </Button>
            <Button onClick={handlePrint}>
                <Printer className="mr-2" />
                Print Ticket
            </Button>
        </div>
        <TicketDetails booking={booking} />
      </div>
    </div>
  );
}
