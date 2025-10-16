"use client";

import { useState } from "react";
import { Wand2, Loader2 } from "lucide-react";
import { getAiRouteSuggestions } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { RouteSuggestionOutput } from "@/ai/flows/route-suggestion";
import type { Trip } from "@/lib/types";

type AiRouteSuggestorProps = {
  searchParams: { from?: string; to?: string; date?: string };
  firstTrip?: Trip;
};

export default function AiRouteSuggestor({ searchParams, firstTrip }: AiRouteSuggestorProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<RouteSuggestionOutput | null>(null);

  const [traffic, setTraffic] = useState("Moderate");
  const [weather, setWeather] = useState("Clear");
  const [preference, setPreference] = useState("Fastest route");

  const handleSuggestion = async () => {
    if (!searchParams.from || !searchParams.to || !searchParams.date) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Cannot get suggestions without origin, destination, and date.",
      });
      return;
    }

    setIsLoading(true);
    setSuggestions(null);

    const input = {
      origin: searchParams.from,
      destination: searchParams.to,
      departureDate: searchParams.date,
      departureTime: firstTrip ? new Date(firstTrip.departureTime).toTimeString().substring(0, 5) : "09:00",
      trafficConditions: traffic,
      weatherConditions: weather,
      userPreferences: preference,
    };

    const result = await getAiRouteSuggestions(input);

    if (result.success && result.data) {
      setSuggestions(result.data);
    } else {
      toast({
        variant: "destructive",
        title: "AI Suggestion Failed",
        description: result.error || "An unknown error occurred.",
      });
    }

    setIsLoading(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Wand2 className="mr-2 h-4 w-4" /> AI Route Suggestions
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI-Powered Route Suggestions</DialogTitle>
          <DialogDescription>
            Let our AI find alternative routes based on traffic, weather, and your preferences.
          </DialogDescription>
        </DialogHeader>
        
        {!suggestions && !isLoading && (
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="traffic" className="text-right">
                Traffic
                </Label>
                <Select value={traffic} onValueChange={setTraffic}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select traffic conditions" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Light">Light</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                        <SelectItem value="Heavy">Heavy</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="weather" className="text-right">
                Weather
                </Label>
                <Select value={weather} onValueChange={setWeather}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select weather conditions" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Clear">Clear</SelectItem>
                        <SelectItem value="Rainy">Rainy</SelectItem>
                        <SelectItem value="Snowy">Snowy</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="preference" className="text-right">
                Preference
                </Label>
                <Select value={preference} onValueChange={setPreference}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select your preference" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Fastest route">Fastest route</SelectItem>
                        <SelectItem value="Cheapest route">Cheapest route</SelectItem>
                        <SelectItem value="Fewest transfers">Fewest transfers</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4">Our AI is thinking...</p>
          </div>
        )}

        {suggestions && (
          <div className="py-4 space-y-4">
            <h4 className="font-semibold">Reasoning:</h4>
            <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-md">{suggestions.reasoning}</p>
            {suggestions.shouldSuggestAlternatives && suggestions.alternativeRoutes.length > 0 && (
                <div>
                    <h4 className="font-semibold mt-4 mb-2">Alternative Routes:</h4>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                        {suggestions.alternativeRoutes.map((route, index) => (
                            <li key={index}>{route}</li>
                        ))}
                    </ul>
                </div>
            )}
          </div>
        )}

        <DialogFooter>
          {!suggestions ? (
            <Button onClick={handleSuggestion} disabled={isLoading} className="bg-accent hover:bg-accent/90">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</> : "Suggest Alternatives"}
            </Button>
          ) : (
            <Button onClick={() => { setSuggestions(null); setIsLoading(false); }}>
                Try Again
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
