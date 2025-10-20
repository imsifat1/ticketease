"use client";

import React, { useState } from 'react';
import { Armchair, X, BusFront } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BusRoute } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface BookingSheetContentProps {
  route: BusRoute;
  onClose: () => void;
}

export default function BookingSheetContent({ route, onClose }: BookingSheetContentProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<string>('');
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
  const [step, setStep] = useState(1); // 1 for seat selection, 2 for pickup point

  const handleSeatClick = (seatId: string, isBooked: boolean) => {
    if (isBooked) return;

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  };

  const handleProceed = () => {
    if (step === 1 && selectedSeats.length > 0) {
      setStep(2);
    }
  };

  const handleConfirmBooking = () => {
    // In a real app, this would involve a payment gateway
    setIsBookingConfirmed(true);
  };

  const totalPrice = selectedSeats.length * route.price;

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
            'bg-primary text-primary-foreground border-primary': status === 'selected',
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
      <div className="p-4 space-y-8">
        {/* Progress Steps */}
        <div className="flex items-center w-full">
            <div className="flex items-center text-primary relative">
                <div className="rounded-full transition duration-500 ease-in-out h-8 w-8 text-lg flex items-center justify-center bg-primary text-primary-foreground">1</div>
                <div className="absolute top-0 -ml-10 text-center mt-16 w-32 text-xs font-medium uppercase text-primary">Select Seats</div>
            </div>
            <div className={cn("flex-auto border-t-2 transition duration-500 ease-in-out", step > 1 ? "border-primary" : "border-gray-300")}></div>
            <div className="flex items-center text-gray-500 relative">
                <div className={cn("rounded-full transition duration-500 ease-in-out h-8 w-8 text-lg flex items-center justify-center", step > 1 ? "bg-primary text-primary-foreground" : "bg-gray-300")}>2</div>
                <div className={cn("absolute top-0 -ml-10 text-center mt-16 w-32 text-xs font-medium uppercase", step > 1 ? "text-primary" : "text-gray-500")}>Pickup Point</div>
            </div>
        </div>

        {step === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Your Seats</h3>
            <div className="flex justify-center gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border-2 bg-background border-gray-400" /> Available</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-primary border-2 border-primary" /> Selected</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-muted border-2 border-gray-300" /> Booked</div>
            </div>
            <div className="bg-muted/50 p-4 md:p-8 rounded-lg flex flex-col items-center">
                <BusFront className="w-8 h-8 text-muted-foreground mb-2 self-end" />
                <div className="grid grid-cols-5 gap-2 md:gap-4" style={{gridTemplateColumns: 'repeat(5, auto)'}}>
                {route.seatLayout.rows.map((row, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                    {row.map((seatId) => (
                        <div
                        key={seatId || `empty-${rowIndex}`}
                        className="flex items-center justify-center"
                        >
                        {seatId === '' ? <div className="w-12 h-14" /> : <Seat id={seatId} />}
                        </div>
                    ))}
                    </React.Fragment>
                ))}
                </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Your Pickup Point</h3>
            <RadioGroup value={selectedPickupPoint} onValueChange={setSelectedPickupPoint} className="space-y-2">
              {route.pickupPoints.map((point) => (
                <Label key={point} htmlFor={point} className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-accent has-[:checked]:bg-accent has-[:checked]:border-primary">
                  <RadioGroupItem value={point} id={point} />
                  <span className="ml-4 font-medium">{point}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        )}

        <div className="mt-8 pt-4 border-t sticky bottom-0 bg-background py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
                <p className="text-sm text-muted-foreground">Selected Seats:</p>
                <p className="font-bold text-lg">{selectedSeats.join(', ') || 'None'}</p>
            </div>
            <div className="flex items-center gap-4">
                <div>
                <p className="text-sm text-muted-foreground text-right">Total Price</p>
                <p className="font-bold text-2xl text-primary">BDT {totalPrice.toLocaleString()}</p>
                </div>
                {step === 1 && (
                    <Button size="lg" disabled={selectedSeats.length === 0} onClick={handleProceed}>
                        Proceed
                    </Button>
                )}
                 {step === 2 && (
                    <Button size="lg" disabled={!selectedPickupPoint} onClick={handleConfirmBooking}>
                        Confirm Booking
                    </Button>
                )}
            </div>
            </div>
        </div>
      </div>

      <AlertDialog open={isBookingConfirmed}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Booking Successful!</AlertDialogTitle>
            <AlertDialogDescription>
              Your tickets for {selectedSeats.join(', ')} from {selectedPickupPoint} have been confirmed. An e-ticket has been sent to your email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => { setIsBookingConfirmed(false); onClose(); }}>
              Done
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
