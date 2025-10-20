'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Ticket,
  CircleCheckBig,
  CircleX,
  TriangleAlert,
  RefreshCw,
  Bus,
  ArrowRight,
  Calendar,
  Clock,
  Armchair,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { BusRoute } from '@/lib/types';


type BookingStatus = 'Booked' | 'Paid' | 'Canceled' | 'Expired' | 'Reissued';

const filterOptions: { label: BookingStatus | 'All'; icon: React.ElementType }[] = [
  { label: 'All', icon: Ticket },
  { label: 'Booked', icon: Ticket },
  { label: 'Paid', icon: CircleCheckBig },
  { label: 'Canceled', icon: CircleX },
  { label: 'Expired', icon: TriangleAlert },
  { label: 'Reissued', icon: RefreshCw },
];

const mockRoutes: BusRoute[] = [
    {
    id: '1',
    operator: 'Hanif Enterprise',
    from: 'Dhaka',
    to: 'Chittagong',
    class: 'ac-seater',
    departureTime: '08:00 AM',
    arrivalTime: '04:00 PM',
    duration: '8h',
    price: 750,
    rating: 4.5,
    amenities: ['AC', 'WiFi', 'Charging Port'],
    seatLayout: { rows: [], booked: [] },
    pickupPoints: [ { name: 'Mohakhali', time: '08:00 AM' }],
  },
    {
    id: '2',
    operator: 'Shyamoli NR Travels',
    from: 'Dhaka',
    to: 'Sylhet',
    class: 'business-ac',
    departureTime: '10:30 PM',
    arrivalTime: '06:30 AM',
    duration: '8h',
    price: 1200,
    rating: 4.8,
    amenities: ['AC', 'WiFi', 'Blanket', 'Water Bottle'],
    seatLayout: { rows: [], booked: [] },
    pickupPoints: [{ name: 'Arambagh', time: '10:30 PM' }],
  },
    {
    id: '3',
    operator: 'Green Line Paribahan',
    from: 'Chittagong',
    to: 'Dhaka',
    class: 'business-ac',
    departureTime: '09:00 AM',
    arrivalTime: '03:00 PM',
    duration: '6h',
    price: 1200,
    rating: 4.7,
    amenities: ['AC', 'WiFi', 'Snacks'],
    seatLayout: { rows: [], booked: [] },
    pickupPoints: [{ name: 'Dampara', time: '09:00 AM' }],
  },
    {
    id: '4',
    operator: 'Ena Transport (Pvt) Ltd',
    from: 'Sylhet',
    to: 'Dhaka',
    class: 'non-ac',
    departureTime: '11:00 PM',
    arrivalTime: '05:00 AM',
    duration: '6h',
    price: 600,
    rating: 4.2,
    amenities: ['WiFi'],
    seatLayout: { rows: [], booked: [] },
    pickupPoints: [{ name: 'Kadamtali Bus Stand', time: '11:00 PM' }],
  },
]


const mockBookings = [
  {
    pnr: 'SY123456',
    status: 'Paid' as BookingStatus,
    route: mockRoutes[0],
    departureDate: '2024-08-15T00:00:00.000Z',
    pickupPoint: 'Mohakhali',
    selectedSeats: ['A3', 'A4'],
    totalAmount: 1550,
    contactName: 'Test User',
    contactMobile: '01234567890',
  },
  {
    pnr: 'SY654321',
    status: 'Booked' as BookingStatus,
    route: mockRoutes[1],
    departureDate: '2024-08-20T00:00:00.000Z',
    pickupPoint: 'Arambagh',
    selectedSeats: ['C1'],
    totalAmount: 1200,
    contactName: 'Test User',
    contactMobile: '01234567890',
  },
  {
    pnr: 'SY987654',
    status: 'Canceled' as BookingStatus,
    route: mockRoutes[2],
    departureDate: '2024-07-25T00:00:00.000Z',
    pickupPoint: 'Dampara',
    selectedSeats: ['B2', 'B3'],
    totalAmount: 2400,
    contactName: 'Test User',
    contactMobile: '01234567890',
  },
    {
    pnr: 'SY246810',
    status: 'Expired' as BookingStatus,
    route: mockRoutes[3],
    departureDate: '2024-08-01T00:00:00.000Z',
    pickupPoint: 'Kadamtali Bus Stand',
    selectedSeats: ['D3'],
    totalAmount: 600,
    contactName: 'Test User',
    contactMobile: '01234567890',
  },
];

const statusColors: Record<BookingStatus, string> = {
    Booked: 'bg-blue-100 text-blue-800 border-blue-300',
    Paid: 'bg-green-100 text-green-800 border-green-300',
    Canceled: 'bg-red-100 text-red-800 border-red-300',
    Expired: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Reissued: 'bg-purple-100 text-purple-800 border-purple-300',
};


const BookingCard = ({ booking }: { booking: (typeof mockBookings)[0] }) => {
    const router = useRouter();

    const handleViewDetails = () => {
        sessionStorage.setItem(`booking-${booking.pnr}`, JSON.stringify(booking));
        router.push(`/invoice/${booking.pnr}`);
    }

    return (
      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between bg-muted/50 p-4">
          <div className="flex flex-col">
            <p className="text-sm text-muted-foreground">PNR Number</p>
            <p className="font-bold text-lg">{booking.pnr}</p>
          </div>
           <Badge className={cn("text-sm", statusColors[booking.status as BookingStatus])}>
            {booking.status}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
            <div>
                <p className="font-bold text-primary text-xl">{booking.route.operator}</p>
                <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <span className="capitalize">{booking.route.from}</span>
                    <ArrowRight className="w-5 h-5 text-primary" />
                    <span className="capitalize">{booking.route.to}</span>
                </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">Journey Date</p>
                        <p>{new Date(booking.departureDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">Departure</p>
                        <p>{booking.route.departureTime}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <Bus className="w-4 h-4 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">Pickup Point</p>
                        <p>{booking.pickupPoint}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <Armchair className="w-4 h-4 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">Seats</p>
                        <p>{booking.selectedSeats.join(', ')}</p>
                    </div>
                </div>
            </div>
        </CardContent>
        <CardFooter className="bg-muted/50 p-4 flex justify-between items-center">
            <div>
                <p className="text-sm text-muted-foreground">Total Fare</p>
                <p className="font-bold text-xl text-primary">BDT {booking.totalAmount.toLocaleString()}</p>
            </div>
            <Button onClick={handleViewDetails}>View Details</Button>
        </CardFooter>
      </Card>
    )
};

export default function MyBookingsPage() {
  const [activeFilter, setActiveFilter] = useState<BookingStatus | 'All'>('All');

  const filteredBookings = useMemo(() => {
    if (activeFilter === 'All') {
      return mockBookings;
    }
    return mockBookings.filter((booking) => booking.status === activeFilter);
  }, [activeFilter]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Filter Bookings</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 flex flex-wrap gap-2">
          {filterOptions.map(({ label, icon: Icon }) => (
            <Button
              key={label}
              variant={activeFilter === label ? 'default' : 'outline'}
              className={cn("gap-2", activeFilter !== label && "border-muted-foreground/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground")}
              onClick={() => setActiveFilter(label as BookingStatus | 'All')}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}
        </CardContent>
      </Card>

        <div className="mt-8 grid grid-cols-1 gap-6">
            {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                    <BookingCard key={booking.pnr} booking={booking} />
                ))
            ) : (
                <div className="text-center py-16 col-span-full">
                    <h2 className="text-2xl font-semibold mb-2">No Bookings Found</h2>
                    <p className="text-muted-foreground">
                        You have no bookings with the status "{activeFilter}".
                    </p>
                </div>
            )}
        </div>
    </div>
  );
}
