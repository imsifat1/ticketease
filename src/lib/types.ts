import type { ClassFilter } from "@/app/search/page";

export type SeatStatus = 'available' | 'booked' | 'selected';

export type Seat = {
  id: string;
  status: SeatStatus;
};

export type PickupPoint = {
  name: string;
  time: string;
};

export type BusRoute = {
  id: string;
  operator: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  rating: number;
  amenities: string[];
  class: ClassFilter;
  seatLayout: {
    rows: string[][];
    booked: string[];
  };
  pickupPoints: PickupPoint[];
};


export type BookingStatus = 'Booked' | 'Paid' | 'Canceled' | 'Expired' | 'Reissued';

export type Booking = {
    pnr: string;
    status: BookingStatus;
    route: BusRoute;
    departureDate: string;
    pickupPoint: string;
    selectedSeats: string[];
    totalAmount: number;
    contactName: string;
    contactMobile: string;
    customerId: string; // Usually the mobile number or a user ID
}

export type SeatLock = {
    lockId: string;
    busId: string;
    seatNumbers: string[];
    customerId: string;
    expiresAt: number; // Unix timestamp
};

export type Wallet = {
    customerId: string;
    balance: number;
    rewardPoints: number;
};
