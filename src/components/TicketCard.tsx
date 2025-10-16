
"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode.react";
import type { Booking } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bus, Clock, MapPin, Users, Ticket as TicketIcon, Printer } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";

export default function TicketCard({ booking }: { booking: Booking }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!isClient) {
    return <Skeleton className="h-[500px] w-full" />;
  }

  const { trip, seats, passengers, pickupPoint, subTotal, processingFee, discount, vat, totalPrice, contactName, contactMobile, id: bookingId } = booking;
  const departureTime = new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const arrivalTime = new Date(trip.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const departureDate = new Date(trip.departureTime).toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #ticket-to-print, #ticket-to-print * {
            visibility: visible;
          }
          #ticket-to-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print-hidden {
             display: none;
          }
        }
      `}</style>
      <div id="ticket-to-print">
        <Card className="bg-gradient-to-br from-primary/5 via-background to-background shadow-lg">
          <CardHeader className="text-center bg-primary text-primary-foreground p-4 rounded-t-lg">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl font-headline">
              <TicketIcon /> Boarding Pass
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-muted-foreground">From</p>
                    <p className="text-2xl font-bold">{trip.origin}</p>
                </div>
                <Bus className="text-primary w-8 h-8" />
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">To</p>
                    <p className="text-2xl font-bold">{trip.destination}</p>
                </div>
            </div>

            <Separator />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-muted-foreground">Departure</p>
                    <p className="font-semibold">{departureDate}, {departureTime}</p>
                </div>
                <div className="text-right">
                    <p className="text-muted-foreground">Arrival (est.)</p>
                    <p className="font-semibold">{arrivalTime}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Bus</p>
                    <p className="font-semibold">{trip.bus.name} ({trip.bus.type})</p>
                </div>
                <div className="text-right">
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-semibold">{trip.duration}</p>
                </div>
                <div className="col-span-2">
                    <p className="text-muted-foreground">Pickup Point</p>
                    <p className="font-semibold">{pickupPoint}</p>
                </div>
                <div className="col-span-2">
                    <p className="text-muted-foreground">Contact Person</p>
                    <p className="font-semibold">{contactName} ({contactMobile})</p>
                </div>
            </div>

            <Separator />

            <div>
                <p className="text-muted-foreground text-sm">Passengers</p>
                {passengers.map((p, i) => (
                    <div key={i} className="flex justify-between items-center font-semibold mt-1">
                        <span>{p.name || 'N/A'} <span className="text-xs text-muted-foreground">({p.gender || 'N/A'})</span></span>
                        <span className="font-mono text-primary bg-primary/10 px-2 py-1 rounded-md text-xs">Seat: {seats[i]}</span>
                    </div>
                ))}
            </div>
            
            <Separator />

            <div className="flex justify-between items-center">
                <div>
                    <p className="text-muted-foreground text-sm">Booking ID</p>
                    <p className="font-mono text-xs">{bookingId}</p>
                    
                    <div className="mt-4 text-xs space-y-1">
                        <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span>৳{subTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Processing Fee:</span>
                            <span>৳{processingFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Discount:</span>
                            <span className="text-green-600">- ৳{discount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">VAT:</span>
                            <span>৳{vat.toFixed(2)}</span>
                        </div>
                    </div>
                    <Separator className="my-2"/>
                    <p className="text-muted-foreground text-sm mt-2">Total Price</p>
                    <p className="font-bold text-lg">৳{totalPrice.toFixed(2)}</p>
                </div>
                <div className="p-2 bg-white rounded-md shadow-md">
                    <QRCode value={JSON.stringify({ bookingId, tripId: trip.id, seats })} size={100} />
                </div>
            </div>

          </CardContent>
        </Card>
      </div>
       <div className="mt-6 text-center print-hidden">
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print Ticket
        </Button>
      </div>
    </>
  );
}
