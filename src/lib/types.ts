import type { ClassFilter } from "@/app/search/page";

export type SeatStatus = 'available' | 'booked' | 'selected';

export type Seat = {
  id: string;
  status: SeatStatus;
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
  pickupPoints: string[];
};
