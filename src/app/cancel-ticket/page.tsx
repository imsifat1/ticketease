
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2, XCircle } from 'lucide-react';

const cancelTicketSchema = z.object({
  pnr: z.string().min(1, 'Ticket/PNR Number is required.'),
  mobile: z.string().min(11, 'Mobile number must be 11 digits.').max(11, 'Mobile number must be 11 digits.'),
});

export default function CancelTicketPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof cancelTicketSchema>>({
    resolver: zodResolver(cancelTicketSchema),
    defaultValues: {
      pnr: '',
      mobile: '',
    },
  });

  async function onSubmit(values: z.infer<typeof cancelTicketSchema>) {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log(values);
    
    toast({
      title: 'Cancellation Request Sent',
      description: `Your request to cancel ticket ${values.pnr} has been received. You will be notified shortly.`,
    });

    form.reset();
    setIsLoading(false);
  }

  return (
    <div className="container py-12 max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-headline flex items-center justify-center gap-2">
            <XCircle className="w-8 h-8 text-destructive" />
            Cancel Your Ticket
          </CardTitle>
          <CardDescription>
            Verify your details, and cancel your tickets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="pnr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ticket/PNR Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your PNR number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Enter the mobile number used for booking" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading} variant="destructive">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  'Cancel Ticket'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
