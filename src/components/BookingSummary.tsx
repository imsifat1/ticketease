

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Trip, Passenger, Booking } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Bus, Clock, Loader2, Users, Wallet, MapPin, Contact } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import BookingTimer from "./BookingTimer";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { useUser } from "@/firebase/auth/use-user";


const passengerSchema = z.object({
  name: z.string(),
  gender: z.enum(["Male", "Female", ""]).optional(),
});

const formSchema = z.object({
  contactName: z.string().min(2, "Contact name is required."),
  contactMobile: z.string().min(11, "Must be an 11-digit mobile number.").max(11, "Must be an 11-digit mobile number."),
  passengers: z.array(passengerSchema),
});

const PROCESSING_FEE_PERCENT = 2.5;
const VAT_PERCENT = 5;
const DISCOUNT_THRESHOLD = 4;
const DISCOUNT_AMOUNT = 200;
const BOOKING_SESSION_MINUTES = 4;

export default function BookingSummary({ trip }: { trip: Trip }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [pickupPoint, setPickupPoint] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleExpire = () => {
    if (isClient) {
        localStorage.removeItem(`selectedSeats_${trip.id}`);
        localStorage.removeItem(`selectedPickup_${trip.id}`);
    }
    toast({
        variant: "destructive",
        title: "Session Expired",
        description: "Your selected seats have been released. Please search again.",
    });
    router.push("/");
  };


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactName: "",
      contactMobile: "",
      passengers: [],
    },
  });

  useEffect(() => {
    if (isClient) {
      const storedSeats = localStorage.getItem(`selectedSeats_${trip.id}`);
      const storedPickup = localStorage.getItem(`selectedPickup_${trip.id}`);

      if (storedSeats) {
        const seats = JSON.parse(storedSeats);
        if (seats.length > 0) {
          setSelectedSeats(seats);
          form.setValue("passengers", Array(seats.length).fill({ name: "", gender: "" }));
        } else {
          router.push(`/search?from=${trip.origin}&to=${trip.destination}&date=${new Date(trip.departureTime).toISOString().split('T')[0]}`);
        }
      } else {
        router.push(`/search?from=${trip.origin}&to=${trip.destination}&date=${new Date(trip.departureTime).toISOString().split('T')[0]}`);
      }

      if (storedPickup) {
          setPickupPoint(storedPickup);
      } else {
          router.push(`/search?from=${trip.origin}&to=${trip.destination}&date=${new Date(trip.departureTime).toISOString().split('T')[0]}`);
      }
    }
  }, [trip.id, router, form, isClient, trip.origin, trip.destination, trip.departureTime]);

  const subTotal = selectedSeats.length * trip.price;
  const processingFee = (subTotal * PROCESSING_FEE_PERCENT) / 100;
  const discount = selectedSeats.length >= DISCOUNT_THRESHOLD ? DISCOUNT_AMOUNT : 0;
  const vat = (subTotal * VAT_PERCENT) / 100;
  const totalPrice = subTotal + processingFee - discount + vat;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if(!isClient) return;

    setIsLoading(true);
    
    const bookingId = `BK-${Date.now()}`;
    
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const bookingData: Booking = {
          id: bookingId,
          trip,
          seats: selectedSeats,
          pickupPoint,
          contactName: values.contactName,
          contactMobile: values.contactMobile,
          passengers: values.passengers,
          subTotal,
          processingFee,
          discount,
          vat,
          totalPrice,
          bookingDate: new Date().toISOString(),
          bookedBy: user ? user.uid : "guest",
          userPhoneNumber: user ? user.phoneNumber : null,
          status: 'Booked' // Default status
        };
    
        localStorage.setItem(`booking_${bookingId}`, JSON.stringify(bookingData));
        localStorage.removeItem(`selectedSeats_${trip.id}`);
        localStorage.removeItem(`selectedPickup_${trip.id}`);

        toast({
          title: "Booking Successful!",
          description: "Your payment has been processed and your ticket is confirmed.",
        });
        
        router.push(`/confirmation/${bookingId}`);

    } catch(error: any) {
        console.error("Booking Error:", error);
        toast({
            variant: "destructive",
            title: "Booking Failed",
            description: "Could not save your booking. Please try again."
        });
    } finally {
        setIsLoading(false);
    }
  };

  if (!isClient) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  return (
    <div className="grid md:grid-cols-3 gap-8 relative">
        <div className="absolute top-0 right-0">
             <BookingTimer duration={BOOKING_SESSION_MINUTES * 60} onExpire={handleExpire} />
        </div>
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Contact /> Contact Details</CardTitle>
                </CardHeader>
                <CardContent>
                     <Form {...form}>
                         <form id="booking-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="contactName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="contactMobile"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mobile Number</FormLabel>
                                            <FormControl><Input type="tel" placeholder="01XXXXXXXXX" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users /> Passenger Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {selectedSeats.map((seat, index) => (
                                <div key={seat} className="p-4 border rounded-lg">
                                    <h3 className="font-semibold mb-4">Passenger for Seat {seat}</h3>
                                    <div className="grid md:grid-cols-2 gap-4 items-start">
                                        <FormField
                                            control={form.control}
                                            name={`passengers.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name</FormLabel>
                                                    <FormControl><Input placeholder="Passenger Name" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`passengers.${index}.gender`}
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel>Gender</FormLabel>
                                                    <FormControl>
                                                        <RadioGroup
                                                            onValueChange={field.onChange}
                                                            value={field.value}
                                                            className="grid grid-cols-2 gap-2"
                                                        >
                                                            <FormItem>
                                                                <Label
                                                                    htmlFor={`male-${index}`}
                                                                    className={cn("flex cursor-pointer items-center justify-center rounded-md border-2 border-muted bg-popover p-3 font-medium hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary")}
                                                                >
                                                                    <FormControl>
                                                                        <RadioGroupItem value="Male" id={`male-${index}`} className="sr-only" />
                                                                    </FormControl>
                                                                    Male
                                                                </Label>
                                                            </FormItem>
                                                            <FormItem>
                                                                <Label
                                                                    htmlFor={`female-${index}`}
                                                                    className={cn("flex cursor-pointer items-center justify-center rounded-md border-2 border-muted bg-popover p-3 font-medium hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary")}
                                                                >
                                                                    <FormControl>
                                                                        <RadioGroupItem value="Female" id={`female-${index}`} className="sr-only" />
                                                                    </FormControl>
                                                                    Female
                                                                </Label>
                                                            </FormItem>
                                                        </RadioGroup>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            ))}
                            <Button type="submit" form="booking-form" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing Payment...
                                    </>
                                ) : (
                                    <>
                                        <Wallet className="mr-2 h-4 w-4" /> Confirm & Pay
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>

        <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Trip Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">From</span>
                        <span className="font-semibold">{trip.origin}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">To</span>
                        <span className="font-semibold">{trip.destination}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2"><Bus className="w-4 h-4"/> Bus</span>
                        <span>{trip.bus.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4"/> Duration</span>
                        <span>{trip.duration}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2"><MapPin className="w-4 h-4"/> Pickup</span>
                        <span className="font-semibold">{pickupPoint}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Seats ({selectedSeats.length})</span>
                        <span className="font-mono">{selectedSeats.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Ticket Price</span>
                        <span>৳{trip.price.toFixed(2)} / seat</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>৳{subTotal.toFixed(2)}</span>
                    </div>
                    <Separator />
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Processing Fee ({PROCESSING_FEE_PERCENT}%)</span>
                        <span>৳{processingFee.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="text-green-600">- ৳{discount.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">VAT ({VAT_PERCENT}%)</span>
                        <span>৳{vat.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total Amount</span>
                        <span>৳{totalPrice.toFixed(2)}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
