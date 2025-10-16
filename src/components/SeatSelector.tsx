
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Trip } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowRight, Calendar, Clock, MapPin, Users, Ticket, Bus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "./ui/separator";
import { useUser } from "@/firebase/auth/use-user";
import { useAuthSheet } from "@/hooks/use-auth-sheet";

interface SeatSelectorProps {
  trip: Trip;
}

type View = "SEATS" | "PICKUP";

export default function SeatSelector({ trip }: SeatSelectorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const { open: openAuthSheet } = useAuthSheet();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedPickup, setSelectedPickup] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("SEATS");
  const [isLoading, setIsLoading] = useState(false);
  
  const departureDate = new Date(trip.departureTime).toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });


  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isClient) {
      const storedSeats = localStorage.getItem(`selectedSeats_${trip.id}`);
      if (storedSeats) {
        setSelectedSeats(JSON.parse(storedSeats));
      }
       const storedPickup = localStorage.getItem(`selectedPickup_${trip.id}`);
      if (storedPickup) {
        setSelectedPickup(storedPickup);
      } else if (trip.pickupPoints.length > 0) {
        setSelectedPickup(trip.pickupPoints[0].name);
      }
    }
  }, [isClient, trip.id, trip.pickupPoints]);

  const handleSeatClick = (seatId: string) => {
    if (!isClient) return;

    const isSelected = selectedSeats.includes(seatId);

    if (selectedSeats.length >= 4 && !isSelected) {
       toast({
        variant: "destructive",
        title: "Seat Limit Reached",
        description: "You can select a maximum of 4 seats.",
      });
      return;
    }

    const newSelectedSeats = isSelected
      ? selectedSeats.filter((s) => s !== seatId)
      : [...selectedSeats, seatId];
    
    setSelectedSeats(newSelectedSeats);
    
    localStorage.setItem(`selectedSeats_${trip.id}`, JSON.stringify(newSelectedSeats));
  };

  const handleContinueToPickup = () => {
    if (selectedSeats.length === 0) {
      toast({
        variant: "destructive",
        title: "No seats selected",
        description: "Please select at least one seat to continue.",
      });
      return;
    }
    setView("PICKUP");
  };

  const handleContinueToSummary = async () => {
    if (!selectedPickup) {
      toast({
        variant: 'destructive',
        title: 'No pickup location selected',
        description: 'Please select a pickup location to continue.',
      });
      return;
    }
    if (!isClient) return;
    
    setIsLoading(true);

    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    localStorage.setItem(`selectedPickup_${trip.id}`, selectedPickup);
    
    setOpen(false);
    router.push(`/booking/${trip.id}/summary`);
    setIsLoading(false);
  };
  
  const handleSheetOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setView("SEATS");
    }
  }

  const handleBookSeatsClick = () => {
    if (!user) {
      openAuthSheet(() => {
        setOpen(true);
      });
    } else {
      setOpen(true);
    }
  };

  const renderSeats = () => {
    const { rows, cols, aisleCol, gapRows, booked } = trip.seatLayout;
    const seats = [];
    for (let i = 0; i < rows; i++) {
        if (gapRows.includes(i + 1)) {
            seats.push(<div key={`gap-${i}`} className="col-span-full h-4" />);
        }
      const rowChar = String.fromCharCode(65 + i);
      for (let j = 1; j <= cols; j++) {
        const seatId = `${rowChar}${j}`;
        const isBooked = booked.includes(seatId);
        const isSelected = selectedSeats.includes(seatId);

        seats.push(
          <div
            key={seatId}
            className={cn(
              "flex justify-center items-center",
              j === aisleCol && "mr-8"
            )}
          >
            <Button
              variant="outline"
              size="icon"
              className={cn("w-9 h-9 text-xs rounded-md border-primary/50", 
                isBooked && "bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted",
                isSelected && "bg-accent text-accent-foreground hover:bg-accent/90 border-accent"
              )}
              onClick={() => !isBooked && handleSeatClick(seatId)}
              disabled={isBooked}
              aria-label={`Seat ${seatId}`}
            >
              {seatId}
            </Button>
          </div>
        );
      }
    }
    return seats;
  };

  const renderPickupPoints = () => (
    <div className="p-6">
        <RadioGroup value={selectedPickup} onValueChange={setSelectedPickup} className="space-y-4">
            {trip.pickupPoints.map((point) => (
              <Label
                key={point.name}
                htmlFor={point.name}
                className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-secondary/50 has-[:checked]:bg-secondary has-[:checked]:border-primary"
              >
                <div>
                  <p className="font-semibold">{point.name}</p>
                  <p className="text-xs text-muted-foreground">Time: {point.time}</p>
                </div>
                <RadioGroupItem value={point.name} id={point.name} />
              </Label>
            ))}
          </RadioGroup>
    </div>
  );
  
  const totalPrice = selectedSeats.length * trip.price;

  return (
    <>
      <Button onClick={handleBookSeatsClick} className="w-full md:w-auto bg-primary hover:bg-primary/90">
        Book Seats
      </Button>
      <Sheet open={open} onOpenChange={handleSheetOpenChange}>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="p-6 pb-2 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Bus /> {trip.bus.name}
            </SheetTitle>
            <div className="text-muted-foreground space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {trip.origin} to {trip.destination}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {departureDate}</span>
                </div>
            </div>
          </SheetHeader>
          
          <div className="p-4 bg-secondary/50 text-center font-semibold text-sm">
          {view === "SEATS" ? "Select Your Seats" : "Select Pickup Location"}
          </div>
          
          <div className="flex justify-center gap-4 py-4 text-xs">
              <div className="flex items-center gap-2"><div className="w-4 h-4 border rounded-md border-primary/50"></div>Available</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-md bg-accent"></div>Selected</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-md bg-muted"></div>Booked</div>
          </div>

          {view === 'SEATS' && (
              <div className="flex-1 overflow-y-auto p-6 pt-0">
                  <div className="flex justify-center mb-6">
                      <div className="p-4 rounded-lg bg-secondary inline-block">
                          <p className="text-center font-semibold text-xs uppercase tracking-widest">Driver</p>
                      </div>
                  </div>
                  
                  <div 
                      className="grid gap-2 justify-center"
                      style={{gridTemplateColumns: `repeat(${trip.seatLayout.cols}, auto)`}}
                  >
                      {renderSeats()}
                  </div>
              </div>
          )}

          {view === 'PICKUP' && (
              <div className="flex-1 overflow-y-auto">
                  {renderPickupPoints()}
              </div>
          )}

          <SheetFooter className="p-6 bg-background border-t space-y-4">
            <div className="flex justify-between font-semibold text-lg">
                <span>Total Price</span>
                <span>৳{totalPrice.toFixed(2)}</span>
            </div>
            {view === 'SEATS' ? (
              <Button onClick={handleContinueToPickup} className="w-full bg-primary hover:bg-primary/90">
                  Continue <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <>
              <Button onClick={handleContinueToSummary} disabled={isLoading} className="w-full bg-accent hover:bg-accent/90">
                  {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</>
                  ) : (
                      <>Confirm Booking <ArrowRight className="ml-2 w-4 h-4" /></>
                  )}
              </Button>
              <Button variant="outline" onClick={() => setView('SEATS')} className="w-full">
                  Back to Seats
              </Button>
              </>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
