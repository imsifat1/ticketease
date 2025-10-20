import { notFound } from 'next/navigation';
import { mockBusRoutes } from '@/lib/mock-data';
import type { BusRoute } from '@/lib/types';
import SeatSelection from './components/seat-selection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Clock, Star, MapPin } from 'lucide-react';

export default function BookingPage({ params }: { params: { routeId: string } }) {
  const route: BusRoute | undefined = mockBusRoutes.find(
    (r) => r.id === params.routeId
  );

  if (!route) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SeatSelection route={route} />
        </div>
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="font-headline">Journey Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-bold text-lg">{route.operator}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>{route.rating} Average Rating</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold capitalize">{route.from}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-primary" />
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold capitalize">{route.to}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm border-t pt-4">
                <div>
                    <p className="text-muted-foreground">Departure</p>
                    <p className="font-semibold">{route.departureTime}</p>
                </div>
                <div className="text-center">
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-semibold flex items-center gap-1"><Clock className="w-3 h-3"/>{route.duration}</p>
                </div>
                <div className="text-right">
                    <p className="text-muted-foreground">Arrival</p>
                    <p className="font-semibold">{route.arrivalTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
