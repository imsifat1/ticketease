import { getTripById } from "@/lib/data";
import BookingSummary from "@/components/BookingSummary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

type SummaryPageProps = {
  params: {
    tripId: string;
  };
};

export default function SummaryPage({ params }: SummaryPageProps) {
  const trip = getTripById(params.tripId);

  if (!trip) {
    return (
        <div className="container py-8">
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Trip Not Found</AlertTitle>
                <AlertDescription>
                    The requested trip could not be found. Please go back and try again.
                </AlertDescription>
            </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-headline">Booking Summary</h1>
        <p className="text-muted-foreground">
          You have 4 minutes to complete your booking.
        </p>
      </div>
      <BookingSummary trip={trip} />
    </div>
  );
}
