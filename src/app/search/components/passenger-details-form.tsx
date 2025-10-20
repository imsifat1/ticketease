"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { BusRoute } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

interface PassengerDetailsFormProps {
    route: BusRoute;
    selectedSeats: string[];
    pickupPoint: string;
    passengers: any[];
    setPassengers: (passengers: any) => void;
}

function Timer({ initialMinutes = 4 }: { initialMinutes: number }) {
  const [seconds, setSeconds] = useState(initialMinutes * 60);

  useEffect(() => {
    if (seconds <= 0) return;

    const interval = setInterval(() => {
      setSeconds(prevSeconds => prevSeconds - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <div className={`font-bold ${seconds < 60 ? 'text-destructive' : ''}`}>
      {String(minutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
    </div>
  );
}


export default function PassengerDetailsForm({ route, selectedSeats, pickupPoint, passengers, setPassengers }: PassengerDetailsFormProps) {
  const subtotal = route.price * selectedSeats.length;
  const processingFee = subtotal * 0.025;
  const discount = 200.00; // Example discount
  const vat = (subtotal + processingFee - discount) * 0.05;
  const totalAmount = subtotal + processingFee - discount + vat;

  const handlePassengerChange = (index: number, field: string, value: string) => {
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    setPassengers(newPassengers);
  };
    
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left side */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="contact-name">Full Name</Label>
              <Input id="contact-name" placeholder="Enter your full name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact-mobile">Mobile Number</Label>
              <Input id="contact-mobile" type="tel" placeholder="Enter your mobile number" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Passenger Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {passengers.map((passenger, index) => (
              <div key={passenger.seatId}>
                <h4 className="font-semibold text-primary mb-3">Passenger for Seat {passenger.seatId}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`passenger-name-${index}`}>Full Name</Label>
                    <Input 
                      id={`passenger-name-${index}`} 
                      placeholder="Passenger's name"
                      value={passenger.name}
                      onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender (optional)</Label>
                    <RadioGroup 
                      className="flex items-center gap-4 pt-2"
                      value={passenger.gender}
                      onValueChange={(value) => handlePassengerChange(index, 'gender', value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id={`male-${index}`} />
                        <Label htmlFor={`male-${index}`} className="font-normal">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id={`female-${index}`} />
                        <Label htmlFor={`female-${index}`} className="font-normal">Female</Label>
                      </div>
                    </RadioGroup>
                  </div>
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
                Time left: <Timer initialMinutes={4} />
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
                    <p>৳{subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                    <p>Processing Fee (2.5%)</p>
                    <p>৳{processingFee.toFixed(2)}</p>
                </div>
                 <div className="flex justify-between text-destructive">
                    <p>Discount</p>
                    <p>- ৳{discount.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                    <p>VAT (5%)</p>
                    <p>৳{vat.toFixed(2)}</p>
                </div>
             </div>
            <Separator />
          </CardContent>
          <CardFooter className="flex justify-between font-bold text-lg">
            <p>Total Amount</p>
            <p>৳{totalAmount.toFixed(2)}</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
