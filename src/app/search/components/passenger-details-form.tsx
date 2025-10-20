"use client";

import React, { useState, useEffect, useImperativeHandle, forwardRef, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { BusRoute } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const passengerSchema = z.object({
  seatId: z.string(),
  name: z.string().optional(),
  gender: z.string().optional(),
});

const bookingSchema = z.object({
  contactName: z.string().min(1, { message: 'Contact name is required.' }),
  contactMobile: z.string()
    .min(1, { message: 'Mobile number is required.' })
    .regex(/^01[0-9]{9}$/, 'Must be a valid 11-digit Bangladeshi number starting with 01.'),
  passengers: z.array(passengerSchema),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface PassengerDetailsFormProps {
  route: BusRoute;
  selectedSeats: string[];
  pickupPoint: string;
  expiryTimestamp: number | null;
  onTimeout: () => void;
}

export interface PassengerDetailsFormHandle {
  triggerValidation: () => Promise<{ isValid: boolean, data: BookingFormValues | null }>;
  getTotalAmount: () => number;
}

function Timer({ expiryTimestamp, onTimeout }: { expiryTimestamp: number, onTimeout: () => void }) {
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    const calculateRemaining = () => {
      const remaining = Math.round((expiryTimestamp - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    };

    setRemainingSeconds(calculateRemaining());

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onTimeout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTimestamp, onTimeout]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className={`font-bold ${remainingSeconds < 60 ? 'text-destructive' : ''}`}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}

const PassengerDetailsForm = forwardRef<PassengerDetailsFormHandle, PassengerDetailsFormProps>(
  ({ route, selectedSeats, pickupPoint, expiryTimestamp, onTimeout }, ref) => {

    const fareDetails = useMemo(() => {
        const subtotal = route.price * selectedSeats.length;
        const processingFee = subtotal * 0.025;
        const discount = 200.00; // Example discount
        const vat = (subtotal + processingFee - discount) * 0.05;
        const totalAmount = subtotal + processingFee - discount + vat;
        return { subtotal, processingFee, discount, vat, totalAmount };
    }, [route.price, selectedSeats.length]);
    
    const form = useForm<BookingFormValues>({
      resolver: zodResolver(bookingSchema),
      defaultValues: {
        contactName: '',
        contactMobile: '',
        passengers: selectedSeats.map(seat => ({ seatId: seat, name: '', gender: '' })),
      },
      mode: 'onChange',
    });

    const { fields } = useFieldArray({
      control: form.control,
      name: 'passengers',
    });
    
    useImperativeHandle(ref, () => ({
      triggerValidation: async () => {
        const isValid = await form.trigger();
        if (isValid) {
            return { isValid: true, data: form.getValues() };
        }
        return { isValid: false, data: null };
      },
      getTotalAmount: () => fareDetails.totalAmount,
    }));
    
    return (
      <Form {...form}>
        <form className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
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
                      <FormControl>
                        <Input type="tel" placeholder="Enter your mobile number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Passenger Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((passenger, index) => (
                  <div key={passenger.id}>
                    <h4 className="font-semibold text-primary mb-3">Passenger for Seat {passenger.seatId}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`passengers.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Passenger's name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`passengers.${index}.gender`}
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel>Gender (optional)</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex items-center gap-4 pt-2"
                              >
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <RadioGroupItem value="male" id={`male-${index}`} />
                                  </FormControl>
                                  <Label htmlFor={`male-${index}`} className="font-normal">Male</Label>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <RadioGroupItem value="female" id={`female-${index}`} />
                                  </FormControl>
                                  <Label htmlFor={`female-${index}`} className="font-normal">Female</Label>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right side */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Trip Details</CardTitle>
                <div className="text-sm">
                    Time left: {expiryTimestamp && <Timer expiryTimestamp={expiryTimestamp} onTimeout={onTimeout} />}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                 <div>
                    <p className="font-bold">{route.operator}</p>
                    <p className="text-muted-foreground">Duration: {route.duration}</p>
                 </div>
                 <div>
                    <p className="font-semibold">Pickup</p>
                    <p className="text-muted-foreground capitalize">{pickupPoint}</p>
                 </div>
                 <div>
                    <p className="font-semibold">Seats ({selectedSeats.length})</p>
                    <p className="text-muted-foreground">{selectedSeats.join(', ')}</p>
                 </div>
                 <Separator />
                 <div className="space-y-1">
                    <div className="flex justify-between">
                        <p>Ticket Price</p>
                        <p>৳{route.price.toFixed(2)} / seat</p>
                    </div>
                     <div className="flex justify-between">
                        <p>Subtotal</p>
                        <p>৳{fareDetails.subtotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between">
                        <p>Processing Fee (2.5%)</p>
                        <p>৳{fareDetails.processingFee.toFixed(2)}</p>
                    </div>
                     <div className="flex justify-between text-destructive">
                        <p>Discount</p>
                        <p>- ৳{fareDetails.discount.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between">
                        <p>VAT (5%)</p>
                        <p>৳{fareDetails.vat.toFixed(2)}</p>
                    </div>
                 </div>
                <Separator />
              </CardContent>
              <CardFooter className="flex justify-between font-bold text-lg">
                <p>Total Amount</p>
                <p>৳{fareDetails.totalAmount.toFixed(2)}</p>
              </CardFooter>
            </Card>
          </div>
        </form>
      </Form>
    );
  }
);
PassengerDetailsForm.displayName = "PassengerDetailsForm";

export default PassengerDetailsForm;
