
import { Timestamp } from "firebase/firestore";

export interface Seat {
  id: string;
  isAvailable: boolean;
}

export interface PickupPoint {
  name: string;
  time: string;
}

export type BookingStatus = 'Booked' | 'Paid' | 'Canceled' | 'Expired' | 'Reissued';

export interface Trip {
  id: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  bus: {
    name: string;
    type: string;
  };
  seatLayout: {
    rows: number;
    cols: number;
    aisleCol: number;
    gapRows: number[];
    booked: string[];
  };
  pickupPoints: PickupPoint[];
}

export interface Passenger {
  name: string;
  gender: "Male" | "Female" | "";
}

export interface Booking {
  id: string;
  trip: Trip;
  passengers: Passenger[];
  seats: string[];
  pickupPoint: string;
  contactName: string;
  contactMobile: string;
  subTotal: number;
  processingFee: number;
  discount: number;
  vat: number;
  totalPrice: number;
  bookingDate: string | Timestamp;
  bookedBy: string;
  userPhoneNumber: string | null;
  status: BookingStatus;
}

export interface ComplaintMessage {
    id: string;
    text: string;
    sender: 'user' | 'admin';
    timestamp: string;
}

export interface Complaint {
    id: string;
    title: string;
    description: string;
    status: 'Open' | 'Answered' | 'Closed';
    createdAt: string;
    messages: ComplaintMessage[];
}
    
