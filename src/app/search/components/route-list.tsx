import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Star, Wifi, Zap, Wind } from 'lucide-react';
import type { BusRoute } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface RouteListProps {
  routes: BusRoute[];
}

const AmenityIcon = ({ amenity }: { amenity: string }) => {
  switch (amenity.toLowerCase()) {
    case 'wifi':
      return <Wifi className="w-4 h-4" />;
    case 'ac':
      return <Wind className="w-4 h-4" />;
    case 'charging port':
      return <Zap className="w-4 h-4" />;
    default:
      return null;
  }
};

export default function RouteList({ routes }: RouteListProps) {
  if (routes.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-2">No Buses Found</h2>
        <p className="text-muted-foreground">
          Sorry, there are no available buses for the selected route and date.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {routes.map((route) => (
        <Card key={route.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-3">
              <h3 className="font-bold text-lg">{route.operator}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{route.rating}</span>
              </div>
            </div>
            
            <div className="md:col-span-2 flex flex-col items-start md:items-center">
              <p className="text-lg font-semibold">{route.departureTime}</p>
              <p className="text-sm text-muted-foreground capitalize">{route.from}</p>
            </div>
            
            <div className="md:col-span-2 flex flex-col items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{route.duration}</span>
              </div>
              <div className="w-24 h-px bg-border my-1 hidden md:block"></div>
              <div className="flex gap-2">
                {route.amenities.map((amenity) => (
                    <Badge key={amenity} variant="outline" className="flex items-center gap-1 p-1 px-2">
                        <AmenityIcon amenity={amenity} />
                        <span className="text-xs">{amenity}</span>
                    </Badge>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col items-start md:items-center">
              <p className="text-lg font-semibold">{route.arrivalTime}</p>
              <p className="text-sm text-muted-foreground capitalize">{route.to}</p>
            </div>

            <div className="md:col-span-3 flex flex-col md:flex-row items-center justify-end gap-4">
              <div className="text-right">
                <p className="text-xl font-bold text-primary">BDT {route.price}</p>
                <p className="text-xs text-muted-foreground">per seat</p>
              </div>
              <Link href={`/booking/${route.id}`} className="w-full md:w-auto">
                <Button className="w-full md:w-auto">
                  View Seats <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

          </CardContent>
        </Card>
      ))}
    </div>
  );
}
