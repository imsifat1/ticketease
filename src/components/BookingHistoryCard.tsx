
"use client";

import type { Booking, BookingStatus } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bus, Clock, Calendar, Users, MapPin, Ticket, AlertCircle, Printer, Eye, CheckCircle, XCircle, RefreshCw, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from "next/link";
import { cn } from "@/lib/utils";


const statusConfig: { [key in BookingStatus]: { icon: React.ElementType, label: string, className: string } } = {
  Booked: { icon: Ticket, label: 'Booked', className: 'bg-blue-500 hover:bg-blue-600' },
  Paid: { icon: CheckCircle, label: 'Paid', className: 'bg-green-600 hover:bg-green-700' },
  Canceled: { icon: XCircle, label: 'Canceled', className: 'bg-red-500 hover:bg-red-600' },
  Expired: { icon: AlertTriangle, label: 'Expired', className: 'bg-yellow-500 hover:bg-yellow-600' },
  Reissued: { icon: RefreshCw, label: 'Reissued', className: 'bg-purple-500 hover:bg-purple-600' },
};


export default function BookingHistoryCard({ booking }: { booking: Booking }) {

  const departureDate = new Date(booking.trip.departureTime);
  
  const currentStatus = booking.status || 'Booked';
  const StatusIcon = statusConfig[currentStatus].icon;

  const handleCancelBooking = () => {
    // In a real app, this would make an API call to cancel the booking.
    // For now, we'll just update it in localStorage.
    if(typeof window !== "undefined") {
        const updatedBooking = {...booking, status: 'Canceled' as BookingStatus};
        localStorage.setItem(`booking_${booking.id}`, JSON.stringify(updatedBooking));
        window.location.reload(); // Refresh to reflect the change
    }
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
          <CardTitle className="text-xl">
            {booking.trip.origin} to {booking.trip.destination}
          </CardTitle>
          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
             <Bus className="w-4 h-4"/> {booking.trip.bus.name}
          </div>
        </div>
        <Badge variant={"default"} className={cn("flex items-center gap-1.5", statusConfig[currentStatus].className)}>
            <StatusIcon className="w-3.5 h-3.5" />
            {statusConfig[currentStatus].label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-semibold">{departureDate.toLocaleDateString()}</p>
                </div>
            </div>
             <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <div>
                    <p className="text-muted-foreground">Departure</p>
                    <p className="font-semibold">{new Date(booking.trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
            </div>
             <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-primary" />
                <div>
                    <p className="text-muted-foreground">Seats</p>
                    <p className="font-semibold">{booking.seats.join(", ")}</p>
                </div>
            </div>
             <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <div>
                    <p className="text-muted-foreground">Passengers</p>
                    <p className="font-semibold">{booking.passengers.length}</p>
                </div>
            </div>
        </div>
        <Separator />
         <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary mt-0.5" />
            <div>
                <p className="text-muted-foreground">Pickup Point</p>
                <p className="font-semibold">{booking.pickupPoint}</p>
            </div>
        </div>
      </CardContent>
       <CardFooter className="flex justify-between items-center bg-muted/50 p-4 rounded-b-lg">
        <div className="flex items-center gap-4">
            <div>
                <p className="text-xs text-muted-foreground">Total Fare</p>
                <p className="font-bold text-lg">৳{booking.totalPrice.toFixed(2)}</p>
            </div>
            <Link href={`/confirmation/${booking.id}`} passHref>
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                View Ticket
              </Button>
            </Link>
        </div>
        {currentStatus !== 'Canceled' && currentStatus !== 'Expired' && (
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Cancel Booking</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently cancel your booking for the trip from {booking.trip.origin} to {booking.trip.destination}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Go Back</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancelBooking}>Confirm Cancellation</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );
}
