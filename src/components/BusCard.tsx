import Link from "next/link";
import { ArrowRight, Bus, Clock, Tag, Armchair } from "lucide-react";
import type { Trip } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SeatSelector from "./SeatSelector";
import { Badge } from "./ui/badge";

interface BusCardProps {
  trip: Trip;
}

export default function BusCard({ trip }: BusCardProps) {
  const departureTime = new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const arrivalTime = new Date(trip.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const totalSeats = (trip.seatLayout.rows - trip.seatLayout.gapRows.length) * trip.seatLayout.cols;
  const availableSeats = totalSeats - trip.seatLayout.booked.length;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bus className="text-primary"/>
            <span>{trip.bus.name}</span>
          </div>
          <div className="text-2xl font-bold text-primary">
            ৳{trip.price.toFixed(2)}
          </div>
        </CardTitle>
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">{trip.bus.type}</div>
          <Badge variant={availableSeats > 5 ? "secondary" : "destructive"} className="flex items-center gap-2">
              <Armchair className="w-4 h-4" />
              <span>{availableSeats} seats available</span>
            </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 items-center gap-4">
          <div className="flex flex-col items-start">
            <div className="text-xl font-semibold">{departureTime}</div>
            <div className="text-muted-foreground">{trip.origin}</div>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="text-sm text-muted-foreground">{trip.duration}</div>
            <div className="w-full flex items-center">
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              <div className="flex-grow h-px bg-gray-300"></div>
              <ArrowRight className="h-4 w-4 text-gray-400 mx-1"/>
              <div className="flex-grow h-px bg-gray-300"></div>
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            </div>
          </div>
          <div className="flex flex-col items-end text-right">
            <div className="text-xl font-semibold">{arrivalTime}</div>
            <div className="text-muted-foreground">{trip.destination}</div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-6">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {trip.duration}</span>
                <span className="flex items-center gap-1"><Tag className="w-4 h-4" /> {trip.bus.type}</span>
            </div>
            <SeatSelector trip={trip} />
        </div>
      </CardContent>
    </Card>
  );
}
