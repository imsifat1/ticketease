
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown, Repeat } from "lucide-react";

import { CITIES } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z
  .object({
    origin: z.string().min(1, "Please select an origin city"),
    destination: z.string().min(1, "Please select a destination city"),
    date: z.date(),
  })
  .refine((data) => data.origin !== data.destination, {
    message: "Origin and destination cannot be the same",
    path: ["destination"],
  });

export default function RouteSearchForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [originOpen, setOriginOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const [originSearch, setOriginSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      origin: "",
      destination: "",
      date: new Date(),
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const formattedDate = format(values.date, "yyyy-MM-dd");
    const query = new URLSearchParams({
      from: values.origin,
      to: values.destination,
      date: formattedDate,
    });
    router.push(`/search?${query.toString()}`);
  }

  const handleSwap = () => {
    const origin = form.getValues("origin");
    const destination = form.getValues("destination");
    form.setValue("origin", destination);
    form.setValue("destination", origin);
  };

  if (isLoading) {
    return (
      <Card className="shadow-2xl">
        <CardContent className="p-6 text-center">
          <p className="animate-pulse text-lg font-semibold">
            Searching for available buses...
          </p>
        </CardContent>
      </Card>
    );
  }

  const filteredOrigin = CITIES.filter((city) =>
    city.toLowerCase().includes(originSearch.toLowerCase())
  );
  const filteredDestination = CITIES.filter((city) =>
    city.toLowerCase().includes(destinationSearch.toLowerCase())
  );

  return (
    <Card className="shadow-2xl max-w-5xl mx-auto">
      <CardContent className="p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_1fr_auto] gap-4 items-end"
          >
            {/* Origin */}
            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>From</FormLabel>
                  <Popover open={originOpen} onOpenChange={setOriginOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between text-left h-14 text-base",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value || "Select origin"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>

                    <PopoverContent
                      className="w-[--radix-popover-trigger-width] max-h-60 overflow-auto p-0"
                    >
                      <Command>
                        <CommandInput
                          placeholder="Search city..."
                          onValueChange={(v) => setOriginSearch(v)}
                        />
                        <CommandList>
                          {filteredOrigin.length === 0 ? (
                            <CommandEmpty>No city found.</CommandEmpty>
                          ) : (
                            <CommandGroup>
                              {filteredOrigin.map((city) => (
                                <CommandItem
                                  key={city}
                                  value={city}
                                  onSelect={() => {
                                    form.setValue("origin", city);
                                    setOriginOpen(false);
                                    setOriginSearch("");
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === city
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {city}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Swap Button */}
            <div className="flex justify-center items-center">
              <Button
                type="button"
                variant="outline"
                className="p-2 w-14 h-14 flex justify-center items-center hover:bg-accent hover:text-accent-foreground"
                onClick={handleSwap}
              >
                <Repeat className="h-5 w-5" />
              </Button>
            </div>

            {/* Destination */}
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>To</FormLabel>
                  <Popover
                    open={destinationOpen}
                    onOpenChange={setDestinationOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between text-left h-14 text-base",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value || "Select destination"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>

                    <PopoverContent
                      className="w-[--radix-popover-trigger-width] max-h-60 overflow-auto p-0"
                    >
                      <Command>
                        <CommandInput
                          placeholder="Search city..."
                          onValueChange={(v) => setDestinationSearch(v)}
                        />
                        <CommandList>
                          {filteredDestination.length === 0 ? (
                            <CommandEmpty>No city found.</CommandEmpty>
                          ) : (
                            <CommandGroup>
                              {filteredDestination.map((city) => (
                                <CommandItem
                                  key={city}
                                  value={city}
                                  onSelect={() => {
                                    form.setValue("destination", city);
                                    setDestinationOpen(false);
                                    setDestinationSearch("");
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === city
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {city}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Travel</FormLabel>
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-14 text-base",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(field.value, "PPP")
                            : "Pick a date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) field.onChange(date);
                          setDateOpen(false);
                        }}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <Button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-accent-foreground h-14 text-base"
            >
              Search
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
