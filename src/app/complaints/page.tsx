
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { Loader2, PlusCircle, MessageSquare, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Complaint } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const complaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
});

export default function ComplaintsPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof complaintSchema>>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !userLoading && !user) {
      router.replace('/');
    }
  }, [user, userLoading, router, isClient]);

  useEffect(() => {
    if (isClient && user) {
      setLoading(true);
      const userComplaints = JSON.parse(localStorage.getItem(`complaints_${user.uid}`) || '[]');
      userComplaints.sort((a: Complaint, b: Complaint) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setComplaints(userComplaints);
      setLoading(false);
    }
  }, [isClient, user]);

  const onSubmit = (values: z.infer<typeof complaintSchema>) => {
    if (!user || !isClient) return;
    setIsSubmitting(true);

    const newComplaint: Complaint = {
      id: `CMP-${Date.now()}`,
      title: values.title,
      description: values.description,
      status: 'Open',
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: `MSG-${Date.now()}`,
          text: values.description,
          sender: 'user',
          timestamp: new Date().toISOString(),
        }
      ]
    };
    
    setTimeout(() => {
      const updatedComplaints = [newComplaint, ...complaints];
      localStorage.setItem(`complaints_${user.uid}`, JSON.stringify(updatedComplaints));
      setComplaints(updatedComplaints);

      toast({
        title: 'Complaint Submitted',
        description: 'Your complaint has been received. We will get back to you shortly.',
      });
      
      form.reset();
      setIsSubmitting(false);
      setIsDialogOpen(false);
    }, 1000);
  };

  const getStatusBadgeVariant = (status: 'Open' | 'Answered' | 'Closed') => {
    switch (status) {
      case 'Open': return 'destructive';
      case 'Answered': return 'default';
      case 'Closed': return 'secondary';
      default: return 'outline';
    }
  }

  if (!isClient || userLoading || loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!user) return null;

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">My Complaints</h1>
          <p className="text-muted-foreground">Track your complaints and our responses.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Complaint
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit a New Complaint</DialogTitle>
              <DialogDescription>Please provide details about your issue. We will respond as soon as possible.</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="e.g., Late bus departure" {...form.register('title')} />
                {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe your issue in detail..." {...form.register('description')} />
                {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary" disabled={isSubmitting}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Complaint
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {complaints.length > 0 ? (
          complaints.map(complaint => (
            <Card key={complaint.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                    <span>{complaint.title}</span>
                    <Badge variant={getStatusBadgeVariant(complaint.status)}>{complaint.status}</Badge>
                </CardTitle>
                <CardDescription>
                  Complaint #{complaint.id} &bull; Submitted on {format(new Date(complaint.createdAt), 'PPP')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{complaint.description}</p>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button asChild variant="ghost">
                    <Link href={`/complaints/${complaint.id}`}>
                        View Details <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 border rounded-lg">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold mt-4">No Complaints Found</h2>
            <p className="text-muted-foreground mt-2">You haven't submitted any complaints yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
