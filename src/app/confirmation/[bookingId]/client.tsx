"use client";

import { useState, useEffect } from "react";
import TicketCard from "@/components/TicketCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Booking } from "@/lib/types";
import { useParams } from "next/navigation";

export default function ClientConfirmationPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isClient && bookingId) {
        setLoading(true);
        const storedBooking = localStorage.getItem(`booking_${bookingId}`);
        if (storedBooking) {
          setBooking(JSON.parse(storedBooking));
        }
        setLoading(false);
    }
  }, [isClient, bookingId]);

  if (!isClient || loading) {
    return (
      <div className="container py-8 max-w-2xl mx-auto">
        <Skeleton className="h-8 w-64 mx-auto mb-2" />
        <Skeleton className="h-5 w-80 mx-auto mb-8" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!booking) {
      return (
          <div className="container py-8 text-center">
              <h1 className="text-2xl font-bold">Booking Not Found</h1>
              <p className="text-muted-foreground">The requested booking could not be found in your local storage.</p>
          </div>
      )
  }

  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <>
        <div className="text-center mb-8 print-hidden">
          <h1 className="text-3xl font-bold font-headline">Booking Confirmed!</h1>
          <p className="text-muted-foreground">
            Your journey starts here. Find and book your bus tickets online with ease!
          </p>
        </div>
        <TicketCard booking={booking} />
      </>
    </div>
  );
}