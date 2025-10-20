"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Armchair, X, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BusRoute } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SeatSelectionProps {
  route: BusRoute;
}

export default function SeatSelection({ route }: SeatSelectionProps) {
  const router = useRouter();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);

  const handleSeatClick = (seatId: string, isBooked: boolean) => {
    if (isBooked) return;

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  };

  const totalPrice = selectedSeats.length * route.price;

  const handleConfirmBooking = () => {
    // In a real app, this would involve a payment gateway
    setIsBookingConfirmed(true);
  };

  const Seat = ({ id }: { id: string }) => {
    const isBooked = route.seatLayout.booked.includes(id);
    const isSelected = selectedSeats.includes(id);
    const status = isBooked ? 'booked' : isSelected ? 'selected' : 'available';

    return (
      <button
        key={id}
        onClick={() => handleSeatClick(id, isBooked)}
        disabled={isBooked}
        className={cn(
          "flex flex-col items-center justify-center rounded-md border-2 transition-colors w-12 h-14",
          {
            'bg-muted border-gray-300 cursor-not-allowed': status === 'booked',
            'bg-background hover:bg-accent border-gray-400': status === 'available',
            'bg-primary text-primary-foreground border-primary-dark': status === 'selected',
          }
        )}
        aria-label={`Seat ${id}, ${status}`}
      >
        <Armchair className="w-6 h-6" />
        <span className="text-xs font-semibold">{id}</span>
        {isBooked && <X className="absolute w-8 h-8 text-destructive/50" />}
      </button>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Select Your Seats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border-2 bg-background border-gray-400" /> Available</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-primary border-2 border-primary" /> Selected</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-muted border-2 border-gray-300" /> Booked</div>
          </div>
          
          <div className="bg-muted/50 p-4 md:p-8 rounded-lg flex justify-center">
            <div className="grid grid-cols-5 gap-2 md:gap-4" style={{gridTemplateColumns: 'repeat(5, auto)'}}>
              {route.seatLayout.rows.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  {row.map((seatId, seatIndex) => (
                    <div
                      key={seatId}
                      className={cn(
                        'flex items-center justify-center',
                        seatIndex === 1 && 'mr-4 md:mr-8'
                      )}
                    >
                      {seatId === '' ? <div className="w-12 h-14" /> : <Seat id={seatId} />}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <p className="text-sm text-muted-foreground">Selected Seats:</p>
            <p className="font-bold text-lg">{selectedSeats.join(', ') || 'None'}</p>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground text-right">Total Price</p>
              <p className="font-bold text-2xl text-primary">BDT {totalPrice.toLocaleString()}</p>
            </div>
            <Button size="lg" disabled={selectedSeats.length === 0} onClick={handleConfirmBooking}>
              Confirm Booking
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      <AlertDialog open={isBookingConfirmed}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Booking Successful!</AlertDialogTitle>
            <AlertDialogDescription>
              Your tickets for {selectedSeats.join(', ')} have been confirmed. An e-ticket has been sent to your email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => router.push('/')}>
              Done
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
