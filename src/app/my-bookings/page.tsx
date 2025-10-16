
"use client";

import { useState, useEffect, useMemo } from "react";
import BookingHistoryCard from "@/components/BookingHistoryCard";
import MyBookingsFilterSidebar from "@/components/MyBookingsFilterSidebar";
import { useUser } from "@/firebase/auth/use-user";
import { useRouter } from "next/navigation";
import type { Booking, BookingStatus } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function MyBookingsPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [activeFilter, setActiveFilter] = useState<BookingStatus | "All Tickets">("All Tickets");
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isClient && !loading && !user) {
      router.replace('/');
    }
  }, [user, loading, router, isClient]);

  useEffect(() => {
    if (isClient && user) {
      setPageLoading(true);
      const storedBookings: Booking[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("booking_")) {
          const bookingData = localStorage.getItem(key);
          if (bookingData) {
            const booking = JSON.parse(bookingData);
            if (!booking.status) {
              booking.status = 'Booked'; 
            }
            if(booking.bookedBy === user.uid || (user.uid === 'demo-user-uid' && booking.bookedBy === 'demo-user-uid')) {
                storedBookings.push(booking);
            }
          }
        }
      }
      
      storedBookings.sort((a, b) => {
        const dateA = a.bookingDate ? new Date(a.bookingDate as string).getTime() : 0;
        const dateB = b.bookingDate ? new Date(b.bookingDate as string).getTime() : 0;
        return dateB - dateA;
      });
      setAllBookings(storedBookings);
      setPageLoading(false);
    }
  }, [isClient, user]);
  
  const filteredBookings = useMemo(() => {
    if (activeFilter === 'All Tickets') {
        return allBookings;
    }
    return allBookings.filter(booking => booking.status === activeFilter);
  }, [allBookings, activeFilter]);


  if (!isClient || loading || pageLoading) {
    return (
        <div className="flex h-[60vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin"/>
        </div>
    );
  }

  if (!user) {
    return null; 
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">My Bookings</h1>
        <p className="text-muted-foreground">
          View and manage your past and upcoming trips.
        </p>
      </div>
      
      <div className="grid md:grid-cols-4 gap-8 items-start">
        <div className="md:col-span-1">
            <MyBookingsFilterSidebar onFilterChange={setActiveFilter} />
        </div>
        <div className="md:col-span-3">
             {filteredBookings.length > 0 ? (
                <div className="grid gap-6">
                {filteredBookings.map((booking) => (
                    <BookingHistoryCard key={booking.id} booking={booking} />
                ))}
                </div>
            ) : (
                <div className="text-center py-16 border rounded-lg">
                <h2 className="text-2xl font-semibold">No Bookings Found</h2>
                <p className="text-muted-foreground mt-2">
                    You have no bookings yet, or none that match the "{activeFilter}" filter.
                </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
