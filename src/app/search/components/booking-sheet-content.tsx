"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Armchair, X, BusFront, ArrowRight, Calendar, ArrowLeft, Clock } from 'lucide-react';
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
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import PassengerDetailsForm, { type PassengerDetailsFormHandle } from './passenger-details-form';

interface BookingSheetContentProps {
  route: BusRoute;
  departureDate: Date | null;
  onClose: () => void;
}

const TIMER_KEY = 'bookingExpiryTimestamp';

export default function BookingSheetContent({ route, departureDate, onClose }: BookingSheetContentProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<string>('');
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
  const [step, setStep] = useState(1); // 1: seat, 2: pickup, 3: summary
  const [expiryTimestamp, setExpiryTimestamp] = useState<number | null>(null);

  const { toast } = useToast();
  const passengerFormRef = useRef<PassengerDetailsFormHandle>(null);

  useEffect(() => {
    // On component mount, check if there's an existing timer
    const storedTimestamp = localStorage.getItem(TIMER_KEY);
    if (storedTimestamp) {
        const timestamp = parseInt(storedTimestamp, 10);
        if (timestamp > Date.now()) {
            setExpiryTimestamp(timestamp);
            setStep(3); // Assume if timer is running, user was at summary
            // You might want to restore selectedSeats and pickupPoint from localStorage as well if you want full persistence
        } else {
            localStorage.removeItem(TIMER_KEY);
        }
    }
  }, []);

  const handleSeatClick = (seatId: string, isBooked: boolean) => {
    if (isBooked) return;

    const isCurrentlySelected = selectedSeats.includes(seatId);

    if (selectedSeats.length >= 4 && !isCurrentlySelected) {
      toast({
        title: 'Seat limit reached',
        description: 'You can select a maximum of 4 seats.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedSeats((prev) => {
      if (isCurrentlySelected) {
        return prev.filter((s) => s !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  };

  const startTimer = () => {
    const newExpiryTimestamp = Date.now() + 4 * 60 * 1000;
    localStorage.setItem(TIMER_KEY, newExpiryTimestamp.toString());
    setExpiryTimestamp(newExpiryTimestamp);
  };

  const clearTimer = () => {
      localStorage.removeItem(TIMER_KEY);
      setExpiryTimestamp(null);
  }

  const handleTimeout = () => {
    toast({
        title: "Session Expired",
        description: "Your selected seats have been released. Please try again.",
        variant: "destructive",
    });
    clearTimer();
    setSelectedSeats([]);
    setSelectedPickupPoint('');
    setStep(1);
    onClose();
  };

  const handleProceedToPickup = () => {
    if (step === 1 && selectedSeats.length > 0) {
      setStep(2);
    }
  };

  const handleProceedToSummary = () => {
    if (step === 2 && selectedPickupPoint) {
      startTimer();
      setStep(3);
    }
  };

  const handleConfirmBooking = async () => {
    if (passengerFormRef.current) {
      const isValid = await passengerFormRef.current.triggerValidation();
      if (isValid) {
        // In a real app, this would involve a payment gateway
        clearTimer();
        setIsBookingConfirmed(true);
      }
    }
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

  const getStepClass = (stepNumber: number, baseClass: string) => {
    if (step < stepNumber) return `${baseClass} text-gray-500`;
    if (step === stepNumber) return `${baseClass} text-primary`;
    return `${baseClass} text-green-600`; // Completed step
  };

  const getStepDivClass = (stepNumber: number) => {
    if (step < stepNumber) return "bg-gray-300";
    if (step === stepNumber) return "bg-primary text-primary-foreground";
    return "bg-green-600 text-primary-foreground";
  };

  return (
    <>
      <div className="p-4 space-y-8">
        <div className="border-b pb-4 mb-4">
          <h3 className="font-bold text-lg text-primary">{route.operator}</h3>
          <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-2 font-semibold">
              <span className="capitalize">{route.from}</span>
              <ArrowRight className="w-4 h-4" />
              <span className="capitalize">{route.to}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{departureDate ? format(departureDate, 'PPP') : 'N/A'} at {route.departureTime}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center w-full pt-8">
            <div className={getStepClass(1, "flex items-center relative")}>
                <div className={cn("rounded-full transition duration-500 ease-in-out h-8 w-8 text-lg flex items-center justify-center", getStepDivClass(1))}>1</div>
                <div className="absolute top-0 -ml-10 text-center mt-10 w-32 text-xs font-medium uppercase">Select Seats</div>
            </div>
            <div className={cn("flex-auto border-t-2 transition duration-500 ease-in-out", step > 1 ? "border-primary" : "border-gray-300")}></div>
            <div className={getStepClass(2, "flex items-center relative")}>
                <div className={cn("rounded-full transition duration-500 ease-in-out h-8 w-8 text-lg flex items-center justify-center", getStepDivClass(2))}>2</div>
                <div className="absolute top-0 -ml-10 text-center mt-10 w-32 text-xs font-medium uppercase">Pickup Point</div>
            </div>
            <div className={cn("flex-auto border-t-2 transition duration-500 ease-in-out", step > 2 ? "border-primary" : "border-gray-300")}></div>
            <div className={getStepClass(3, "flex items-center relative")}>
                <div className={cn("rounded-full transition duration-500 ease-in-out h-8 w-8 text-lg flex items-center justify-center", getStepDivClass(3))}>3</div>
                <div className="absolute top-0 -ml-10 text-center mt-10 w-32 text-xs font-medium uppercase">Summary</div>
            </div>
        </div>

        {step === 1 && (
          <div className="mt-16 pt-4">
            <h3 className="text-lg font-semibold mb-4 mt-8">Select Your Seats</h3>
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
          <div className="mt-16 pt-4">
            <h3 className="text-lg font-semibold mb-4">Select Your Pickup Point</h3>
            <RadioGroup value={selectedPickupPoint} onValueChange={setSelectedPickupPoint} className="space-y-2">
              {route.pickupPoints.map((point) => (
                <Label key={point.name} htmlFor={point.name} className="flex items-center justify-between p-4 border rounded-md cursor-pointer hover:bg-accent has-[:checked]:bg-accent has-[:checked]:border-primary">
                    <div className="flex items-center">
                        <RadioGroupItem value={point.name} id={point.name} />
                        <span className="ml-4 font-medium">{point.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{point.time}</span>
                    </div>
                </Label>
              ))}
            </RadioGroup>
          </div>
        )}

        {step === 3 && (
            <div className="mt-16 pt-4">
                 <PassengerDetailsForm
                    ref={passengerFormRef}
                    route={route}
                    selectedSeats={selectedSeats}
                    pickupPoint={selectedPickupPoint}
                    expiryTimestamp={expiryTimestamp}
                    onTimeout={handleTimeout}
                 />
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
                    <Button size="lg" disabled={selectedSeats.length === 0} onClick={handleProceedToPickup}>
                        Proceed
                    </Button>
                )}
                 {step === 2 && (
                   <div className="flex items-center gap-2">
                    <Button variant="outline" size="lg" onClick={() => setStep(1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button size="lg" disabled={!selectedPickupPoint} onClick={handleProceedToSummary}>
                        Proceed to Summary
                    </Button>
                   </div>
                )}
                {step === 3 && (
                     <div className="flex items-center gap-2">
                        <Button variant="outline" size="lg" onClick={() => { setStep(2); clearTimer(); }}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button size="lg" onClick={handleConfirmBooking}>
                            Confirm Booking
                        </Button>
                   </div>
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
              Your tickets for {selectedSeats.join(', ')} from {selectedPickupPoint} have been confirmed. An e-ticket has been sent to your mobile number.
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

    