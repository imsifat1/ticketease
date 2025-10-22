"use client";

import React, { useState, useRef, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Armchair, X, BusFront, ArrowRight, Calendar, ArrowLeft, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BusRoute, SeatLock } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import PassengerDetailsForm, { type PassengerDetailsFormHandle } from './passenger-details-form';
import { mockBusRoutes } from '@/lib/mock-data';
import { lockSeats } from '@/ai/flows/lock-seat-flow';
import { useAuth } from '@/context/auth-context';


interface BookingSheetContentProps {
  route: BusRoute;
  departureDate: Date | null;
  onClose: () => void;
}

export default function BookingSheetContent({ route, departureDate, onClose }: BookingSheetContentProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<string>('');
  const [step, setStep] = useState(1); // 1: seat, 2: pickup, 3: summary
  const [activeLock, setActiveLock] = useState<Pick<SeatLock, 'lockId' | 'expiresAt'> | null>(null);
  const [isPending, startTransition] = useTransition();

  const { toast } = useToast();
  const passengerFormRef = useRef<PassengerDetailsFormHandle>(null);
  const router = useRouter();
  const { user } = useAuth(); // Assuming useAuth provides the logged-in user's info

  const clearSession = () => {
      // In a real app, we might want to call an API to release the lock explicitly
      // For now, the lock will just expire on the server.
      setActiveLock(null);
      setSelectedSeats([]);
      setSelectedPickupPoint('');
      setStep(1);
  };
  
  useEffect(() => {
    // This effect is to clear the session when the component unmounts (e.g., sheet is closed)
    return () => {
      clearSession();
    };
  }, []);


  const handleSeatClick = (seatId: string, isBooked: boolean) => {
    if (isBooked) return;

    if (activeLock) {
        toast({
            title: 'Booking in Progress',
            description: 'You cannot change seats while your booking session is active. Go back to seat selection to unlock.',
            variant: 'destructive',
        });
        return;
    }

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
      const newSeats = isCurrentlySelected ? prev.filter((s) => s !== seatId) : [...prev, seatId];
      return newSeats;
    });
  };

  const handleTimeout = () => {
    toast({
        title: "Session Expired",
        description: "Your selected seats have been released. Please try again.",
        variant: "destructive",
    });
    clearSession();
    onClose();
  };

  const handleProceedToPickup = () => {
    if (step === 1 && selectedSeats.length > 0) {
      startTransition(async () => {
        if (!user) {
            toast({ title: 'Authentication Error', description: 'User not found.', variant: 'destructive'});
            return;
        }
        const result = await lockSeats({
            busId: route.id,
            seatNumbers: selectedSeats,
            customerId: user.mobileNumber, // Use logged-in user's mobile number
        });
        
        if (result.success && result.lockId && result.expiresAt) {
            setActiveLock({ lockId: result.lockId, expiresAt: result.expiresAt });
            setStep(2);
        } else {
             toast({
                title: 'Failed to lock seats',
                description: result.message,
                variant: 'destructive',
            });
        }
      });
    }
  };

  const handleProceedToSummary = () => {
    if (step === 2 && selectedPickupPoint) {
      setStep(3);
    }
  };

  const handleGoBackFromSummary = () => {
    setStep(2);
  }

  const handleGoBackFromPickup = () => {
    clearSession();
    toast({
        title: 'Booking Timer Cancelled',
        description: 'Your seat selection has been reset. You can now choose new seats.',
    });
  }

  const handleConfirmBooking = async () => {
    if (passengerFormRef.current) {
      const { isValid, data } = await passengerFormRef.current.triggerValidation();
      if (isValid && data) {
        
        // This is where we would typically call an API to finalize the booking.
        // For this demo, we'll directly manipulate the mock data.
        const routeIndex = mockBusRoutes.findIndex(r => r.id === route.id);
        if (routeIndex !== -1) {
            const currentBookedSeats = new Set(mockBusRoutes[routeIndex].seatLayout.booked);
            selectedSeats.forEach(seat => currentBookedSeats.add(seat));
            mockBusRoutes[routeIndex].seatLayout.booked = Array.from(currentBookedSeats);
        }
        
        const pnr = `SY${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const bookingDetails = {
            pnr,
            contactName: data.contactName,
            contactMobile: data.contactMobile,
            passengers: data.passengers,
            route: mockBusRoutes[routeIndex], // send the updated route object
            selectedSeats,
            pickupPoint: selectedPickupPoint,
            departureDate: departureDate ? departureDate.toISOString() : null,
            totalAmount: passengerFormRef.current.getTotalAmount(),
            status: 'Paid',
            customerId: data.contactMobile,
        };
        
        sessionStorage.setItem(`booking-${pnr}`, JSON.stringify(bookingDetails));

        toast({
            title: 'Booking Successful!',
            description: `Your PNR is ${pnr}. Redirecting to your ticket...`,
        });

        clearSession(); // Important: Clear the session lock after booking
        onClose();
        router.push(`/invoice/${pnr}`);
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
        disabled={isBooked || (!!activeLock && !isSelected)}
        className={cn(
          "flex flex-col items-center justify-center rounded-md border-2 transition-colors w-12 h-14",
          {
            'bg-muted border-gray-300 cursor-not-allowed': status === 'booked',
            'bg-background hover:bg-accent border-gray-400': status === 'available',
            'bg-primary text-primary-foreground border-primary': status === 'selected',
            'cursor-not-allowed opacity-60': activeLock && status === 'available'
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
                    expiryTimestamp={activeLock?.expiresAt ?? null}
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
                    <Button size="lg" disabled={selectedSeats.length === 0 || isPending} onClick={handleProceedToPickup}>
                        {isPending ? <Loader2 className="animate-spin" /> : 'Proceed'}
                    </Button>
                )}
                 {step === 2 && (
                   <div className="flex items-center gap-2">
                    <Button variant="outline" size="lg" onClick={handleGoBackFromPickup}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button size="lg" disabled={!selectedPickupPoint} onClick={handleProceedToSummary}>
                        Proceed to Summary
                    </Button>
                   </div>
                )}
                {step === 3 && (
                     <div className="flex items-center gap-2">
                        <Button variant="outline" size="lg" onClick={handleGoBackFromSummary}>
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
    </>
  );
}
